<div style="text-align: center;">
  <img alt="ltc" src="https://letterstocasper.com/static/media/ltc_logo_1.cbb025df3b8a2f362432.webp" height="80" width="400" />
</div>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-2.2.10-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: ISC" src="https://img.shields.io/badge/License-ISC-yellow.svg" />
  </a>
</p>

[![Netlify Status](https://api.netlify.com/api/v1/badges/f9ac3f9c-1a10-4add-bd16-28860b83c189/deploy-status)](https://app.netlify.com/sites/letterstocasper/deploys)

> A sanctuary where heartfelt sentiments find expression in the embrace of anonymity.

## Install

```sh
npm install --legacy-peer-deps
```

## Usage

```sh
npm run start
```

## Prerequisites

Before running the project, make sure you have set up a `.env` file containing the necessary environment variables. This file should include configurations such as API URLs and API keys.

See: https://github.com/dids-reyes/letters_to_casper/discussions/117

#### Pending / Incoming / For Approval Letters

New Letters are sent from the NodeJS Server to Discord channel `#letters` since this data contains sensitive info. (e.g, Loc) only selected members can view this channel.

![](https://dcbadge.limes.pink/api/server/pQf2mAHe4u)

## Bug reports (Brevo)

The Bug Report FAB submits to `/api/messages/report-bug` on the existing
`ltc-service` backend. It reuses the mail notification Brevo service and its
configured sender (`notif@letterstocasper.com`), sending reports to
`letters2casper@gmail.com`. No additional Brevo configuration is required.
Deploy the backend route along with the frontend update.

## Sky — hidden shared presence space

Open `/sky` directly. It is intentionally absent from navigation. Each open tab
is one anonymous presence; the footer counts **other** connected tabs. Local
device time blends dawn (05:00–07:00) and dusk (17:00–19:00). Reduced motion
freezes drift and twinkle and uses a small, brief pulse. Hidden tabs stop painting.

### Local development

Use Node 20 or later:

```sh
npm ci --legacy-peer-deps
npm ci --prefix sky-server
SKY_ALLOWED_ORIGINS=http://localhost:3000 npm start --prefix sky-server
```

In a second terminal, run `npm start`. Development defaults to
`http://localhost:3001`; set `REACT_APP_SKY_SOCKET_URL` to override it.

### Render deployment

1. Create a Render Blueprint from this repository using `render.yaml`, or create
   a Node web service with root directory `sky-server`, build `npm ci`, start
   `npm start`, and health check `/health`.
2. Set `SKY_ALLOWED_ORIGINS` to a comma-separated list of exact frontend origins
   (no paths or trailing slashes). Defaults allow only
   `https://letterstocasper.com` and `https://www.letterstocasper.com`.
3. Set `REACT_APP_SKY_SOCKET_URL=https://YOUR-SERVICE.onrender.com` in the
   frontend hosting environment, then rebuild/redeploy the frontend.
4. Open `/sky` in two tabs. Verify the count, pulses in both tabs, the 12-second
   cooldown, and removal when a tab closes. Check both mobile and reduced motion.

The server binds Render's `PORT` on `0.0.0.0`. Socket.io starts with HTTP polling
and upgrades to WebSocket, retaining polling when WebSocket is unavailable.
Origin validation applies to both transports. See
[Socket.io CORS](https://socket.io/docs/v4/handling-cors/) and
[Render WebSockets](https://render.com/docs/websocket).

Presence is ephemeral and held in memory: run **one instance**. Multiple instances
would require a shared Socket.io adapter, shared presence/cooldown state and
sticky sessions for polling. Restarts cause clients to reconnect with fresh
positions. A sleeping hosting plan adds a cold-start delay; the page shows a
connection state until ready. No presence data is persisted.

Protocol: the server automatically joins each connection to `sky`, sends
`sky_state`, broadcasts `presence_joined` / `presence_left` and `user_count`,
and accepts `send_pulse` with an acknowledgement. It broadcasts
`receive_pulse` to peers using the sender's server-assigned position. The
12-second limit is enforced per connection; reconnecting creates a new presence.
Without a configured production endpoint, the ambient page remains available
with a resting message and disabled pulse button.

Validation:

```sh
npm test --prefix sky-server
CI=true npm test -- --watchAll=false --runInBand
npm run build
```
