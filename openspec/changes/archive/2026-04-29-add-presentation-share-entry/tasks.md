## 1. Routing and share view entry

- [x] 1.1 Add a dedicated `/share/:md5/present` route that resolves the same shared note as `/share/:md5`
- [x] 1.2 Pass presentation entry state into the share template so the frontend can distinguish normal share view from dedicated presentation view
- [x] 1.3 Preserve existing `/share/:md5` behavior and ensure non-presentation share links remain unchanged

## 2. Presentation state restoration

- [x] 2.1 Update presentation initialization logic to auto-enter presentation mode when the page is loaded from the dedicated presentation route
- [x] 2.2 Ensure Reveal slide hash is honored on direct open and reload so targeted slides resolve correctly
- [x] 2.3 Define exit behavior so leaving presentation mode from the dedicated route returns the user to the standard share page

## 3. Password-protected share flow

- [x] 3.1 Preserve the requested presentation destination while the user completes share-page password authentication
- [x] 3.2 Restore the dedicated presentation route and slide hash after successful authentication
- [x] 3.3 Keep protected content hidden when authentication fails or is cancelled

## 4. UX and verification

- [x] 4.1 Decide whether to expose a presentation-specific share link or copy-current-slide affordance in the share UI
- [ ] 4.2 Verify direct open, reload, exit, and password-protected deep-link scenarios manually across shared notes with multiple slides
- [x] 4.3 Update any relevant documentation or change notes describing the new presentation sharing entry point