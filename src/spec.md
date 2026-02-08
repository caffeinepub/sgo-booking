# Specification

## Summary
**Goal:** Restore the entire application (backend + frontend) to match Version 27 exactly, including role-based areas and dependent APIs, and make the UI clearly show it is Version 27.

**Planned changes:**
- Revert/recover all backend and frontend files to their Version 27 contents, restoring any missing Guest/Hotel/Admin pages/panels and required backend APIs.
- Update the frontend build identifier so the UI displays a Version 27 label (replacing any current restored version label).
- Add a safe, conditional canister upgrade migration (backend/migration.mo) if Version 27 stable-state layout differs from the currently deployed state, so upgrades do not trap and existing data remains readable.
- Run and ensure the existing frontend regression checklist passes for Version 27, focusing on auth/role gating, Guest/Hotel/Admin navigation and panels, booking flows, and Admin invite token generation.

**User-visible outcome:** The app behaves like Version 27 again: Guest/Hotel/Admin routes and panels are present and properly role-gated, the footer/build label indicates Version 27, upgrades preserve existing data, and core flows (including Admin invite tokens and booking views) work without crashes.
