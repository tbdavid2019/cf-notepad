/**
 * src/styles/admin.css.js
 * Admin page-specific styles: table, login form, buttons, badges
 */
export const getAdminCss = () => `
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f0f2f5; padding: 20px; }
.admin-container { max-width: 900px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
h1 { margin-top: 0; color: #333; }
table { width: 100%; border-collapse: collapse; margin-top: 20px; }
th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; }
th { background-color: #f8f9fa; font-weight: 600; color: #555; cursor: pointer; user-select: none; position: relative; }
th:hover { background-color: #e9ecef; }
th::after { content: '↕'; position: absolute; right: 8px; opacity: 0.3; font-size: 12px; }
th.asc::after { content: '↑'; opacity: 1; }
th.desc::after { content: '↓'; opacity: 1; }
tr:hover { background-color: #f5f5f5; }
a { color: #007bff; text-decoration: none; }
a:hover { text-decoration: underline; }
.login-form { text-align: center; margin-top: 40px; }
.login-form input { padding: 12px; margin: 10px 0; width: 100%; max-width: 300px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.login-form button { padding: 12px 40px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; transition: background 0.2s; }
.login-form button:hover { background-color: #0056b3; }
.error { background-color: #ffebee; color: #c62828; padding: 12px; border-radius: 4px; margin-bottom: 20px; border: 1px solid #ffcdd2; }

/* Action buttons */
.admin-actions { margin-bottom: 15px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.btn { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; transition: opacity 0.2s, background 0.2s; }
.btn-danger { background-color: #dc3545; color: white; }
.btn-danger:hover:not(:disabled) { background-color: #c82333; }
.btn-warning { background-color: #ff9800; color: white; }
.btn-warning:hover:not(:disabled) { background-color: #e68900; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Selection badge */
.selection-count { color: #666; font-size: 14px; }

/* Notification messages */
.admin-notice {
    position: fixed; top: 20px; right: 20px; z-index: 9999;
    padding: 12px 20px; border-radius: 6px; font-size: 14px; font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: opacity 0.3s;
    max-width: 320px;
}
.admin-notice.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.admin-notice.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
`
