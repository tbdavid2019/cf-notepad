export const NOTEPAD_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Notepad with heart">
  <defs>
    <linearGradient id="notepad-cover" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8f2d8" />
      <stop offset="100%" stop-color="#efe5bd" />
    </linearGradient>
    <linearGradient id="notepad-top" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8e6842" />
      <stop offset="100%" stop-color="#6e4f33" />
    </linearGradient>
    <linearGradient id="page-fold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff8da" />
      <stop offset="100%" stop-color="#ddcf9d" />
    </linearGradient>
    <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#000000" flood-opacity="0.14" />
    </filter>
  </defs>

  <g filter="url(#soft-shadow)">
    <rect x="44" y="28" width="392" height="456" rx="34" fill="url(#notepad-cover)" stroke="#8a7756" stroke-width="10" />
    <rect x="44" y="28" width="392" height="82" rx="34" fill="url(#notepad-top)" />
    <path d="M402 388v96l-82-82h52c16.568 0 30-13.432 30-30z" fill="url(#page-fold)" stroke="#c8b98a" stroke-width="8" stroke-linejoin="round" />
  </g>

  <g fill="#ece2bb" stroke="#5d422a" stroke-width="8">
    <circle cx="108" cy="69" r="15" />
    <circle cx="178" cy="69" r="15" />
    <circle cx="248" cy="69" r="15" />
    <circle cx="318" cy="69" r="15" />
  </g>

  <rect x="84" y="126" width="18" height="296" rx="9" fill="#d3b43d" opacity="0.95" />

  <g stroke="#d1c39a" stroke-width="10" stroke-linecap="round" opacity="0.95">
    <line x1="126" y1="170" x2="388" y2="170" />
    <line x1="126" y1="220" x2="388" y2="220" />
    <line x1="126" y1="270" x2="388" y2="270" />
    <line x1="126" y1="320" x2="388" y2="320" />
    <line x1="126" y1="370" x2="340" y2="370" />
  </g>

  <path
    d="M256 308
      C238 286 196 264 196 223
      C196 194 218 176 244 176
      C260 176 274 184 282 198
      C290 184 304 176 320 176
      C346 176 368 194 368 223
      C368 264 326 286 308 308
      C294 325 279 342 282 342
      C285 342 270 325 256 308 Z"
    fill="#e6465d"
    stroke="#b9203a"
    stroke-width="10"
    stroke-linejoin="round"
  />
</svg>
`
