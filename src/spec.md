# Specification

## Summary
**Goal:** Ensure uploaded room photos are visible to Hotel owners and Guests (as in Admin), with click-to-zoom previews and consistent warm/orange styling.

**Planned changes:**
- Fix backend room/room-photo read visibility so room listings for guests and hotel owners return rooms with a non-empty `pictures` array when photos exist.
- Hotel Area → Rooms: render all previously uploaded room photos per room (thumbnails), open zoom/preview via the existing `ImagePreviewDialog`, and keep create/edit flows able to add and remove photos.
- Guest Browse Hotels: show representative room photo thumbnail(s) on each hotel card (similar to Admin presentation), support click-to-zoom via `ImagePreviewDialog`, and show an English “No photos available” placeholder when none exist.
- Enforce role-based UI: hotel owners can add/remove photos only in room create/edit; guests remain strictly view-only with no edit/delete controls.
- Apply consistent warm, hospitality-oriented UI theme across Hotel Area Rooms, Browse Hotels, and Hotel Detail (neutral backgrounds + orange accents; avoid blue/purple as primary).

**User-visible outcome:** Hotel owners can see and manage their room photos in the Hotel Area, and guests can see room photo thumbnails while browsing hotels and open photos in a zoom/preview modal, with a consistent warm/orange look and English UI text.
