#!/usr/bin/env bash
# =============================================================================
# TrustHire AI — Tailscale Funnel setup
#
# Run this ON THE SERVER after Tailscale is installed and authenticated.
# Tailscale Funnel exposes your local ports publicly over HTTPS via *.ts.net
#
# Requirements:
#   - tailscale installed and `tailscale up` completed
#   - tailscale funnel is enabled for this node (check tailscale.com/s/funnel)
# =============================================================================

set -euo pipefail
RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}[OK]${NC}   $*"; }
error()   { echo -e "${RED}[ERR]${NC}  $*"; exit 1; }

command -v tailscale >/dev/null || error "Tailscale not installed. See https://tailscale.com/download/linux"

info "Current Tailscale status:"
tailscale status --peers=false

echo ""
info "Setting up Tailscale Funnel routes…"

# Route / → frontend (Next.js on port 3000)
# Route /api → backend (Spring Boot on port 8080)
# This lets both use a single HTTPS *.ts.net domain.
tailscale funnel --bg 3000
info "Funnel active: / → localhost:3000 (frontend)"

# Tailscale Funnel only supports one port per hostname.
# The frontend proxies /api/* calls to the backend internally — see next.config.ts.
# (The backend is NOT directly exposed — only reachable from the Tailscale network.)

echo ""
success "Tailscale Funnel configured!"
echo ""
HOSTNAME=$(tailscale status --peers=false --json | grep -oP '"DNSName":"\K[^"]+' | head -1 | sed 's/\.$//')
echo "  Public URL: https://${HOSTNAME}"
echo "  Frontend:   https://${HOSTNAME}  → port 3000"
echo "  Backend:    Internal only (tailscale IP, port 8080)"
echo ""
echo "Update deploy/server.env:"
echo "  TRUSTHIRE_CORS_ORIGIN=https://${HOSTNAME}"
echo "  NEXT_PUBLIC_API_BASE_URL=https://${HOSTNAME}/api"
echo ""
echo "Then re-run: bash deploy/deploy.sh"
