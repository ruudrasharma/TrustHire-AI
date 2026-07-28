#!/usr/bin/env bash
# =============================================================================
# TrustHire AI — Server Deployment Script
# Usage: bash deploy/deploy.sh
#
# Run this on your Linux server after:
#   1. git clone / git pull
#   2. Setting env vars (see deploy/server.env.example)
#   3. Installing prerequisites (Java 17, Maven, Node 18+, npm)
# =============================================================================

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}[OK]${NC}   $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()   { echo -e "${RED}[ERR]${NC}  $*"; exit 1; }

# ── Prerequisites check ───────────────────────────────────────────────────────
info "Checking prerequisites…"
command -v java  >/dev/null || error "Java 17+ is required. Install: sudo apt install openjdk-17-jdk"
command -v mvn   >/dev/null || error "Maven 3.9+ is required.   Install: sudo apt install maven"
command -v node  >/dev/null || error "Node.js 18+ is required.  Install via nvm or apt"
command -v npm   >/dev/null || error "npm is required."
success "All prerequisites found."

JAVA_VER=$(java -version 2>&1 | head -1 | grep -oP '(?<=version ")[0-9]+')
[[ "$JAVA_VER" -ge 17 ]] || error "Java 17+ required, found Java $JAVA_VER"

# ── Load env ──────────────────────────────────────────────────────────────────
ENV_FILE="$SCRIPT_DIR/server.env"
if [[ -f "$ENV_FILE" ]]; then
  info "Loading env from deploy/server.env"
  # shellcheck disable=SC1090
  set -o allexport; source "$ENV_FILE"; set +o allexport
else
  warn "deploy/server.env not found — using current shell environment."
  warn "Copy deploy/server.env.example → deploy/server.env and fill in values."
fi

: "${TRUSTHIRE_SIGNING_SECRET:?Must set TRUSTHIRE_SIGNING_SECRET in deploy/server.env}"
: "${NEXT_PUBLIC_API_BASE_URL:?Must set NEXT_PUBLIC_API_BASE_URL in deploy/server.env (e.g. https://api.your-ts-name.ts.net)}"
: "${TRUSTHIRE_CORS_ORIGIN:?Must set TRUSTHIRE_CORS_ORIGIN in deploy/server.env (e.g. https://your-ts-name.ts.net)}"

# ── Backend build ─────────────────────────────────────────────────────────────
info "Building backend (mvn clean package)…"
cd "$PROJECT_ROOT/backend"
mvn clean package -DskipTests -q
JAR=$(find target -maxdepth 1 -name "*.jar" ! -name "*sources*" | head -1)
[[ -n "$JAR" ]] || error "No JAR found in backend/target/"
success "Backend built: $JAR"

# ── Frontend build ────────────────────────────────────────────────────────────
info "Installing frontend dependencies…"
cd "$PROJECT_ROOT/frontend"
npm ci --silent

info "Building frontend (next build)…"
NEXT_PUBLIC_API_BASE_URL="$NEXT_PUBLIC_API_BASE_URL" npm run build
success "Frontend built."

# ── Systemd — reload and restart ──────────────────────────────────────────────
info "Installing systemd units (requires sudo)…"

# Copy unit files if not yet present
for UNIT in trusthire-backend.service trusthire-frontend.service; do
  DEST="/etc/systemd/system/$UNIT"
  SRC="$SCRIPT_DIR/$UNIT"
  [[ -f "$SRC" ]] || error "Unit file missing: $SRC"
  sudo cp "$SRC" "$DEST"
done

# Write env file that systemd units will EnvironmentFile-source
sudo bash -c "cat > /etc/trusthire.env" <<ENV
TRUSTHIRE_SIGNING_SECRET=${TRUSTHIRE_SIGNING_SECRET}
NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
TRUSTHIRE_CORS_ORIGIN=${TRUSTHIRE_CORS_ORIGIN}
TRUSTHIRE_OLLAMA_URL=${TRUSTHIRE_OLLAMA_URL:-http://localhost:11434}
TRUSTHIRE_OLLAMA_MODEL=${TRUSTHIRE_OLLAMA_MODEL:-llama3.2}
TRUSTHIRE_PROJECT_ROOT=${PROJECT_ROOT}
ENV
sudo chmod 600 /etc/trusthire.env

sudo systemctl daemon-reload
sudo systemctl enable trusthire-backend trusthire-frontend
sudo systemctl restart trusthire-backend
sleep 3
sudo systemctl restart trusthire-frontend

success "Services started."
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  TrustHire AI deployed!${NC}"
echo -e "  Backend:  http://localhost:8080"
echo -e "  Frontend: http://localhost:3000"
echo -e "  Public (Tailscale Funnel): ${TRUSTHIRE_CORS_ORIGIN}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "Check logs:"
echo "  sudo journalctl -u trusthire-backend  -f"
echo "  sudo journalctl -u trusthire-frontend -f"
