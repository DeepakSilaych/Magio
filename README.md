<p align="center">
  <img src="assets/logo.svg" alt="Magio Logo" width="120" />
</p>

<h1 align="center">Magio</h1>

<p align="center">
  <em>A simple, open-source email view tracker with a Gmail extension and real-time analytics dashboard.</em>
</p>

<p align="center">
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-installing-with-docker">Docker</a> •
  <a href="#-features">Features</a> •
  <a href="#-api-reference">API</a> •
  <a href="LICENSE">License</a>
</p>

---

## Getting Started

### Requirements

- Node.js 20+
- Docker (for PostgreSQL)
- pnpm (for the extension)

### Get the source code and install dependencies

```bash
git clone https://github.com/deepaksilaych/magio.git
cd magio
```

### Start the database

```bash
docker-compose up -d postgres
```

### Configure and run the dashboard

```bash
cd apps/web
cp .env.example .env
npm install
npx prisma db push
npm run dev
```

The dashboard will be available at `http://localhost:3000`.

### Configure and run the extension

```bash
cd apps/extension
cp .env.example .env
pnpm install
pnpm dev
```

Load the unpacked extension from `apps/extension/build/chrome-mv3-dev` in your browser's extension page.

---

## Installing with Docker

Magio ships with a Docker Compose file that runs the full stack (PostgreSQL + dashboard):

```bash
docker-compose up -d
```

The dashboard will be available at `http://localhost:3000`.

---

## Features

### Dashboard (`apps/web`)

- **Overview** — KPI cards, bar chart with 24h/7d/30d toggle, recent sessions table
- **Emails** — Searchable, sortable email list with per-email detail panel
- **Email Detail** — View count, unique IPs, hourly distribution chart, tabular view log with browser/OS/device detection
- **Auto-refresh** — Dashboard updates every 10 seconds
- **Dark theme** — Umami-inspired dark UI built with shadcn/ui

### Extension (`apps/extension`)

- **Compose toolbar toggle** — "Tracking on/off" button injected next to Gmail's Send button
- **Auto-track on send** — Tracking pixel embedded automatically when enabled
- **Email view sidebar** — Streak-style panel showing view count, unique IPs, and recent views when opening sent emails
- **Popup** — Global toggle for auto-tracking
- **Persistent settings** — Toggle state saved to localStorage

### Tracking API (`apps/web/src/app/api`)

- **Tracking pixel** — 1x1 transparent GIF with no-cache headers
- **Sender filtering** — Sender's own views are excluded by IP matching
- **Search API** — Look up tracking data by email subject

---

## Architecture

```
magio/
├── apps/
│   ├── web/                  # Next.js 16 — Dashboard + API
│   │   ├── src/
│   │   │   ├── app/          # Routes: /overview, /emails, /api/*
│   │   │   ├── components/   # UI components (shadcn/ui + Recharts)
│   │   │   ├── hooks/        # useDashboard
│   │   │   └── lib/          # Types, DB connector, utils
│   │   ├── prisma/           # Database schema
│   │   └── Dockerfile
│   └── extension/            # Plasmo — Chrome/Brave extension
│       ├── lib/              # API, Gmail DOM, sidebar, storage
│       ├── content.ts        # Gmail content script
│       └── popup.tsx         # Extension popup
├── docker-compose.yml        # PostgreSQL + web app
└── package.json              # Root workspace scripts
```

**Tech stack:** Next.js, Tailwind CSS, shadcn/ui, Recharts, Prisma, PostgreSQL, Plasmo.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/emails` | Register a new tracked email |
| `GET` | `/api/emails` | List all tracked emails with views |
| `GET` | `/api/emails/search?subject=...` | Search emails by subject |
| `GET` | `/api/track/[id].gif` | Tracking pixel (logs view, returns 1x1 GIF) |

---

## Environment Variables

### `apps/web/.env`

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |

### `apps/extension/.env`

| Variable | Description |
|----------|-------------|
| `PLASMO_PUBLIC_API_URL` | URL of the tracking API (default: `http://localhost:3000`) |

---

## How It Works

1. When you click **Send** in Gmail, the extension calls `POST /api/emails` to register the email.
2. A 1x1 transparent GIF pointing to `/api/track/[id].gif` is embedded in the email body.
3. When the recipient opens the email, their client loads the image, hitting the tracking endpoint.
4. The endpoint logs the view (IP, User-Agent, timestamp). Sender IP is excluded.
5. The dashboard and Gmail sidebar display the collected analytics in real time.

---

## Tunnel Setup (for external tracking)

For the tracking pixel to work when recipients open emails outside your network, expose the API with a tunnel:

```bash
# Cloudflare (recommended — no warning pages)
cloudflared tunnel --url http://localhost:3000

# ngrok
ngrok http 3000
```

Update `PLASMO_PUBLIC_API_URL` in `apps/extension/.env` with the tunnel URL, then restart the extension dev server.

---

## License

MIT — see [LICENSE](LICENSE).
