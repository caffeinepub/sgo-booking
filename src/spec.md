# Specification

## Summary
**Goal:** Allow admins to fully purge all backend data for a specific hotel Principal ID, forcing the hotel to re-register and be re-activated before accessing the Hotel Dashboard again.

**Planned changes:**
- Add an admin-only backend API that hard-deletes all data associated with hotel Principal ID `opo7v-ka45k-pk32j-76qsi-o3ngz-e6tgc-755di-t2vx3-t2ugj-qnpbc-gae`, including hotel profile, rooms, activation/ownership mappings, invite tokens, and any bookings/payments tied to that hotel, without impacting other principals.
- Update backend activation/access logic so the purged principal is not considered activated and cannot access Hotel Area routes until a new admin invite token is generated and consumed and the hotel re-registers.
- Add an Admin Panel UI action to run the purge by Principal ID with an explicit destructive confirmation step, and refresh/invalidate relevant cached queries so deleted data disappears immediately.
- Add regression checks/guardrails to ensure guest browsing, admin invite tokens, and the hotel activation flow continue working without runtime errors or infinite loading states.

**User-visible outcome:** Admins can safely purge a specified hotel principal’s data from the system via the Admin Panel; the affected hotel account loses dashboard access until it re-registers and is re-activated with a newly generated admin invite token, while all other hotel/guest/admin features continue to work normally.
