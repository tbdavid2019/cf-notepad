# Install 888wiki

[Project homepage](../README.md) · [Traditional Chinese](INSTALLATION.zh-TW.md) · [Feature guide](FEATURES.md) · [Changelog](../CHANGELOG.md)

## One-click deployment (recommended)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/tbdavid2019/888wiki)

1. Select **Deploy to Cloudflare** and sign in to GitHub and Cloudflare.
2. Choose the GitHub repository and Worker names.
3. Set the required secrets when prompted: `SCN_SALT`, `SCN_SECRET`, and `SCN_ADMIN_PW`. Generate unique random values for this deployment.
4. Optionally set `GROQ_API_KEY` to enable Groq-powered AI features.
5. Start deployment. Cloudflare creates a repository copy, configures Workers Builds, and provisions the KV, D1, and R2 resources declared in `wrangler.toml`. The deploy script initializes D1 tables for note history, statistics, and annotations.
6. Open your Worker URL. The admin dashboard uses `SCN_ADMIN_PATH` (default: `/admin`) and the `SCN_ADMIN_PW` secret.

Images are served through the Worker by default. Set `SCN_R2_DOMAIN` after deployment if you want to use a custom image domain.

## Deploy with Wrangler

The one-click flow is the simplest way to create and connect all resources. For a manual setup:

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/tbdavid2019/888wiki.git
   cd 888wiki
   npm install
   npx wrangler login
   ```

2. Create two KV namespaces and replace the `demo` IDs in `wrangler.toml` with the IDs returned by Wrangler:

   ```bash
   npx wrangler kv namespace create NOTES
   npx wrangler kv namespace create SHARE
   ```

3. Create the D1 database and R2 bucket declared in `wrangler.toml`. Replace the D1 `database_id` with the returned ID:

   ```bash
   npx wrangler d1 create 888wiki-history
   npx wrangler r2 bucket create 888wiki-images
   ```

4. Add the required secrets. Wrangler prompts for each value:

   ```bash
   npx wrangler secret put SCN_SALT
   npx wrangler secret put SCN_SECRET
   npx wrangler secret put SCN_ADMIN_PW
   ```

   Add `GROQ_API_KEY` if you want Groq AI features.

5. Build, initialize the D1 tables, and deploy:

   ```bash
   npm run deploy
   ```

`npm run deploy` runs the editor asset builds, applies the D1 schemas, and deploys the Worker. Use a unique salt, signing secret, and admin password for each installation.

## Optional settings

- `SCN_ADMIN_PATH`: Admin dashboard route. Default: `/admin`.
- `SCN_SLUG_LENGTH`: Random note URL length.
- `SCN_ENABLE_NOTE_HISTORY`: Enable D1 note history. Set to `"1"` when using the configured D1 database.
- `SCN_R2_DOMAIN`: Custom public image domain. Leave empty to serve images through the Worker.
- `GROQ_API_KEY`: Groq API key for AI writing and audio transcription.

See [Cloudflare Deploy to Cloudflare buttons](https://developers.cloudflare.com/workers/platform/deploy-buttons/) for details about the deployment flow.
