# Specification

## Summary
**Goal:** Help admins and users confirm whether the latest deployment is being served, and provide clearer in-app guidance for finding the platform Publish/Open App link and resolving caching issues.

**Planned changes:**
- Add an admin-only “Deployment / Publish Info” section on `/admin` that displays `BUILD_VERSION`, basic runtime info (current URL/origin + pathname, and detected network/canister host if available), and one-click copy actions with success toasts.
- Update/extend the existing deploy/publish guidance UI with English-only, step-by-step instructions for obtaining the platform Publish URL/Open App link (including refresh and Draft/Live tab switching), plus cache-busting guidance and a “Reload app” button that performs a full page reload.
- Update the frontend `BUILD_VERSION` constant to a new value and ensure it is visible in both the AppShell footer and the new admin “Deployment / Publish Info” section.

**User-visible outcome:** Admins can verify the running build/version and quickly copy runtime/deployment details from the Admin Panel, while users get clearer English guidance to locate the Publish/Open App link and force a reload/hard refresh when changes aren’t showing.
