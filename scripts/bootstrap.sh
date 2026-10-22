#!/usr/bin/env bash
#
# First-time setup for Bitrix24 WhatsApp Connector. Run once per environment, then use scripts/deploy.sh.
#
#   cd /opt/connector && ./scripts/bootstrap.sh
#
# Idempotent: re-running it re-uploads secrets and redeploys, which is harmless. It stops with
# instructions if a one-time manual step is still outstanding.

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

WORKER_NAME="bitrix-whatsapp-connector"
D1_NAME="bitrix_whatsapp"
HEALTH_URL="https://YOUR_DOMAIN/health"

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
info() { printf '  %s\n' "$*"; }
warn() { printf '\033[33m  ! %s\033[0m\n' "$*"; }
die() {
  printf '\033[31mx %s\033[0m\n' "$*" >&2
  exit 1
}

# --- 0. environment -------------------------------------------------------------------------
bold "0/6  Checking environment"

command -v node >/dev/null || die "node is not installed"
command -v npm >/dev/null || die "npm is not installed"
command -v curl >/dev/null || die "curl is not installed"
info "node $(node --version)"

[ -f .deploy.env ] || die ".deploy.env is missing. Copy .deploy.env.example, fill it in, chmod 600."

# shellcheck disable=SC1091
set -a
. ./.deploy.env
set +a

[ -n "${CLOUDFLARE_API_TOKEN:-}" ] || die "CLOUDFLARE_API_TOKEN is empty in .deploy.env"
info "Cloudflare token loaded"

# --- 1. dependencies ------------------------------------------------------------------------
bold "1/6  Installing dependencies"
npm ci

# --- 2. D1 ----------------------------------------------------------------------------------
bold "2/6  Cloudflare D1"

# The database id must be committed: deploy.sh does `git reset --hard`, so an id hand-edited on
# the server is wiped on the next deploy.
if grep -q 'REPLACE_WITH_D1_DATABASE_ID' wrangler.jsonc; then
  warn "wrangler.jsonc still has the placeholder database id."
  info "Creating the database now. Copy the id it prints into wrangler.jsonc, commit and push,"
  info "then run this script again."
  echo
  npx wrangler d1 create "$D1_NAME" || warn "create failed (it may already exist; run: npx wrangler d1 list)"
  exit 1
fi

info "Applying schema.sql to the remote database"
npx wrangler d1 execute "$D1_NAME" --remote --file=./schema.sql --yes

# --- 3. secrets -----------------------------------------------------------------------------
bold "3/6  Worker secrets"

put_secret() {
  local name="$1" value="${2:-}"
  if [ -z "$value" ]; then
    warn "$name is empty in .deploy.env, skipping"
    return
  fi
  printf '%s' "$value" | npx wrangler secret put "$name" --name "$WORKER_NAME" >/dev/null
  info "$name set"
}

put_secret BITRIX_CLIENT_SECRET "${BITRIX_CLIENT_SECRET:-}"
put_secret APP_SECRET "${APP_SECRET:-}"
put_secret TOKEN_ENC_KEY "${TOKEN_ENC_KEY:-}"
put_secret EDGE_SECRET "${EDGE_SECRET:-}"
put_secret WASENDER_MASTER_TOKEN "${WASENDER_MASTER_TOKEN:-}"
put_secret ADMIN_SECRET "${ADMIN_SECRET:-}"

if grep -q 'REPLACE_WITH_BITRIX_CLIENT_ID' wrangler.jsonc; then
  warn "BITRIX_CLIENT_ID in wrangler.jsonc is still a placeholder."
  warn "The app will not complete OAuth token refresh until it is set, committed and pushed."
fi

# --- 4. build -------------------------------------------------------------------------------
bold "4/6  Building"

# Not running npm test here: the test pool needs workerd, which does not start on this box.
# Tests run on a dev machine before the commit lands.
npm run typecheck
npm run ui:build
[ -f public/index.html ] || die "ui build produced no public/index.html"

# --- 5. deploy ------------------------------------------------------------------------------
bold "5/6  Deploying the Worker"
npx wrangler deploy

# --- 6. health ------------------------------------------------------------------------------
bold "6/6  Health check"

if curl -fsS --max-time 15 "$HEALTH_URL" >/dev/null 2>&1; then
  info "$HEALTH_URL is up"
else
  warn "$HEALTH_URL did not answer. Expected if nginx and DNS are not configured yet."
  echo
  bold "Remaining manual steps (see DEPLOY.md for the full sequence)"
  info "1. Point an A record for YOUR_DOMAIN at 198.51.100.10"
  info "2. Bootstrap an HTTP-only nginx config for the domain (no cert exists yet)"
  info "3. certbot certonly --webroot -w /var/www/html -d YOUR_DOMAIN"
  info "4. Copy deploy/nginx/connector.conf into place, replace __EDGE_SECRET__"
  info "5. nginx -t && systemctl reload nginx"
fi

echo
bold "Bootstrap complete. Use ./scripts/deploy.sh for every deploy from here."
