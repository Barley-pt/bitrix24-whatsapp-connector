#!/usr/bin/env bash
#
# Iterative deploy for Bitrix24 WhatsApp Connector. Run after every merge to main.
#
#   cd /opt/connector && ./scripts/deploy.sh
#
# Flags:
#   --migrate      also apply schema.sql to the remote D1 (safe: every statement is IF NOT EXISTS)
#   --skip-pull    deploy the working tree as-is, without touching git
#   --reexec       internal, set when the script relaunches itself after updating
#
# WARNING: without --skip-pull this does `git reset --hard origin/main` and DISCARDS any local
# change in the checkout. Configuration belongs in git, never hand-edited on the server.

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

BRANCH="main"
HEALTH_URL="https://YOUR_DOMAIN/health"

MIGRATE=0
SKIP_PULL=0
REEXEC=0
for arg in "$@"; do
  case "$arg" in
    --migrate) MIGRATE=1 ;;
    --skip-pull) SKIP_PULL=1 ;;
    --reexec) REEXEC=1 ;;
    *)
      printf 'Unknown flag: %s\n' "$arg" >&2
      exit 2
      ;;
  esac
done

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
info() { printf '  %s\n' "$*"; }
warn() { printf '\033[33m  ! %s\033[0m\n' "$*"; }
die() {
  printf '\033[31mx %s\033[0m\n' "$*" >&2
  exit 1
}

[ -f .deploy.env ] || die ".deploy.env is missing. See .deploy.env.example, or run bootstrap.sh."
# shellcheck disable=SC1091
set -a
. ./.deploy.env
set +a
[ -n "${CLOUDFLARE_API_TOKEN:-}" ] || die "CLOUDFLARE_API_TOKEN is empty in .deploy.env"

# --- 1. source ------------------------------------------------------------------------------
if [ "$SKIP_PULL" -eq 1 ]; then
  bold "1/5  Skipping pull (--skip-pull)"
else
  bold "1/5  Updating source"
  before="$(sha256sum scripts/deploy.sh | awk '{print $1}')"

  git fetch --prune origin
  git reset --hard "origin/$BRANCH"
  info "at $(git rev-parse --short HEAD) $(git log -1 --pretty=%s)"

  # If the pull changed this script, the running copy is stale. Hand over to the new one once.
  after="$(sha256sum scripts/deploy.sh | awk '{print $1}')"
  if [ "$before" != "$after" ] && [ "$REEXEC" -eq 0 ]; then
    info "deploy.sh changed, relaunching"
    reexec_args=(--reexec)
    if [ "$MIGRATE" -eq 1 ]; then
      reexec_args+=(--migrate)
    fi
    exec bash scripts/deploy.sh "${reexec_args[@]}"
  fi
fi

# --- 2. dependencies ------------------------------------------------------------------------
bold "2/5  Installing dependencies"
npm ci

# --- 3. checks and build --------------------------------------------------------------------
bold "3/5  Typecheck and build"

# npm test is deliberately absent: @cloudflare/vitest-pool-workers needs workerd, which does not
# start on this box. Tests are a pre-merge gate on a dev machine.
npm run typecheck
npm run ui:build
[ -f public/index.html ] || die "ui build produced no public/index.html"

if [ "$MIGRATE" -eq 1 ]; then
  info "Applying schema.sql to the remote database"
  npx wrangler d1 execute bitrix_whatsapp --remote --file=./schema.sql --yes
fi

# --- 4. deploy ------------------------------------------------------------------------------
bold "4/5  Deploying"
npx wrangler deploy

# --- 5. health ------------------------------------------------------------------------------
bold "5/5  Health check"

for attempt in 1 2 3 4 5; do
  if curl -fsS --max-time 10 "$HEALTH_URL" >/dev/null 2>&1; then
    info "$HEALTH_URL is up"
    bold "Deployed $(git rev-parse --short HEAD)"
    exit 0
  fi
  [ "$attempt" -lt 5 ] && sleep 3
done

warn "$HEALTH_URL did not answer after 5 attempts."
warn "The Worker deployed; check nginx (systemctl status nginx) and the workers.dev URL directly."
exit 1
