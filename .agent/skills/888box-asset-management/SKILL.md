---
name: 888box-asset-management
description: Use when managing 888box assets through the live server API or MCP endpoints. Supports uploading remote assets, listing images/videos/audios/files, reading stats, deleting assets, and checking podcast RSS information. This rendered skill includes the correct live Base URL and token hints for the current 888box deployment.
---

# 888box Asset Management

## Environment Setup
- **Base URL**: `https://box.david888.com`
- **Public Mode**: If this 888box instance has not enabled login restriction, public upload actions can be used without a token.
- **Token Auth**: For protected actions, pass the `token` in the POST body or as a Bearer token in the `Authorization` header.
- **Your Token**: `YOUR_API_TOKEN`

## When To Use

Use this skill when the user wants to:

- upload a remote image, video, audio, or file into this 888box instance
- list recent assets from this server
- inspect counts or asset stats
- delete an asset by `id`
- inspect podcast RSS information for uploaded videos or audios
- operate against the live 888box deployment without hardcoding the wrong domain

## Workflow

1. Use the live Base URL shown above.
2. Prefer the unified API at `https://box.david888.com/api.php`.
3. For public upload flows, try the request without a token first.
4. For protected or admin-style operations, authenticate with the provided token.
5. If MCP tools are available for this server, prefer those tools over raw HTTP calls.
6. Check JSON responses for `result`.
   `success` means the call worked.
   `error` means the call failed and the `message` should be surfaced.

## API Gateway

Primary endpoint:

`https://box.david888.com/api.php`

Authentication depends on the action:

- `upload` public when login restriction is off
- `upload_url` public when login restriction is off
- `stats` public
- `list` token required
- `search` token required
- `delete` token required

### Supported Actions

#### `upload`

Upload local files with multipart form data.

Authentication:
- public when login restriction is off
- otherwise token required

#### `upload_url`

Ingest an asset from a remote URL.

Authentication:
- public when login restriction is off
- otherwise token required

Parameters:
- `url` required
- `title` optional
- `description` optional
- `password` optional

#### `list`

Retrieve a list of assets.

Parameters:
- `type` one of `image`, `video`, `audio`, `file`, `all`
- `page` optional

#### `stats`

Get asset count statistics.

#### `delete`

Remove an asset.

Parameters:
- `id` required

## Example HTTP Requests

### Public Upload From URL

```bash
curl -X POST 'https://box.david888.com/api.php?action=upload_url' \
  -d 'url=https://example.com/file.jpg' \
  -d 'title=Example Asset'
```

### Authenticated List Assets

```bash
curl 'https://box.david888.com/api.php?action=list&type=all&page=1&token=YOUR_API_TOKEN'
```

## MCP Tools
If MCP is connected for this 888box instance, prefer these tools:

- **`upload_asset_by_url`**: Best for transferring assets from other websites.
- **`list_assets`**: Use this to find IDs for deletion or viewing.
- **`get_stats`**: Check storage usage and counts.
- **`get_podcast_info`**: Retrieve the RSS feeds for your videos or audios.
- **`rebuild_podcast_rss`**: Run this with the type parameter if the RSS feed seems out of sync.

## Best Practices
- **Images**: Automatically converted to WebP for optimization.
- **Videos**: Automatically extracted metadata and generated thumbnails. Added to Video Podcast RSS (`/storage/podcast.xml`) if no password is set.
- **Audios**: Automatically extracted duration and bitrate metadata. Added to Audio Podcast RSS (`/storage/podcast_audio.xml`) if no password is set.
- **Security**: Use the provided `token` for protected actions such as listing, searching, deleting, or MCP-driven maintenance.
- **Error Handling**: Check the `result` field in JSON responses. `error` indicates a failure.
