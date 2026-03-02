# VPS Docker Deployment Plan

## Action
Save this plan to `docs/vps-docker-deployment-plan.md` in the project for future implementation reference.

## Context

The platform currently deploys to Cloudflare Workers (serverless). This plan adds a Docker-based VPS deployment path (targeting Hetzner) with Tailscale VPN for local-network-only access. The Cloudflare Workers path remains intact — both deployment targets coexist via separate Vite configs. Convex stays as a cloud SaaS backend (not self-hosted).

## Architecture

```
[Your devices + Tailscale] → VPS (Tailscale IP 100.x.y.z)
                                 │
                              UFW firewall (allow only tailscale0 + SSH)
                                 │
                              Caddy (:80) → reverse proxy → App (:3000)
                                 │
                              Convex Cloud (*.convex.cloud)
```

## Files to Create (10)

| File | Purpose |
|------|---------|
| `vite.config.node.ts` | Vite config for Node.js build (replaces Cloudflare plugin with Nitro v2) |
| `docker/Dockerfile` | Multi-stage build (deps → build → runtime) |
| `docker/docker-compose.yml` | App + Caddy orchestration |
| `docker/Caddyfile` | Reverse proxy (HTTP only, no domain) |
| `docker/.env.example` | Env var template |
| `docker/deploy.sh` | Pull + rebuild script for updates |
| `.dockerignore` | Exclude unnecessary files from build context |
| `src/routes/api/health.ts` | Health check endpoint for Docker HEALTHCHECK |
| `docs/vps-deployment.md` | Step-by-step VPS + Tailscale + Docker guide |
| `docs/docker-reference.md` | Docker commands, env vars, troubleshooting |

## Files to Modify (2)

| File | Change |
|------|--------|
| `package.json` | Add `build:node`, `start:node` scripts + `@tanstack/nitro-v2-vite-plugin` dev dep |
| `.gitignore` | Add `docker/.env` |

## Implementation Steps

### Step 1: Install Nitro v2 plugin
```bash
npm install --save-dev @tanstack/nitro-v2-vite-plugin
```

### Step 2: Create `vite.config.node.ts`
Copy `vite.config.ts` but:
- Remove `cloudflare()` plugin (Cloudflare Workers adapter)
- Remove `devtools()` plugin (dev-only, not needed in production)
- Add `nitroV2Plugin({ preset: "node-server" })` — produces `.output/server/index.mjs`

### Step 3: Add npm scripts to `package.json`
```json
"build:node": "vite build -c vite.config.node.ts",
"start:node": "node .output/server/index.mjs"
```

### Step 4: Create health check endpoint
`src/routes/api/health.ts` — returns `{ status: "ok", timestamp }`. Used by Docker HEALTHCHECK.

### Step 5: Create `.dockerignore`
Exclude `node_modules`, `dist`, `.output`, `.git`, `docs/`, env files, etc.

### Step 6: Create `docker/` directory with deployment files

**`docker/Dockerfile`** — 3-stage build:
1. `deps` stage: `node:22-slim`, `npm ci`
2. `builder` stage: Copy deps + source, `npm run build:node` (with `VITE_CONVEX_URL` build arg)
3. `runner` stage: `node:22-slim`, copy only `.output/`, run `node .output/server/index.mjs`

**`docker/docker-compose.yml`**:
- `app` service: builds from Dockerfile, exposes 3000 internally, passes runtime env vars
- `caddy` service: `caddy:2-alpine`, listens on port 80, reverse proxies to app:3000

**`docker/Caddyfile`**: HTTP-only reverse proxy with gzip, security headers, static asset caching.

**`docker/.env.example`**: Template with `VITE_CONVEX_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`.

**`docker/deploy.sh`**: `git pull` → `docker compose up -d --build` → health check → prune old images.

### Step 7: Update `.gitignore`
Add `docker/.env` (actual secrets, not committed).

### Step 8: Write documentation

**`docs/vps-deployment.md`** — Full step-by-step guide:
1. Prerequisites (Hetzner account, Tailscale account)
2. Create VPS (Hetzner CX22, Ubuntu 24.04)
3. Initial server setup (SSH, system updates)
4. Install Docker
5. Install & configure Tailscale
6. Configure UFW firewall (deny all incoming, allow SSH + tailscale0)
7. Clone repo & configure environment
8. Build & start with Docker Compose
9. Install Tailscale on client devices
10. Access the app via Tailscale IP
11. Deploying updates
12. Monitoring & logs

**`docs/docker-reference.md`** — Reference:
1. Architecture diagram
2. Build args vs runtime env vars
3. Docker commands cheat sheet
4. Caddyfile configuration
5. Health check details
6. Troubleshooting (common issues)

## Key Technical Decisions

- **Dual Vite configs**: `vite.config.ts` (Cloudflare) + `vite.config.node.ts` (Node.js) — both paths work
- **Nitro v2 preset `node-server`**: Produces standalone `.output/server/index.mjs` with all deps bundled
- **Node 22**: Required by `@tanstack/react-start` engine constraint; Docker uses `node:22-slim`
- **`VITE_CONVEX_URL` is build-time**: Baked into client bundle, passed as Docker build arg
- **Caddy over Nginx**: Simpler config, good enough for a private reverse proxy
- **Tailscale + UFW**: VPS only accepts connections from Tailscale network; port 80 is unreachable from public internet

## Verification

1. `npm run build:node` succeeds and produces `.output/server/index.mjs`
2. `npm run start:node` serves the app on `http://localhost:3000`
3. `curl http://localhost:3000/api/health` returns `{"status":"ok"}`
4. `docker compose -f docker/docker-compose.yml up --build` builds and starts both containers
5. `docker compose -f docker/docker-compose.yml ps` shows both healthy
6. From a Tailscale-connected device, `http://<vps-tailscale-ip>` loads the app
7. From a non-Tailscale device, the VPS IP is unreachable on port 80
