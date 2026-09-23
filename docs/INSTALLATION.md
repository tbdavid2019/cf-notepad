# Install 888wiki

[Project homepage](../README.md) · [Traditional Chinese](INSTALLATION.zh-TW.md) · [Feature guide](FEATURES.md) · [Changelog](../CHANGELOG.md)

## One-click deployment (recommended)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/tbdavid2019/888wiki)

1. Select **Deploy to Cloudflare** and sign in to GitHub and Cloudflare.
2. Choose the GitHub repository and Worker names.
3. Set the three required secrets listed below in the setup flow or the Worker’s **Settings → Variables and Secrets**.
4. Start deployment. Cloudflare creates a repository copy, connects Workers Builds, and provisions the Cloudflare resources declared in `wrangler.toml`.
5. The deploy command initializes the D1 tables for note history, view statistics, and annotations. Open the Worker URL when the build completes.

Cloudflare Deploy reads `wrangler.toml` for resource bindings and `.dev.vars.example` for secret names. Most runtime variables already have usable defaults, so you do not need to enter every row during setup. The tables below show every value that can affect a fresh deployment.

## Required secrets

| Secret | Purpose | Setup |
| --- | --- | --- |
| `SCN_SALT` | Salt for password hashing | Generate a unique random value for this installation. |
| `SCN_SECRET` | Signs sessions and authentication tokens | Generate a separate unique random value. |
| `SCN_ADMIN_PW` | Password for the admin dashboard | Choose a strong password. The dashboard path is `/admin` by default. |

Generate two separate random values for `SCN_SALT` and `SCN_SECRET` with `openssl rand -hex 32`; choose a strong password for `SCN_ADMIN_PW`.

Set secrets in Cloudflare’s setup flow or add them after deployment under **Worker → Settings → Variables and Secrets**. For Wrangler deployments, run `npx wrangler secret put <NAME>` for each required secret. Never put secret values in `wrangler.toml` or commit them to Git.

## Cloudflare resources created from `wrangler.toml`

| Binding | Resource | Used for |
| --- | --- | --- |
| `NOTES` | KV namespace | Note storage and fallback storage. |
| `SHARE` | KV namespace | Published notes and share metadata. |
| `NOTE_HISTORY_DB` | D1 database | Hybrid storage, note history, view counts, and paragraph annotations. The deploy script creates the required tables. |
| `IMAGES` | R2 bucket | Uploaded images. The Worker serves images unless a custom domain is configured. |

The Worker also serves static files from `static/` and runs the configured daily cleanup Cron at 01:00 UTC (09:00 Taiwan time). Cloudflare provisions the resources and updates generated IDs from the default placeholders in the Wrangler file.

## Runtime variables and defaults

These values are already defined in `wrangler.toml`. Change them in your copied GitHub repository when you want different behavior; each push triggers the connected deployment.

| Variable | Default | Effect |
| --- | --- | --- |
| `SCN_STORAGE_DRIVER` | `auto` | `auto` uses D1 with KV fallback; `kv` uses KV only; `d1` selects D1-only mode. |
| `SCN_APP_NAME` | `888wiki` | App name displayed in the interface. |
| `SCN_ADMIN_PATH` | `/admin` | Admin dashboard route. Choose a less predictable path if desired. |
| `SCN_SLUG_LENGTH` | `4` | Length of generated note URLs. |
| `SCN_ENABLE_R2` | `1` | `1` enables uploads to the provisioned R2 bucket; `0` disables uploads. |
| `SCN_R2_DOMAIN` | empty | Optional public image domain. Empty serves images through the Worker. |
| `SCN_GA_MEASUREMENT_ID` | empty | No analytics are sent until you provide a Google Analytics measurement ID. |
| `SCN_ENABLE_WEBTALK` | `0` | WebTalk is off until you configure your own service. |
| `SCN_WEBTALK_SCRIPT_URL` | empty | Your WebTalk client script URL. |
| `SCN_WEBTALK_AI_ENDPOINT` | empty | Your WebTalk AI endpoint. |
| `SCN_WEBTALK_SCOPE` | `meta` | WebTalk widget scope. |
| `SCN_WEBTALK_SITE_ID` | empty | Site ID registered with your WebTalk service. |
| `SCN_ENABLE_NOTE_HISTORY` | `1` | `1` enables D1 history; `0` disables it. D1 is also used for statistics and annotations. |
| `SCN_NOTE_HISTORY_LIMIT` | `10` | Maximum retained note history versions. |
| `SCN_NOTE_HISTORY_MIN_INTERVAL_SECONDS` | `300` | Minimum interval between automatic history snapshots. |

## Optional parameters and integrations

| Parameter | Default | Configure it when |
| --- | --- | --- |
| `GROQ_API_KEY` secret | Unset | Enable Groq-powered AI features and primary audio transcription. Without it, configured Workers AI can provide supported AI operations and the transcription fallback. |
| `SCN_R2_DOMAIN` | Empty | Serve uploaded images from your own public domain instead of the Worker. |
| `SCN_GA_MEASUREMENT_ID` | Unset | Send analytics to your own Google Analytics property. |
| `SCN_ENABLE_WEBTALK` | `0` | Set to `1` after configuring every WebTalk value below. |
| `SCN_WEBTALK_SCRIPT_URL` | Empty | Load your WebTalk client script. |
| `SCN_WEBTALK_AI_ENDPOINT` | Empty | Connect your WebTalk widget to your AI endpoint. |
| `SCN_WEBTALK_SCOPE` | `meta` | Change the DOM scope used by your WebTalk widget. |
| `SCN_WEBTALK_SITE_ID` | Empty | Identify your site to your WebTalk service. |
| Workers AI binding `AI` | Not configured | Use Cloudflare Workers AI for supported writing operations and as an audio-transcription fallback. Transcription tries Groq first when `GROQ_API_KEY` is set. Add the binding to `wrangler.toml`. |
| Worker custom domain | `workers.dev` URL | Use your own hostname. Configure it in the Cloudflare dashboard after deployment. |

WebTalk is disabled by default. Its script and endpoint are empty in the deployment configuration. Add values for a service you control before enabling it.

## Deploy with Wrangler

For a manual setup:

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/tbdavid2019/888wiki.git
   cd 888wiki
   npm install
   npx wrangler login
   ```

2. Create the KV namespaces and replace their `demo` IDs in `wrangler.toml` with the IDs Wrangler returns:

   ```bash
   npx wrangler kv namespace create NOTES
   npx wrangler kv namespace create SHARE
   ```

3. Create the D1 database and R2 bucket declared in `wrangler.toml`. Replace the D1 `database_id` with the returned ID:

   ```bash
   npx wrangler d1 create 888wiki-history
   npx wrangler r2 bucket create 888wiki-images
   ```

4. Add `SCN_SALT`, `SCN_SECRET`, and `SCN_ADMIN_PW` using `npx wrangler secret put <NAME>`. Add `GROQ_API_KEY` if you want Groq AI features.
5. Run the build, D1 initialization, and deployment:

   ```bash
   npm run deploy
   ```

Use unique secret values for every installation. See [Cloudflare Deploy to Cloudflare buttons](https://developers.cloudflare.com/workers/platform/deploy-buttons/) for the official deployment behavior.
