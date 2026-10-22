#!/usr/bin/env node
//
// First-run setup wizard for the Bitrix24 WhatsApp Connector.
//
//   npm run setup              interactive (TTY)
//   npm run setup -- --yes     accept defaults, prompt only for what has none
//   npm run setup -- --non-interactive
//                              fail with a list of missing env vars instead of prompting
//
// Takes a fresh clone to a deployed, healthy Worker: preflight (Node 20+, Cloudflare auth),
// D1 / R2 / queue creation, generated secrets, wrangler.jsonc patching, schema apply,
// first deploy, secret upload, health check - then prints the three Bitrix24 Market URL
// fields to paste. Idempotent: re-running detects existing resources, reuses secrets from
// .deploy.env and patches nothing that is already correct.
//
// Zero dependencies - node:readline/promises, node:crypto, node:fs, node:child_process.

import { randomBytes } from 'node:crypto';
import {
  appendFileSync,
  chmodSync,
  existsSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const REPO_DIR = path.resolve(new URL('.', import.meta.url).pathname, '..');
process.chdir(REPO_DIR);

const WORKER_NAME = 'bitrix-whatsapp-connector';
const D1_NAME = 'bitrix_whatsapp';
const R2_BUCKET = 'bwac-audio-staging';
// The two DLQs must exist BEFORE the first deploy that references them as a dead_letter_queue
// target - wrangler deploy does not auto-create a queue that only appears in that role, and
// the failure kills the whole deploy. Creating all four here makes that gotcha impossible.
const QUEUES = ['bwac-inbound', 'bwac-outbound', 'bwac-inbound-dlq', 'bwac-outbound-dlq'];

const WRANGLER_JS = path.join(REPO_DIR, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const WRANGLER = existsSync(WRANGLER_JS)
  ? { cmd: process.execPath, args: [WRANGLER_JS] }
  : { cmd: 'npx', args: ['wrangler'] };

const SECRETS_IN_ORDER = [
  'BITRIX_CLIENT_SECRET',
  'APP_SECRET',
  'TOKEN_ENC_KEY',
  'ADMIN_SECRET',
  'WASENDER_MASTER_TOKEN',
  'EDGE_SECRET', // only uploaded when edge auth was chosen
];

// ---------------------------------------------------------------------------------------------
// output helpers
// ---------------------------------------------------------------------------------------------

const esc = (code) => `\x1b[${code}m`;
const bold = (s) => `${esc(1)}${s}${esc(0)}`;
const dim = (s) => `${esc(2)}${s}${esc(0)}`;
const red = (s) => `${esc(31)}${s}${esc(0)}`;
const green = (s) => `${esc(32)}${s}${esc(0)}`;
const yellow = (s) => `${esc(33)}${s}${esc(0)}`;

let stepNo = 0;
const STEP_TOTAL = 8;
const step = (msg) => {
  stepNo += 1;
  console.log(`\n${bold(`${stepNo}/${STEP_TOTAL}  ${msg}`)}`);
};
const info = (msg) => console.log(`  ${msg}`);
const ok = (msg) => console.log(`  ${green('✓')} ${msg}`);
const warn = (msg) => console.log(`  ${yellow('!')} ${msg}`);

class SetupError extends Error {
  constructor(message, recovery) {
    super(message);
    this.recovery = recovery;
  }
}

const die = (msg, recovery) => {
  console.error(`\n${red('✗')} ${msg}`);
  if (recovery) console.error(`\n  ${bold('Recovery:')} ${recovery}`);
  console.error(`  ${dim('Nothing else was touched; `npm run setup` is safe to re-run (idempotent).')}`);
  process.exit(1);
};

// ---------------------------------------------------------------------------------------------
// small utilities
// ---------------------------------------------------------------------------------------------

const isTTY = process.stdin.isTTY === true;

/** Never print a secret: show only its shape. */
const shape = (v) => (v ? `(set, ${v.length} chars)` : '(not set)');

/** Redact a value out of captured output before it is printed anywhere. */
const redact = (text, ...secrets) =>
  secrets.filter(Boolean).reduce((acc, s) => acc.split(s).join('***'), text);

const hex = (bytes) => randomBytes(bytes).toString('hex');
const b64 = (bytes) => randomBytes(bytes).toString('base64');

/** Parse a KEY="value" / KEY=value env file into a plain object. */
function parseEnvFile(text) {
  const out = {};
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (val.startsWith('"') && val.endsWith('"') && val.length >= 2) {
      val = val.slice(1, -1).replace(/\\(["\\$`])/g, '$1');
    }
    out[key] = val;
  }
  return out;
}

/** Shell-safe double-quoted value for .deploy.env (deploy.sh sources it with `set -a`). */
function shQuote(v) {
  return `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$/g, '\\$').replace(/`/g, '\\`')}"`;
}

/** Run a command synchronously; never throws, returns { code, out }. `input` goes to stdin. */
function run(cmd, args, { input = '', env = {} } = {}) {
  const res = spawnSync(cmd, args, {
    cwd: REPO_DIR,
    encoding: 'utf8',
    input,
    timeout: 600_000,
    maxBuffer: 16 * 1024 * 1024,
    env: {
      ...process.env,
      CI: '1', // wrangler: never prompt; a prompt gets EOF and fails cleanly instead of hanging
      WRANGLER_SEND_METRICS: 'false',
      CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN || '',
      CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || '',
      ...env,
    },
  });
  return {
    code: res.status ?? 1,
    out: `${res.stdout ?? ''}${res.stderr ?? ''}`,
  };
}

const wrangler = (args, opts) => run(WRANGLER.cmd, [...WRANGLER.args, ...args], opts);
const npm = (args, opts) => run(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, opts);

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/** Parse a D1 database id, preferring the labeled field so an unrelated UUID cannot win. */
const parseD1Id = (text) => {
  const labeled = text.match(/database_id["'\s:=]+([0-9a-f]{8}-[0-9a-f-]{27})/i);
  if (labeled) return labeled[1];
  const uuids = [...new Set(text.match(new RegExp(UUID_RE, 'g')) ?? [])];
  return uuids.length === 1 ? uuids[0] : null;
};

// ---------------------------------------------------------------------------------------------
// prompting (TTY only; every value is also reachable via flag/env)
// ---------------------------------------------------------------------------------------------

let activeRl = null;

async function ask(label, { def = '', secret = false } = {}) {
  if (!isTTY) return def;
  activeRl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  // A secret default is never echoed - only the fact that one is already set.
  const suffix = def ? dim(secret ? ' (already set; Enter keeps it)' : ` [${def}]`) : '';
  let answer;
  if (secret) {
    process.stdout.write(`  ${label}${suffix}: `);
    activeRl._writeToOutput = (str) => {
      // Mask typed characters; keep the newline so the cursor advances on Enter.
      if (str.includes('\n') || str.includes('\r')) process.stdout.write('\n');
    };
    answer = (await activeRl.question('')).trim();
  } else {
    answer = (await activeRl.question(`  ${label}${suffix}: `)).trim();
  }
  activeRl.close();
  activeRl = null;
  return answer || def;
}

async function askYesNo(label, def) {
  if (!isTTY) return def;
  const answer = (await ask(`${label} ${def ? '[Y/n]' : '[y/N]'}`, { def: '' })).toLowerCase();
  if (!answer) return def;
  return answer.startsWith('y');
}

// ---------------------------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------------------------

const FLAG_ALIASES = {
  '--yes': 'yes',
  '-y': 'yes',
  '--non-interactive': 'nonInteractive',
  '--help': 'help',
  '-h': 'help',
  '--account-id': 'accountId',
  '--public-url': 'publicUrl',
  '--bitrix-client-id': 'bitrixClientId',
  '--bitrix-client-secret': 'bitrixClientSecret',
  '--wasender-master-token': 'wasenderMasterToken',
  '--edge-auth': 'edgeAuth',
  '--edge-secret': 'edgeSecret',
  '--brand-support-url': 'brandSupportUrl',
};

function usage() {
  console.log(`${bold('Usage:')} npm run setup -- [options]   (or: node scripts/setup.mjs)

Interactive first-run wizard: Cloudflare resources, generated secrets, wrangler.jsonc
patching, first deploy, health check, then the Bitrix24 Market registration card.

${bold('Options')}
  --yes                       accept defaults; prompt only for required values with no default
  --non-interactive           never prompt; fail listing any missing env vars (exit 1)
  --account-id <id>           Cloudflare account id
  --public-url <url>          https:// URL the Worker is reached at (workers.dev or custom)
  --bitrix-client-id <id>     Bitrix24 Market app client id
  --bitrix-client-secret <s>  Bitrix24 Market app client secret
  --wasender-master-token <t> WasenderAPI personal access token
  --edge-auth <yes|no>        a reverse proxy fronts the Worker (sets EDGE_SECRET)
  --edge-secret <s>           EDGE_SECRET value (implies --edge-auth yes)
  --brand-support-url <url>   optional white-label support link
  -h, --help                  show this help

${bold('Environment variables (same names, used when the flag is absent)')}
  CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, PUBLIC_URL, BITRIX_CLIENT_ID,
  BITRIX_CLIENT_SECRET, WASENDER_MASTER_TOKEN, EDGE_AUTH, EDGE_SECRET, BRAND_SUPPORT_URL

Existing values in .deploy.env are picked up automatically, so a re-run is idempotent:
secrets are reused (regenerating TOKEN_ENC_KEY would make stored tokens unrecoverable) and
already-created resources are detected instead of failing.

${bold('Examples')}
  npm run setup                                   # interactive
  npm run setup -- --yes                          # defaults + env vars only
  CLOUDFLARE_API_TOKEN=... BITRIX_CLIENT_ID=... \\
    npm run setup -- --non-interactive            # CI / scripted`);
}

function parseArgs(argv) {
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const key = FLAG_ALIASES[arg];
    if (!key) die(`Unknown option: ${arg}`, 'run `npm run setup -- --help` for the flag list');
    if (key === 'yes' || key === 'nonInteractive' || key === 'help') {
      flags[key] = true;
      continue;
    }
    const value = argv[i + 1];
    if (value === undefined || value.startsWith('-')) die(`Flag ${arg} needs a value`, 'see --help');
    flags[key] = value;
    i += 1;
  }
  return flags;
}

// ---------------------------------------------------------------------------------------------
// wrangler.jsonc patching (careful string patch - the file is JSONC with comments, so it is
// deliberately NOT round-tripped through JSON.parse: that would strip every comment and
// reformat the file, and this file's comments carry operational knowledge)
// ---------------------------------------------------------------------------------------------

function readJsonc() {
  const file = path.join(REPO_DIR, 'wrangler.jsonc');
  if (!existsSync(file)) die('wrangler.jsonc not found - run this from the repo root', 'git status');
  return { file, text: readFileSync(file, 'utf8') };
}

function jsoncCurrent(text, key) {
  const m = text.match(new RegExp(`"${key}":\\s*"([^"]*)"`));
  return m ? m[1] : null;
}

const isPlaceholder = (v) => !v || v.startsWith('YOUR_') || v.startsWith('REPLACE_WITH_');

/**
 * Replace a single-line "key": "value" occurrence, refusing anything ambiguous.
 * `expectedCount` guards against a regex that silently matches the wrong line.
 */
function patchJsoncValue(text, key, newValue, { count = 1 } = {}) {
  const re = new RegExp(`("${key}":\\s*")[^"]*(")`, 'g');
  const matches = [...text.matchAll(re)];
  if (matches.length !== count) {
    throw new SetupError(
      `wrangler.jsonc: expected ${count} "${key}" field(s), found ${matches.length}`,
      `edit ${path.relative(REPO_DIR, 'wrangler.jsonc')} by hand, then re-run npm run setup`,
    );
  }
  return text.replace(re, `$1${newValue.replace(/\$/g, '$$$$')}$2`);
}

/** Apply all pending patches at once and print a unified-style diff of what changed. */
function applyJsoncPatches(file, original, patches) {
  let next = original;
  for (const p of patches) next = patchJsoncValue(next, p.key, p.value);
  if (next === original) return false;
  const before = original.split('\n');
  const after = next.split('\n');
  console.log(`  ${dim('wrangler.jsonc diff:')}`);
  for (let i = 0; i < before.length; i += 1) {
    if (before[i] !== after[i]) {
      console.log(`    ${red(`- ${before[i].trim()}`)}`);
      console.log(`    ${green(`+ ${after[i].trim()}`)}`);
    }
  }
  writeFileSync(file, next);
  return true;
}

// ---------------------------------------------------------------------------------------------
// Cloudflare resource helpers - every one of them is idempotent: try to create, and if that
// fails, verify the resource already exists before calling it success.
// ---------------------------------------------------------------------------------------------

async function fetchWorkersSubdomain(accountId, token) {
  if (!token) return null;
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/subdomain`,
      { headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15_000) },
    );
    const body = await res.json();
    return body?.success && body?.result?.subdomain ? body.result.subdomain : null;
  } catch {
    return null;
  }
}

function ensureD1() {
  // info first (read-only): an existing database never needs creating.
  const existing = wrangler(['d1', 'info', D1_NAME]);
  if (existing.code === 0) {
    const id = parseD1Id(existing.out);
    if (id) {
      ok(`D1 database ${D1_NAME} already exists`);
      return id;
    }
  }
  const created = wrangler(['d1', 'create', D1_NAME]);
  const id = parseD1Id(created.out);
  if (!id) {
    const check = wrangler(['d1', 'info', D1_NAME]);
    const fallback = parseD1Id(check.out);
    if (check.code === 0 && fallback) {
      ok(`D1 database ${D1_NAME} already exists`);
      return fallback;
    }
    throw new SetupError(
      `could not create or find the D1 database ${D1_NAME}`,
      `run \`npx wrangler d1 list\` and paste the id into wrangler.jsonc's database_id, then re-run`,
    );
  }
  ok(`created D1 database ${D1_NAME} (${id})`);
  return id;
}

function ensureR2Bucket() {
  const created = wrangler(['r2', 'bucket', 'create', R2_BUCKET]);
  if (created.code === 0) {
    ok(`created R2 bucket ${R2_BUCKET}`);
    return;
  }
  const list = wrangler(['r2', 'bucket', 'list']);
  if (list.code === 0 && new RegExp(`(^|\\s|")${R2_BUCKET}(\\s|"|$)`, 'm').test(list.out)) {
    ok(`R2 bucket ${R2_BUCKET} already exists`);
    return;
  }
  throw new SetupError(
    `could not create the R2 bucket ${R2_BUCKET}`,
    `create it in the Cloudflare dashboard (R2 → Buckets → ${R2_BUCKET}) or fix the API token (needs R2:Edit), then re-run`,
  );
}

function ensureQueues() {
  const existing = new Set();
  const list = wrangler(['queues', 'list']);
  if (list.code === 0) {
    for (const q of QUEUES) if (list.out.includes(q)) existing.add(q);
  }
  for (const q of QUEUES) {
    const created = wrangler(['queues', 'create', q]);
    if (created.code === 0) {
      ok(`created queue ${q}`);
      continue;
    }
    if (existing.has(q) || wrangler(['queues', 'info', q]).code === 0) {
      ok(`queue ${q} already exists`);
      continue;
    }
    throw new SetupError(
      `could not create the queue ${q}`,
      `run \`npx wrangler queues create ${q}\` (needs Queues:Edit), then re-run. All four queues must exist before the first deploy: wrangler does not auto-create a queue that is only referenced as a dead_letter_queue target`,
    );
  }
}

function putSecret(name, value) {
  const res = wrangler(['secret', 'put', name], { input: value });
  if (res.code !== 0) {
    throw new SetupError(
      `wrangler secret put ${name} failed:\n${redact(res.out, value).trim()}`,
      `after fixing the cause, set it by hand: run \`npx wrangler secret put ${name}\` and paste the value from .deploy.env (the value itself is never printed here)`,
    );
  }
  ok(`secret ${name} set`);
}

// ---------------------------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------------------------

async function main() {
  const flags = parseArgs(process.argv.slice(2));
  if (flags.help) {
    usage();
    return;
  }
  const autoYes = flags.yes === true;
  const nonInteractive = flags.nonInteractive === true || !isTTY;

  console.log(`\n${bold('Bitrix24 WhatsApp Connector - first-run setup')}`);
  console.log(dim(`  repo: ${REPO_DIR}`));

  // --- merge an existing .deploy.env into the environment (never overriding real env/flags),
  // so every value survives a re-run and deploy.sh keeps working after the wizard.
  const envFile = path.join(REPO_DIR, '.deploy.env');
  const existingEnv = existsSync(envFile) ? parseEnvFile(readFileSync(envFile, 'utf8')) : {};
  for (const [k, v] of Object.entries(existingEnv)) {
    if (process.env[k] === undefined && v) process.env[k] = v;
  }

  // --- resolve: flag > env (incl. merged .deploy.env) > wrangler.jsonc > derived default.
  const source = (flagKey, envKey) => flags[flagKey] ?? process.env[envKey] ?? undefined;
  const cfg = {
    accountId: source('accountId', 'CLOUDFLARE_ACCOUNT_ID'),
    publicUrl: source('publicUrl', 'PUBLIC_URL'),
    bitrixClientId: source('bitrixClientId', 'BITRIX_CLIENT_ID'),
    bitrixClientSecret: source('bitrixClientSecret', 'BITRIX_CLIENT_SECRET'),
    wasenderMasterToken: source('wasenderMasterToken', 'WASENDER_MASTER_TOKEN'),
    edgeSecret: source('edgeSecret', 'EDGE_SECRET'),
    brandSupportUrl: source('brandSupportUrl', 'BRAND_SUPPORT_URL'),
  };
  const token = process.env.CLOUDFLARE_API_TOKEN || '';

  // Placeholders still sitting in wrangler.jsonc count as "unset" and become defaults.
  const { file: jsoncFile, text: jsoncText } = readJsonc();
  const currentAccountId = jsoncCurrent(jsoncText, 'account_id');
  if (!cfg.accountId && !isPlaceholder(currentAccountId)) cfg.accountId = currentAccountId;
  const currentClientId = jsoncCurrent(jsoncText, 'BITRIX_CLIENT_ID');
  if (!cfg.bitrixClientId && !isPlaceholder(currentClientId)) cfg.bitrixClientId = currentClientId;
  const currentBrandUrl = jsoncCurrent(jsoncText, 'BRAND_SUPPORT_URL') ?? '';
  if (cfg.brandSupportUrl === undefined) cfg.brandSupportUrl = currentBrandUrl;

  // --- preflight ---------------------------------------------------------------------------------
  console.log(`\n${bold('Preflight')}`);
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  if (nodeMajor < 20) {
    die(`Node ${process.versions.node} is too old (need >= 20)`, 'install Node 20 or 22 and re-run');
  }
  info(`node ${process.versions.node}`);

  if (npm(['--version']).code !== 0) die('npm is not available on PATH', 'install Node.js (npm ships with it)');
  if (!existsSync(path.join(REPO_DIR, 'node_modules', 'wrangler'))) {
    if (npm(['ci']).code !== 0) {
      die('npm ci failed', 'fix the install error above (check network/registry), then re-run');
    }
  }
  const wranglerVersion = wrangler(['--version']);
  if (wranglerVersion.code !== 0) {
    die('wrangler is not available', 'run `npm ci` (or install npx) so `wrangler` resolves, then re-run');
  }
  info(`wrangler ${wranglerVersion.out.trim().split('\n').pop().trim()}`);

  // In non-interactive mode validate everything derivable without auth FIRST, so a dry run
  // (`--non-interactive` with nothing set) fails with one complete list and zero side effects.
  if (nonInteractive) {
    const missing = [];
    if (!token) missing.push(['CLOUDFLARE_API_TOKEN', 'Cloudflare API token: Workers Scripts:Edit + D1:Edit + R2:Edit + Queues:Edit']);
    if (!cfg.accountId && !token) missing.push(['CLOUDFLARE_ACCOUNT_ID', 'Cloudflare account id (cannot be derived without the API token)']);
    if (!cfg.publicUrl && !token) missing.push(['PUBLIC_URL', 'https:// URL the Worker is reached at (cannot derive the workers.dev URL without the API token)']);
    if (!cfg.bitrixClientId) missing.push(['BITRIX_CLIENT_ID', 'Bitrix24 Market app client id']);
    if (!cfg.bitrixClientSecret) missing.push(['BITRIX_CLIENT_SECRET', 'Bitrix24 Market app client secret']);
    if (!cfg.wasenderMasterToken) missing.push(['WASENDER_MASTER_TOKEN', 'WasenderAPI personal access token']);
    if (missing.length > 0) {
      console.error(`\n${red('✗')} Missing required values (${nonInteractive ? 'non-interactive' : 'stdin is not a TTY'}):`);
      for (const [name, why] of missing) console.error(`    ${bold(name.padEnd(24))} ${why}`);
      console.error(
        `\n  Set them as environment variables or flags (${dim('see `npm run setup -- --help`')}).\n  Nothing was written.`,
      );
      process.exit(1);
    }
  }

  const whoami = wrangler(['whoami']);
  if (whoami.code !== 0 || /No API token found|not (logged|authenticated)/i.test(whoami.out)) {
    die(
      'Cloudflare authentication failed (wrangler whoami)',
      `export CLOUDFLARE_API_TOKEN=<token with Workers Scripts:Edit, D1:Edit, R2:Edit, Queues:Edit> (or put CLOUDFLARE_API_TOKEN="..." in ${path.join(REPO_DIR, '.deploy.env')}), then re-run. Get a token in the Cloudflare dashboard → My Profile → API Tokens.`,
    );
  }
  const whoamiAccounts = [...new Set(whoami.out.match(new RegExp(UUID_RE, 'g')) ?? [])];
  if (!cfg.accountId) {
    if (whoamiAccounts.length === 1) {
      cfg.accountId = whoamiAccounts[0];
      info(`account id ${dim(cfg.accountId)} (from wrangler whoami)`);
    } else if (whoamiAccounts.length > 1) {
      warn('this token can see several accounts:');
      whoamiAccounts.forEach((id, i) => info(`  [${i + 1}] ${id}`));
      cfg.accountId = await ask('Cloudflare account id to use', { def: whoamiAccounts[0] });
    }
  }
  process.env.CLOUDFLARE_ACCOUNT_ID = cfg.accountId || '';

  // --- collect the remaining answers --------------------------------------------------------------
  // Defaults first so the prompts can be minimal; secret prompts never echo what is typed.
  if (!cfg.publicUrl && token && cfg.accountId) {
    const subdomain = await fetchWorkersSubdomain(cfg.accountId, token);
    if (subdomain) cfg.defaultPublicUrl = `https://${WORKER_NAME}.${subdomain}.workers.dev`;
  }

  const need = (value) => value !== undefined && value !== '';
  const promptable = nonInteractive || autoYes;

  if (!need(cfg.publicUrl)) {
    if (promptable) {
      // --yes / non-interactive: never prompt, but the workers.dev URL is a safe default.
      if (!cfg.defaultPublicUrl) {
        die(
          'PUBLIC_URL is required',
          'no workers.dev default could be derived - pass --public-url https://... or set the PUBLIC_URL env var',
        );
      }
      cfg.publicUrl = cfg.defaultPublicUrl;
      info(`public URL ${cfg.publicUrl} ${dim('(workers.dev default; pass --public-url to override)')}`);
    } else {
      if (cfg.defaultPublicUrl) {
        info(`workers.dev default: ${cfg.defaultPublicUrl}`);
      } else {
        warn('could not derive a workers.dev URL (no subdomain registered, or the token cannot read it)');
        info('register one in the Cloudflare dashboard (Workers → Workers.dev subdomain) or enter a custom domain below');
      }
      cfg.publicUrl = await ask('Public URL (empty = workers.dev default)', {
        def: cfg.defaultPublicUrl ?? '',
      });
      if (!need(cfg.publicUrl)) die('A public URL is required', 're-run and enter one, or pass --public-url https://...');
    }
  }
  cfg.publicUrl = cfg.publicUrl.replace(/\/+$/, '');

  cfg.bitrixClientId = await ask('Bitrix24 client id (Market app version card)', {
    def: cfg.bitrixClientId ?? '',
  });
  if (promptable && !need(cfg.bitrixClientId)) {
    die('BITRIX_CLIENT_ID is required', 'pass --bitrix-client-id or set the BITRIX_CLIENT_ID env var');
  }

  cfg.bitrixClientSecret = await ask('Bitrix24 client secret', {
    def: cfg.bitrixClientSecret ?? '',
    secret: !need(cfg.bitrixClientSecret),
  });
  if (promptable && !need(cfg.bitrixClientSecret)) {
    die('BITRIX_CLIENT_SECRET is required', 'pass --bitrix-client-secret or set the env var');
  }

  cfg.wasenderMasterToken = await ask('WasenderAPI master token (personal access token)', {
    def: cfg.wasenderMasterToken ?? '',
    secret: !need(cfg.wasenderMasterToken),
  });
  if (promptable && !need(cfg.wasenderMasterToken)) {
    die('WASENDER_MASTER_TOKEN is required', 'pass --wasender-master-token or set the env var');
  }

  const edgeAuthFlag = (flags.edgeAuth ?? process.env.EDGE_AUTH ?? '').toLowerCase();
  let edgeAuth;
  if (need(cfg.edgeSecret)) edgeAuth = true;
  else if (edgeAuthFlag === 'yes' || edgeAuthFlag === 'y' || edgeAuthFlag === 'true') edgeAuth = true;
  else if (edgeAuthFlag === 'no' || edgeAuthFlag === 'n' || edgeAuthFlag === 'false') edgeAuth = false;
  else if (promptable) edgeAuth = false;
  else edgeAuth = await askYesNo('Will a reverse proxy (nginx) front this Worker?', false);
  if (edgeAuth && !need(cfg.edgeSecret)) {
    cfg.edgeSecret = hex(32);
    info('EDGE_SECRET generated');
  }

  if (cfg.brandSupportUrl === undefined) cfg.brandSupportUrl = '';
  if (!need(cfg.brandSupportUrl) && !promptable) {
    cfg.brandSupportUrl = await ask('Brand support URL (empty = keep default branding)', {
      def: cfg.brandSupportUrl,
    });
  }

  // --- generated secrets: never ask a human for entropy; reuse on re-run so nothing breaks ------
  const reuse = (envKey, gen) => process.env[envKey] || gen();
  cfg.appSecret = reuse('APP_SECRET', () => hex(32));
  cfg.tokenEncKey = reuse('TOKEN_ENC_KEY', () => b64(32)); // must be base64 of exactly 32 bytes
  cfg.adminSecret = reuse('ADMIN_SECRET', () => hex(32));
  if (process.env.APP_SECRET && process.env.TOKEN_ENC_KEY && process.env.ADMIN_SECRET) {
    info('generated secrets reused from .deploy.env (regenerating TOKEN_ENC_KEY would brick stored tokens)');
  }

  // --- confirmation (declining here leaves the repo and the Cloudflare account untouched) -----------
  console.log(`\n${bold('Plan')}`);
  info(`account        ${cfg.accountId}`);
  info(`public URL     ${cfg.publicUrl}`);
  info(`bitrix id      ${cfg.bitrixClientId}`);
  info(`client secret  ${shape(cfg.bitrixClientSecret)}`);
  info(`wasender token ${shape(cfg.wasenderMasterToken)}`);
  info(`edge auth      ${edgeAuth ? 'yes (EDGE_SECRET generated; must match the nginx config)' : 'no'}`);
  info(`brand support  ${cfg.brandSupportUrl || '(default)'}`);
  info(`generated      APP_SECRET ${shape(cfg.appSecret)}, TOKEN_ENC_KEY ${shape(cfg.tokenEncKey)}, ADMIN_SECRET ${shape(cfg.adminSecret)}`);
  info(`cloud          D1 ${D1_NAME}, R2 ${R2_BUCKET}, queues ${QUEUES.join(', ')}`);
  if (!autoYes && isTTY && !(await askYesNo('Proceed?', true))) {
    console.log(`\n${yellow('Aborted.')} Nothing was written, no Cloudflare resource was touched.`);
    process.exit(1);
  }

  // --- 1. wrangler.jsonc ------------------------------------------------------------------------
  step(`Patching ${bold('wrangler.jsonc')}`);
  const patches = [];
  const addPatch = (key, value) => {
    if (value && jsoncCurrent(jsoncText, key) !== value) patches.push({ key, value });
  };
  addPatch('account_id', cfg.accountId);
  addPatch('PUBLIC_URL', cfg.publicUrl);
  addPatch('BITRIX_CLIENT_ID', cfg.bitrixClientId);
  if (need(cfg.brandSupportUrl)) addPatch('BRAND_SUPPORT_URL', cfg.brandSupportUrl);
  if (patches.length === 0) {
    ok('already up to date');
  } else if (applyJsoncPatches(jsoncFile, jsoncText, patches)) {
    ok('written');
  }

  // --- 2. cloud resources ------------------------------------------------------------------------
  step('Creating Cloudflare resources (idempotent)');
  const databaseId = ensureD1();
  const dbIdCurrent = jsoncCurrent(readFileSync(jsoncFile, 'utf8'), 'database_id');
  if (dbIdCurrent !== databaseId) {
    applyJsoncPatches(jsoncFile, readFileSync(jsoncFile, 'utf8'), [{ key: 'database_id', value: databaseId }]);
    ok('database_id patched into wrangler.jsonc (no stop-and-re-run)');
  } else {
    ok('database_id already correct in wrangler.jsonc');
  }
  ensureR2Bucket();
  ensureQueues();

  // --- 3. schema -----------------------------------------------------------------------------------
  step(`Applying ${bold('schema.sql')} to the remote D1`);
  const migrate = wrangler(['d1', 'execute', D1_NAME, '--remote', '--file=./schema.sql', '--yes']);
  if (migrate.code !== 0) {
    throw new SetupError(
      `schema apply failed:\n${migrate.out.trim()}`,
      'run `npx wrangler d1 execute bitrix_whatsapp --remote --file=./schema.sql --yes` once the cause is fixed (every statement is IF NOT EXISTS, so it is safe to re-run)',
    );
  }
  ok('schema applied (every statement is IF NOT EXISTS)');

  // --- 4. .deploy.env -------------------------------------------------------------------------------
  step(`Writing ${bold('.deploy.env')} ${dim('(chmod 600, git-ignored)')}`);
  const lines = [
    '# Written by `npm run setup` (scripts/setup.mjs). Git-ignored, chmod 600. Never commit.',
    '# deploy.sh sources this file; rotate a value here and re-run `npm run setup` to re-upload it.',
    `CLOUDFLARE_ACCOUNT_ID=${shQuote(cfg.accountId)}`,
    `PUBLIC_URL=${shQuote(cfg.publicUrl)}`,
    `BITRIX_CLIENT_ID=${shQuote(cfg.bitrixClientId)}`,
    `BITRIX_CLIENT_SECRET=${shQuote(cfg.bitrixClientSecret)}`,
    `APP_SECRET=${shQuote(cfg.appSecret)}`,
    `TOKEN_ENC_KEY=${shQuote(cfg.tokenEncKey)}`,
    `ADMIN_SECRET=${shQuote(cfg.adminSecret)}`,
    `WASENDER_MASTER_TOKEN=${shQuote(cfg.wasenderMasterToken)}`,
  ];
  if (token) {
    lines.splice(1, 0, `CLOUDFLARE_API_TOKEN=${shQuote(token)}`);
  } else {
    // Authenticated via OAuth this session: nothing to persist, but deploy.sh requires the
    // variable, so say so loudly instead of letting it die later with a confusing message.
    warn('authenticated via OAuth: CLOUDFLARE_API_TOKEN is not in .deploy.env -');
    info('deploy.sh needs it. Create an API token (Workers Scripts:Edit, D1:Edit, R2:Edit,');
    info('Queues:Edit) and add CLOUDFLARE_API_TOKEN="..." to .deploy.env.');
  }
  if (edgeAuth) lines.push(`EDGE_SECRET=${shQuote(cfg.edgeSecret)}`);
  writeFileSync(envFile, `${lines.join('\n')}\n`, { mode: 0o600 });
  chmodSync(envFile, 0o600);
  const gitignore = readFileSync(path.join(REPO_DIR, '.gitignore'), 'utf8');
  if (!gitignore.split('\n').some((l) => l.trim() === '.deploy.env')) {
    appendFileSync(path.join(REPO_DIR, '.gitignore'), '\n.deploy.env\n');
    warn('.deploy.env was missing from .gitignore - added');
  }
  ok('.deploy.env written');

  // --- 5. dependencies + UI build --------------------------------------------------------------------
  step('Installing dependencies and building the UI');
  const lockMtime = statSync(path.join(REPO_DIR, 'package-lock.json')).mtimeMs;
  const installedMtime = existsSync(path.join(REPO_DIR, 'node_modules', '.package-lock.json'))
    ? statSync(path.join(REPO_DIR, 'node_modules', '.package-lock.json')).mtimeMs
    : 0;
  if (installedMtime >= lockMtime) {
    ok('node_modules is fresh, skipping npm ci');
  } else if (npm(['ci']).code !== 0) {
    throw new SetupError('npm ci failed', 'fix the install error above, then re-run npm run setup');
  } else {
    ok('npm ci complete');
  }
  if (npm(['run', 'ui:build']).code !== 0) {
    throw new SetupError('npm run ui:build failed', 'fix the build error above (try `npm run typecheck` for details), then re-run');
  }
  if (!existsSync(path.join(REPO_DIR, 'public', 'index.html'))) {
    throw new SetupError('ui build produced no public/index.html', 'run `npm run ui:build` and check its output');
  }
  ok('public/index.html built');

  // --- 6. deploy ---------------------------------------------------------------------------------------
  step(`Deploying the Worker ${bold(WORKER_NAME)}`);
  const deploy = wrangler(['deploy']);
  if (deploy.code !== 0) {
    throw new SetupError(
      `wrangler deploy failed:\n${deploy.out.trim()}`,
      'run `npx wrangler deploy` and read the error; common causes: a queue referenced only as a dead_letter_queue target does not exist (see DEPLOY.md), or the API token lacks Workers Scripts:Edit',
    );
  }
  ok('deployed');

  // --- 7. secrets ---------------------------------------------------------------------------------------
  // Uploaded after the first deploy on purpose: `wrangler secret put` needs an existing Worker
  // to attach the secret version to, and a brand-new one does not exist until step 6.
  step('Uploading Worker secrets');
  const secretValues = {
    BITRIX_CLIENT_SECRET: cfg.bitrixClientSecret,
    APP_SECRET: cfg.appSecret,
    TOKEN_ENC_KEY: cfg.tokenEncKey,
    ADMIN_SECRET: cfg.adminSecret,
    WASENDER_MASTER_TOKEN: cfg.wasenderMasterToken,
    EDGE_SECRET: cfg.edgeSecret,
  };
  for (const name of SECRETS_IN_ORDER) {
    if (name === 'EDGE_SECRET' && !edgeAuth) continue;
    if (!secretValues[name]) {
      // Allowed when the value was skipped interactively (e.g. the Bitrix app is not registered
      // yet): upload an empty secret would break the Worker, so leave it unset and say so.
      warn(`${name} is empty - skipped; fill it in .deploy.env and re-run to upload it`);
      continue;
    }
    putSecret(name, secretValues[name]);
  }

  // --- 8. health check ---------------------------------------------------------------------------------
  step('Health check');
  const healthUrl = `${cfg.publicUrl}/health`;
  let healthy = false;
  for (let attempt = 1; attempt <= 5 && !healthy; attempt += 1) {
    try {
      const res = await fetch(healthUrl, { signal: AbortSignal.timeout(15_000) });
      const body = await res.json().catch(() => null);
      if (res.ok && body?.ok) {
        healthy = true;
        ok(`${healthUrl} → ${JSON.stringify(body)}`);
        break;
      }
      warn(`attempt ${attempt}: ${healthUrl} answered ${res.status} without ok:true`);
    } catch (err) {
      warn(`attempt ${attempt}: ${healthUrl} unreachable (${err?.cause?.code ?? err?.name ?? 'error'})`);
    }
    if (attempt < 5) await new Promise((r) => setTimeout(r, 3000));
  }

  // --- the Bitrix24 side ---------------------------------------------------------------------------------
  const bar = '─'.repeat(74);
  console.log(`\n${bold(bar)}`);
  console.log(`${bold('Your Bitrix24 side')}`);
  console.log(dim('  Bitrix24 partner portal → Marketplace → your app → the version card'));
  console.log(bold(bar));
  info(`Application URL (loaded on every open)   → ${cfg.publicUrl}/`);
  info(`Install wizard URL (shown once)          → ${cfg.publicUrl}/install`);
  info(`Install-event callback (server-to-server) → ${cfg.publicUrl}/events/install`);
  info('Scope                                    → imopenlines, imconnector, im, crm');
  info('"Uses only API"                          → no (the app has an interface)');
  console.log('');
  info('Paste the client secret from the version card into .deploy.env');
  info('(BITRIX_CLIENT_SECRET) if you left it as a placeholder, then re-run');
  info('`npm run setup` - OAuth refresh dies about an hour after install without it.');
  info('Want your own branding? App UI → License tab issues a 14-day');
  info('white-label trial key.');
  console.log(`${bold(bar)}`);

  if (!healthy) {
    console.log(
      `\n${red('✗')} ${healthUrl} did not answer after 5 attempts.\n` +
        `  ${bold('Recovery:')} the Worker itself deployed. If you chose a custom domain, check its DNS\n` +
        `  and the nginx/TLS steps in DEPLOY.md, then verify with:\n` +
        `    curl -fsS ${cfg.publicUrl}/health\n` +
        `  or check the workers.dev URL directly with \`npx wrangler deployments list\`.`,
    );
    process.exit(1);
  }
  console.log(`\n${green('Done.')} Deployed and healthy. Use ${bold('./scripts/deploy.sh')} for every update from here.`);
  console.log(
    `${dim('  Commit and push the patched wrangler.jsonc before the next deploy.sh run,')}\n` +
      `${dim("  or its `git reset --hard origin/main` reverts the ids and the deploy fails.")}\n`,
  );
}

// Run only when invoked directly (`node scripts/setup.mjs`), so the pure helpers above can be
// imported by tests or ad-hoc checks without triggering the wizard.
const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (invokedDirectly) {
  main().catch((err) => {
    if (err instanceof SetupError) die(err.message, err.recovery);
    if (err?.name === 'AbortError' || err?.message?.includes('readline')) {
      console.log(`\n${yellow('Aborted.')} Nothing further was done; re-run \`npm run setup\`.`);
      process.exit(1);
    }
    die(err?.stack || String(err), 're-run `npm run setup` (idempotent); if it keeps failing, report the stack above');
  });
}

export { parseEnvFile, shQuote, parseD1Id, jsoncCurrent, patchJsoncValue };
