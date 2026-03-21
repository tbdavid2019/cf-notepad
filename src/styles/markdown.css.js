/**
 * src/styles/markdown.css.js
 * Markdown rendering styles: typography, tables, code, alerts, GitHub-style
 */
export const getMarkdownCss = () => `
.markdown-body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
    font-size: 16px;
    line-height: 1.5;
    word-wrap: break-word;
}
.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; }
.markdown-body h1 { font-size: 2em; padding-bottom: 0.3em; border-bottom: 1px solid #eaecef; }
.markdown-body h2 { font-size: 1.5em; padding-bottom: 0.3em; border-bottom: 1px solid #eaecef; }
.markdown-body h3 { font-size: 1.25em; }
.markdown-body h4 { font-size: 1em; }
.markdown-body p { margin-top: 0; margin-bottom: 16px; }
.markdown-body blockquote { margin: 0; padding: 0 1em; color: #6a737d; border-left: 0.25em solid #dfe2e5; }
.markdown-body ul, .markdown-body ol { padding-left: 2em; margin-top: 0; margin-bottom: 16px; }
.markdown-body table { display: block; width: 100%; overflow: auto; margin-top: 0; margin-bottom: 16px; border-spacing: 0; border-collapse: collapse; }
.markdown-body table tr { background-color: #fff; border-top: 1px solid #c6cbd1; }
.markdown-body table tr:nth-child(2n) { background-color: #f6f8fa; }
.markdown-body table th, .markdown-body table td { padding: 6px 13px; border: 1px solid #dfe2e5; }
.markdown-body table th { font-weight: 600; background-color: #f6f8fa; }
.markdown-body code { padding: 0.2em 0.4em; margin: 0; font-size: 85%; background-color: rgba(27,31,35,0.05); border-radius: 3px; font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace; }
.markdown-body pre { padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; background-color: #f6f8fa; border-radius: 3px; }
.markdown-body pre code { display: inline; padding: 0; margin: 0; overflow: visible; line-height: inherit; word-wrap: normal; background-color: transparent; border: 0; }
.markdown-body hr { height: 0.25em; padding: 0; margin: 24px 0; background-color: #e1e4e8; border: 0; }
.markdown-body a { color: #0366d6; text-decoration: none; }
.markdown-body a:hover { text-decoration: underline; }
.markdown-body img { max-width: 100%; box-sizing: content-box; background-color: #fff; }

/* GitHub Alerts */
.markdown-alert { padding: 8px 16px; margin-bottom: 16px; border-left: 0.25em solid; border-radius: 6px; }
.markdown-alert > :first-child { margin-top: 0; }
.markdown-alert > :last-child { margin-bottom: 0; }
.markdown-alert-note { border-color: #0969da; background-color: #f1f8ff; color: #0d1117; }
.markdown-alert-note::before { content: "ℹ️ Note"; font-weight: 600; display: block; margin-bottom: 4px; color: #0969da; }
.markdown-alert-tip { border-color: #1a7f37; background-color: #f0fdf4; color: #0d1117; }
.markdown-alert-tip::before { content: "💡 Tip"; font-weight: 600; display: block; margin-bottom: 4px; color: #1a7f37; }
.markdown-alert-important { border-color: #8250df; background-color: #f6f0ff; color: #0d1117; }
.markdown-alert-important::before { content: "💬 Important"; font-weight: 600; display: block; margin-bottom: 4px; color: #8250df; }
.markdown-alert-warning { border-color: #9a6700; background-color: #fff8c5; color: #0d1117; }
.markdown-alert-warning::before { content: "⚠️ Warning"; font-weight: 600; display: block; margin-bottom: 4px; color: #9a6700; }
.markdown-alert-caution { border-color: #cf222e; background-color: #ffebe9; color: #0d1117; }
.markdown-alert-caution::before { content: "🛑 Caution"; font-weight: 600; display: block; margin-bottom: 4px; color: #cf222e; }
`
