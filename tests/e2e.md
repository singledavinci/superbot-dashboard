# Manual smoke test (SuperBot Admin)

Run in order after a fresh deploy (or local `npm run dev` + backend URL in `VITE_API_URL`).

## Preconditions

1. You can sign in with Discord and have **Administrator** or **Manage Server** on at least one guild where SuperBot is installed and **`/setup`** has been run.
2. Browser devtools open → **Application** → verify you can clear site data if a test fails mid-way.

---

## 1. Login and shell

1. Open the dashboard root `/`.
2. Click **Continue with Discord** and complete OAuth until you land on `/app/overview`.
3. Confirm: top bar (desktop) shows your username/initials; sidebar shows all sections; footer shows `build: <git sha>`.

---

## 2. Server selector

1. If you have **multiple eligible guilds**, use **Discord server** dropdown (desktop header or mobile strip under the menu bar).
2. Switch servers — confirm URL stays under `/app/*` and Overview counts change if the servers differ in tracked data.
3. Reload the page — confirm the same server stays selected (`superbot_active_guild`).

---

## 3. Watched Wallets (critical path)

1. Go to **Watched Wallets**.
2. Click **Add wallet**.
3. Enter invalid address (e.g. `0x123`) — inline validation should block submit / show error.
4. Enter valid `0x` + 40 hex; optional label; submit.
5. Confirm: success toast; row appears with address, ENS column (may be `—`), **Added** date if API returns `createdAt`.
6. Delete the wallet — confirm confirmation dialog and row disappears with success toast.

---

## 4. Tracked Collections

1. Open **Tracked Collections** → **Add collection** with valid contract + name; save.
2. Adjust sweep / mass listing / floor drop / rise fields on a row → **Save thresholds**; confirm toast.
3. Remove a collection via **Remove** when safe to do so.

---

## 5. Alert routing

1. Open **Alert Routing**; pick **WHALE_BUY** (or any type), enter valid numeric **Discord channel ID** (17–20 digits), optional role id.
2. **Save** — toast; reload page — values should persist.
3. **Clear** for one type — confirm it removes that route (backend row deleted).

---

## 6. Watchlists

1. **Watchlists** → add **wallet** target with valid address; confirm list updates.
2. Add **collection** target; confirm list updates.
3. Remove one entry.

---

## 7. Floor alerts

1. Ensure at least one tracked collection exists.
2. **Floor alerts** → select collection; enter at least one positive **drop** or **rise** percent; save.
3. Use **Disable both for this NFT**; confirm thresholds clear in Tracked Collections view.

---

## 8. Overview & activity

1. **Overview** — cards show counts; **Recent deliveries** shows rows if API returns items, otherwise empty-state copy (no fabricated rows).

---

## 9. Settings & sign-out

1. **Settings** — toggle **Light** / **Dark**; confirm `html` has class `light` or `dark` and UI flips.
2. Confirm API **health** / **version** rows populate.
3. **Sign out of Discord** (or avatar menu **Disconnect Discord**) — you should land on `/` with login CTA; `localStorage` keys `superbot_token` and `superbot_active_guild` cleared.

---

## 10. Regression checks

1. Every failed API action should toast the server **`error`** string when JSON provides it — **not** generic “check login status” copy.
2. With an **expired or invalid JWT**, the app should send you through Discord OAuth again after clearing storage (no infinite skeleton).

---

## API spot-checks (optional, with a valid Bearer token)

```http
GET /api/health
GET /api/version
GET /api/v1/auth/me
GET /api/v1/guilds/{discordGuildId}/wallets
GET /api/v1/guilds/{discordGuildId}/stats
GET /api/v1/guilds/{discordGuildId}/recent-alerts
```

Replace `{discordGuildId}` with your active Discord snowflake from the selector.
