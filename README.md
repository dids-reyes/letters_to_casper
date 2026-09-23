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
is one anonymous presence; the header counts **other** connected tabs. Local
device time blends dawn (05:00–07:00) and dusk (17:00–19:00). Reduced motion
freezes drift and twinkle, omits meteors, and uses a gentle brightening.
Stars glimmer when someone sends a pulse; occasional ambient meteors cross the sky. Hidden tabs stop painting.

### Local development

The Socket.io backend lives in the sibling **ltc-service** repository and shares
its existing HTTP server (port 8000 by default).

1. In `ltc-service`, run `npm ci`, configure its normal environment variables,
   include `http://localhost:3000` in `SKY_ALLOWED_ORIGINS`, and run `npm start`.
2. In this frontend repository, run `npm ci --legacy-peer-deps` and `npm start`.
   Development defaults to `http://localhost:8000`; use
   `REACT_APP_SKY_SOCKET_URL` to override it.

### Deployment: Render backend + Netlify frontend

1. Commit and push the backend changes in **ltc-service**, then redeploy its
   existing Render web service. Root Directory should be blank (repository root),
   Build Command `npm ci`, Start Command `npm start`. Keep existing backend
   environment variables and the `/health` health check.
2. On Render, set `SKY_ALLOWED_ORIGINS` to
   `https://letterstocasper.com,https://www.letterstocasper.com` (also the defaults).
   Use exact origins without paths or trailing slashes.
3. On **Netlify**, set `REACT_APP_SKY_SOCKET_URL` to the existing ltc-service
   Render public HTTPS URL, without an API path. For example:
   `REACT_APP_SKY_SOCKET_URL=https://ltc-service.onrender.com`.
   Copy the actual URL from your Render dashboard.
4. Commit and push this frontend's changes and rebuild/redeploy it on Netlify.
5. Open `/sky` in two tabs and verify counts, pulses, the 12-second cooldown,
   and removal when a tab closes.

No separate Sky Render service is needed. Do not set `sky-server` as the
Root Directory. This repository contains only the Sky frontend.

Socket.io uses the backend's existing `PORT`, starts with HTTP polling and
upgrades to WebSocket. Origin validation applies to both transports. See
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

The main-page Sky navigation observes `user_count` using Socket.io auth
`{ observer: true }`. Observer connections must receive `sky_state` and
`user_count` but must not create a participant or increment `activeCount`.

Validation:

```sh
# In ltc-service: npm test
CI=true npm test -- --watchAll=false --runInBand
npm run build
```

Sky notes: each connected visitor can publish one public plain-text note of up
to 80 Unicode characters using “Leave a little note”. Tap a visitor's star to
open a single compact note card; Escape or its close button dismisses it. Reopen
your note and choose Clear note to remove it. Each saved note lasts one hour
from its latest save. On disconnect, a note-bearing star stays smaller and faded
until that deadline; stars without notes leave immediately. The live counter
counts only connected visitors. Notes and the bounded activity log live in server
memory, so server restarts clear them early. The bounded activity log remains available in presence state; the dock now
prioritizes chat and controls, leaving the center open for visitor stars.
The backend validates length and limits note changes to once every three seconds.
Deploy the updated `ltc-service` Sky module before the frontend to enable notes.
Sky also adapts the mobile browser theme color and toast styling to its header
palette, restoring the browser color when the route closes.

### Sky chat and soul statuses

The Sky header now holds the count and star hint, fading after 15 seconds. The
fixed mobile dock contains shared chat, notes, Pulse, and a mood selector. Visitor
positions are sampled against measured header/dock exclusions (at least 120px at
the top and 320px at the bottom), including the whole touch target and drift.
Resize recomputes positions. If those zones fill the viewport, visitor targets
are hidden until space is available; the status picker remains accessible.

Deploy `ltc-service/services/sky.js` before this frontend. `sky_state` now includes
public `messages` and each participant's `mood`. `set_mood` broadcasts
`presence_updated`. `send_chat` accepts `{ text, sessionId? }`; `chat_message`
contains server-assigned identity and `createdAt` in epoch milliseconds. Public
history is capped at 500 messages and fades after 10 minutes. Private history is
capped at 200 per session and fades after 30 minutes. Both are pruned in server
memory and filtered on clients. Restarts
clear history. Chat sends are limited to one per second per connection.

`request_chat` targets a connected participant ID. The recipient gets
`chat_request` and answers with `respond_chat: { id, accept }`. Invitations expire
after 60 seconds; only the recipient can accept. `chat_started` gives both peers
a private session ID. The server checks membership for every private send and
routes messages only to those two socket IDs. `leave_chat` or either peer's
disconnect ends the session with `chat_ended`. Reconnects create a fresh presence.
Private sessions support one peer per visitor at a time and are not end-to-end
encrypted. No database migration is needed; the existing single-instance hosting
requirement still applies.

“Send a shooting star” uses `send_shooting_star` with a target participant ID.
The server validates the active recipient and enforces a three-second cooldown,
then broadcasts `receive_shooting_star: { from, to }`. Each browser resolves the
flight endpoints to its own rendered star positions. Reduced-motion visitors
see a brief glow at the recipient instead. Restart the local backend, or deploy
its updated Sky service, when adding this event handler.

Star hue is shared presence: the connection auth supplies the saved `tint`, and
`set_tint` updates it through `presence_updated`. The server accepts only the
five built-in hues. New visitors and retained note stars receive that hue too.
