#!/usr/bin/env bash
# Usage: ./scripts/doc2wiki.sh <input-file> <wiki-path> [theme] [public]
# Example: ./scripts/doc2wiki.sh report.docx report-2026 claude-canvas true

set -euo pipefail

INPUT_FILE="${1:-}"
WIKI_PATH="${2:-}"
THEME="${3:-claude-canvas}"
PUBLIC="${4:-false}"

if [ -z "$INPUT_FILE" ] || [ -z "$WIKI_PATH" ]; then
  echo "Usage: $0 <input-file> <wiki-path> [theme] [public]"
  echo "Example: $0 report.docx report-2026 claude-canvas true"
  exit 1
fi

if [ ! -f "$INPUT_FILE" ]; then
  echo "Error: File '$INPUT_FILE' not found!"
  exit 1
fi

if [[ ! "$WIKI_PATH" =~ ^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$ ]]; then
  echo "Error: wiki-path must contain only letters, numbers, underscores, or hyphens." >&2
  exit 1
fi

if [[ "$PUBLIC" != "true" && "$PUBLIC" != "false" ]]; then
  echo "Error: public must be true or false." >&2
  exit 1
fi

case "$THEME" in
  ayu-light|bauhaus|botanical|catppuccin-latte|catppuccin-macchiato|claude-canvas|green-simple|kanagawa|neo-brutalism|newsprint|notion-clean|organic|playful-geometric|professional|retro|shopify-mint|sketch|terminal|tokyo-night|x-ai) ;;
  *)
    echo "Error: unsupported theme '$THEME'." >&2
    exit 1
    ;;
esac

TEMP_MD=$(mktemp "${TMPDIR:-/tmp}/doc2wiki.XXXXXX.md")
trap 'rm -f "$TEMP_MD"' EXIT

echo "📄 Converting '$INPUT_FILE' to Markdown via @firecrawl/anydoc..."
npx -y @firecrawl/anydoc "$INPUT_FILE" -o "$TEMP_MD"

echo "🚀 Uploading to David888 Wiki (path: '$WIKI_PATH', theme: '$THEME', public: '$PUBLIC')..."
RESPONSE=$(curl --fail --silent --show-error -X POST "https://wiki.david888.com/api/${WIKI_PATH}?public=${PUBLIC}&theme=${THEME}" \
  -H "Content-Type: text/markdown; charset=UTF-8" \
  --data-binary @"$TEMP_MD")

SHARE_URL=$(node -e '
const response = JSON.parse(process.argv[1]);
if (response?.err !== 0 || typeof response?.data?.shareUrl !== "string") process.exit(1);
process.stdout.write(response.data.shareUrl);
' "$RESPONSE") || {
  echo "Error: Wiki did not return a successful public share URL." >&2
  exit 1
}

echo "✅ Successfully published to David888 Wiki!"
echo "🔗 Share URL: $SHARE_URL"
echo "🔗 Presentation URL: ${SHARE_URL}/present"
