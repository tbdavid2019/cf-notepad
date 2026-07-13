/**
 * Admin dashboard styles.
 * Calm, dense information design for a content-management workspace.
 */
export const getAdminCss = () => `
:root {
    color-scheme: light;
    --admin-ink: #1f2933;
    --admin-muted: #68737d;
    --admin-faint: #f5f7f8;
    --admin-line: #e2e7ea;
    --admin-accent: #cc785c;
    --admin-accent-dark: #a9553d;
    --admin-danger: #c94a5a;
    --admin-warning: #d88621;
    --admin-radius: 10px;
}

* { box-sizing: border-box; }
body {
    margin: 0;
    min-height: 100vh;
    background: #eef1f3;
    color: var(--admin-ink);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
button, input, select { font: inherit; }
button, a { -webkit-tap-highlight-color: transparent; }
a { color: inherit; }

.admin-shell { width: min(1440px, calc(100% - 40px)); margin: 0 auto; padding: 38px 0 56px; }
.admin-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-bottom: 28px; }
.admin-eyebrow { margin: 0 0 10px; color: var(--admin-accent); font-size: 11px; font-weight: 700; letter-spacing: .16em; }
h1, h2, p { margin-top: 0; }
h1 { margin-bottom: 8px; color: #20252a; font-family: "Maple Mono", "SFMono-Regular", Consolas, monospace; font-size: clamp(28px, 4vw, 42px); letter-spacing: -.04em; }
.admin-subtitle { margin-bottom: 0; color: var(--admin-muted); font-size: 14px; }
.admin-home-link { padding: 9px 12px; border: 1px solid var(--admin-line); border-radius: 7px; background: #fff; color: var(--admin-muted); font-size: 13px; text-decoration: none; white-space: nowrap; }
.admin-home-link:hover { border-color: var(--admin-accent); color: var(--admin-accent-dark); }

.admin-stats { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
.admin-stat-card, .admin-panel, .login-card { border: 1px solid var(--admin-line); border-radius: var(--admin-radius); background: #fff; box-shadow: 0 8px 24px rgba(31, 41, 51, .05); }
.admin-stat-card { min-height: 116px; padding: 18px; display: flex; flex-direction: column; justify-content: space-between; }
.admin-stat-label { color: var(--admin-muted); font-size: 12px; font-weight: 650; }
.admin-stat-value { margin: 8px 0; color: #20252a; font-family: "Maple Mono", "SFMono-Regular", Consolas, monospace; font-size: 28px; line-height: 1; }
.admin-stat-detail { color: #99a2a9; font-size: 11px; }

.admin-panel { margin-bottom: 16px; overflow: hidden; }
.panel-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 22px 16px; }
.panel-heading h2 { margin-bottom: 5px; color: #28313a; font-size: 17px; }
.panel-heading p { margin-bottom: 0; color: var(--admin-muted); font-size: 12px; }
.scan-badge { padding: 6px 9px; border-radius: 5px; background: #fff4e6; color: #a35a0b; font-size: 11px; white-space: nowrap; }
.filter-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 14px; padding: 0 22px 22px; }
.filter-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.filter-field-wide { grid-column: span 2; }
.filter-field span, .login-form label { color: #59656e; font-size: 12px; font-weight: 650; }
.filter-field input, .filter-field select, .login-form input { width: 100%; min-height: 38px; padding: 8px 10px; border: 1px solid #d8dfe3; border-radius: 6px; background: #fff; color: var(--admin-ink); outline: none; }
.filter-field input:focus, .filter-field select:focus, .login-form input:focus { border-color: var(--admin-accent); box-shadow: 0 0 0 3px rgba(204, 120, 92, .14); }
.filter-actions { display: flex; align-items: flex-end; gap: 8px; grid-column: span 2; }

.btn { min-height: 38px; padding: 8px 14px; border: 1px solid transparent; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 650; transition: background .15s, border-color .15s, color .15s, opacity .15s; }
.btn:disabled { cursor: not-allowed; opacity: .45; }
.btn-primary { background: var(--admin-accent); color: #fff; }
.btn-primary:hover:not(:disabled) { background: var(--admin-accent-dark); }
.btn-quiet { display: inline-flex; align-items: center; border-color: var(--admin-line); background: #fff; color: var(--admin-muted); text-decoration: none; }
.btn-quiet:hover { border-color: #b9c3c9; color: var(--admin-ink); }
.btn-danger { background: #fff0f2; border-color: #f3c9cf; color: var(--admin-danger); }
.btn-danger:hover:not(:disabled) { background: #ffe1e6; }
.btn-warning { background: #fff6e9; border-color: #f3d6aa; color: #9c5c11; }
.btn-warning:hover:not(:disabled) { background: #ffedd1; }

.list-heading { align-items: flex-end; border-bottom: 1px solid var(--admin-line); }
.admin-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
.selection-count { color: var(--admin-muted); font-size: 12px; }
.table-wrap { overflow-x: auto; }
table { width: 100%; min-width: 860px; border-collapse: collapse; }
th, td { padding: 13px 14px; border-bottom: 1px solid var(--admin-line); text-align: left; vertical-align: middle; }
th { background: #fbfcfc; color: #76818a; font-size: 11px; font-weight: 750; letter-spacing: .05em; text-transform: uppercase; white-space: nowrap; }
.sort-link { display: inline-flex; align-items: center; gap: 5px; color: inherit; text-decoration: none; }
.sort-link span { color: #aab3b9; font-size: 12px; }
.sort-link:hover, .sort-link.active { color: var(--admin-accent-dark); }
.sort-link.active span { color: var(--admin-accent); }
td { color: #424c54; font-size: 13px; }
tbody tr:hover { background: #fcfaf8; }
.check-cell { width: 48px; text-align: center; }
.action-cell { width: 72px; text-align: center; }
input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--admin-accent); cursor: pointer; }
.note-identity { min-width: 260px; }
.note-identity a { display: block; max-width: 560px; overflow: hidden; color: #1769aa; font-weight: 700; text-decoration: none; text-overflow: ellipsis; white-space: nowrap; }
.note-identity a:hover { color: var(--admin-accent-dark); text-decoration: underline; }
.note-identity code { display: block; margin-top: 4px; color: #98a1a8; font-family: "SFMono-Regular", Consolas, monospace; font-size: 11px; }
.status-cell { min-width: 145px; }
.status-badge, .lock-badge { display: inline-block; margin: 2px 4px 2px 0; padding: 4px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; white-space: nowrap; }
.status-badge.is-public { background: #e7f6ef; color: #23734c; }
.status-badge.is-private { background: #f0f2f3; color: #78828a; }
.sitemap-badge { display: inline-block; margin: 2px 4px 2px 0; padding: 4px 6px; border-radius: 4px; background: #edf1ff; color: #4a5eb3; font-size: 10px; font-weight: 700; white-space: nowrap; }
.lock-badge { background: #fff4e6; color: #9a5d18; }
.date-cell { color: #69757d; font-family: "SFMono-Regular", Consolas, monospace; font-size: 11px; white-space: nowrap; }
.muted { color: #aab2b8; }
.icon-delete { border: 0; background: transparent; color: #bd7d83; cursor: pointer; font-size: 17px; }
.icon-delete:hover { color: var(--admin-danger); }
.empty-state { padding: 54px 20px; color: var(--admin-muted); text-align: center; }
.empty-state strong, .empty-state span { display: block; }
.empty-state span { margin-top: 6px; font-size: 12px; }

.pagination { display: flex; align-items: center; justify-content: center; gap: 14px; padding: 18px 22px; }
.pagination-button { padding: 8px 11px; border: 1px solid var(--admin-line); border-radius: 6px; color: var(--admin-ink); font-size: 12px; text-decoration: none; }
.pagination-button:hover { border-color: var(--admin-accent); color: var(--admin-accent-dark); }
.pagination-button.is-disabled { pointer-events: none; opacity: .35; }
.pagination-status { color: var(--admin-muted); font-family: "SFMono-Regular", Consolas, monospace; font-size: 12px; }

.admin-alert { margin-bottom: 16px; padding: 12px 14px; border: 1px solid; border-radius: 7px; font-size: 13px; }
.admin-alert.error { border-color: #f1c8cf; background: #fff2f4; color: #a33e4c; }
.admin-notice { position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 340px; padding: 12px 16px; border-radius: 7px; box-shadow: 0 8px 22px rgba(31, 41, 51, .14); font-size: 13px; transition: opacity .3s; }
.admin-notice.success { background: #e7f6ef; border: 1px solid #b8e2cb; color: #23734c; }
.admin-notice.error { background: #fff0f2; border: 1px solid #f3c9cf; color: #a33e4c; }

.login-card { width: min(420px, 100%); margin: 12vh auto 0; padding: 34px; text-align: center; }
.login-mark { width: 42px; height: 42px; display: grid; place-items: center; margin: 0 auto 18px; border-radius: 50%; background: #fff1ec; color: var(--admin-accent); font-size: 22px; }
.login-card h2 { margin-bottom: 8px; font-size: 22px; }
.login-card p { margin-bottom: 24px; color: var(--admin-muted); font-size: 13px; }
.login-form { display: grid; gap: 8px; text-align: left; }
.login-form .btn { width: 100%; margin-top: 8px; }

@media (max-width: 980px) {
    .admin-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .filter-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .filter-field-wide { grid-column: span 2; }
}
@media (max-width: 640px) {
    .admin-shell { width: min(100% - 24px, 560px); padding-top: 24px; }
    .admin-header { display: block; }
    .admin-home-link { display: inline-block; margin-top: 16px; }
    .admin-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .admin-stat-card { min-height: 98px; padding: 14px; }
    .admin-stat-value { font-size: 23px; }
    .panel-heading, .list-heading { display: block; padding: 16px; }
    .admin-actions { justify-content: flex-start; margin-top: 14px; }
    .filter-grid { display: flex; flex-direction: column; padding: 0 16px 16px; }
    .filter-actions { align-items: stretch; }
    .filter-actions .btn { flex: 1; justify-content: center; text-align: center; }
    .pagination { padding: 14px 10px; }
}
`
