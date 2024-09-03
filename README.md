本專案 fork 自  [s0urcelab/serverless-cloud-notepad](https://github.com/s0urcelab/serverless-cloud-notepad)

# Cloud Notepad - Serverless Deployment with Cloudflare Workers

This project is a serverless application called "Cloud Notepad" deployed using Cloudflare Workers. Below are the steps required to set up and deploy the application.

## Prerequisites

- **Node.js** and **npm** installed on your system.
- A Cloudflare account with Workers and KV namespace access.
- Cloudflare `wrangler` CLI installed.

## Setup

### 1. Install Wrangler

If you haven't installed Wrangler yet, you can install it globally using npm:

```bash
npm install -g @cloudflare/wrangler
```

### 2. Initialize Project

Make sure your project directory contains a `wrangler.toml` file configured as follows:

```toml
name = "cloud-notepad"
main = "src/index.js"
compatibility_date = "2022-05-13"

kv_namespaces = [
  { binding = "NOTES", id = "<NOTES_KV_BINDING_ID>" },
  { binding = "SHARE", id = "<SHARE_KV_BINDING_ID>" }
]
```

### 3. Create KV Namespaces

Create the necessary KV namespaces for the project:

```bash
wrangler kv:namespace create "notes"
wrangler kv:namespace create "share"
```

After running these commands, you will receive `id` values that you should replace in your `wrangler.toml`:

```toml
kv_namespaces = [
  { binding = "NOTES", id = "your_notes_kv_id_here" },
  { binding = "SHARE", id = "your_share_kv_id_here" }
]
```

### 4. Set Up Environment Secrets

The project requires environment secrets like `SCN_SALT` and `SCN_SECRET`. You can set these using the following commands:

```bash
wrangler secret put SCN_SALT
wrangler secret put SCN_SECRET
```

### 5. Deployment

Once everything is configured, deploy the project to Cloudflare Workers using:

```bash
wrangler deploy
```

### 6. Troubleshooting

- **SCN_SALT is not defined**: Ensure that the `SCN_SALT` environment variable is properly set using `wrangler secret put SCN_SALT`.
- **Old Wrangler Version**: If you see deprecation warnings, consider updating Wrangler with `npm install -g wrangler`.



This will start a local server where you can interact with your Worker.

## Notes

- Ensure your `.env` or sensitive information is added to `.gitignore`.
- The deployment process will override any edits made directly via the Cloudflare Dashboard.


