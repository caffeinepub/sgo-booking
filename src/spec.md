# Specification

## Summary
**Goal:** Restore the previously stable hotel activation/admin invite-token/role behavior and fix the room (“upload kamar”) photo upload flow so it reliably stores and reloads photos.

**Planned changes:**
- Restore backend canister method exports and candid alignment for the frontend’s existing auth/admin/hotel-profile flows (roles/guards, hotel activation/visibility/subscription admin actions, invite-token list/CRUD/validation/consumption) so results are consistent and no UI calls fail.
- Fix Hotel Area > Rooms “upload kamar” create/edit flow to validate image files, show clear English errors, and preserve existing photos unless explicitly replaced or deleted.
- Update room photo handling to store uploaded images in canister blob storage and save stable retrievable references/identifiers in `RoomInput.pictures` (no long-term base64 `data:` URLs), ensuring photos remain usable after refresh/re-login.
- Run the relevant regression checklist sections (auth/roles, activation, admin panel) and document what changed and what was verified in release notes, including a rollback note if the regression reappears.

**User-visible outcome:** Hotel accounts no longer appear incorrectly inactive, the Admin Panel invite tokens reappear and load normally, role-protected pages work without runtime method errors, and rooms can be created/edited with photos that persist correctly across reloads (with clear English upload errors when files are invalid).
