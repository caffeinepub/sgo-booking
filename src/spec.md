# Specification

## Summary
**Goal:** Retry build/deploy by forcing a new frontend release version so Caffeine generates a fresh publish artifact and (ideally) shows the Publish URL / “Open App” link, and add a small admin-facing note clarifying potential platform UI issues.

**Planned changes:**
- Increment `frontend/src/buildInfo.ts` `BUILD_VERSION` to a new value to force a fresh frontend build artifact.
- Run build + deploy again so Caffeine attempts a new publish and can display the Publish URL / “Open App” link.
- Add a concise English notice in the Admin Panel explaining that a missing Publish URL / “Open App” after a successful deploy is a Caffeine platform UI issue and the team will pause and retry later; the notice must not affect business logic or block usage.

**User-visible outcome:** Admins see a brief notice in the Admin Panel about the possible Caffeine Publish URL UI issue, and a new deployment attempt is triggered via a frontend build version bump so the platform can (hopefully) show an “Open App” / Publish URL link.
