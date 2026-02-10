# Release Notes Template

Use this template to document verification results for each release. Copy the relevant section into your PR description or release notes.

---

## Release V47 - Backend Compatibility Restoration

**Release Date:** 2026-02-10  
**Deployed By:** AI Agent  
**Canister Version:** v47

### Summary
This release restores frontend-backend compatibility after the backend was simplified. The frontend now gracefully handles missing backend methods with clear error messages, and room photo upload has been migrated to blob storage for stable URLs.

### Changes Made

#### Backend Compatibility Layer
- Added runtime method availability checks to prevent "actor.<method> is not a function" errors
- Implemented stub implementations for unavailable backend methods with clear English error messages
- Created compatibility mapping for invite tokens/codes to support admin panel display
- All hooks now safely check for method existence before calling

#### Room Photo Upload
- Migrated from data URLs to blob storage using ExternalBlob
- Created `roomBlobStorage.ts` utility for stable blob URL generation
- Enhanced `useRoomImageUpload` with file validation (type, size) and progress tracking
- Room photos now persist correctly after page refresh and re-login
- Maximum file size: 5MB per image
- Supported formats: JPEG, PNG, WebP, GIF

#### Error Handling
- All unavailable features now show user-friendly English error messages
- Hotel activation form displays clear notice about restoration in progress
- Admin invite tokens panel shows informational alert about functionality status
- No runtime crashes or blank screens when backend methods are missing

### Verification Results

#### Critical Flows
- [ ] App loads without runtime errors
- [ ] Admin can log in and access Admin Panel
- [ ] Admin can generate invite codes (basic functionality)
- [ ] Invite tokens panel displays with informational notice
- [ ] Hotel users see clear activation unavailable message
- [ ] Room creation with photo upload works (blob storage)
- [ ] Room photos persist after page refresh
- [ ] No "actor.<method> is not a function" errors in console

#### Room Photo Upload
- [ ] Hotel can create room with photos
- [ ] Photos upload with progress indicator
- [ ] Photos display immediately after upload
- [ ] Photos persist after page refresh
- [ ] File validation works (type and size limits)
- [ ] Clear error messages for invalid files
- [ ] Replace photo functionality works
- [ ] Delete photo functionality works

#### Graceful Degradation
- [ ] Missing backend methods show clear error messages
- [ ] App remains functional for available features
- [ ] No blank screens or infinite loading states
- [ ] Error messages are in English
- [ ] Users understand what functionality is unavailable

### Known Issues
- Hotel activation/token consumption temporarily unavailable (backend method missing)
- Hotel profile management temporarily unavailable (backend method missing)
- Booking system temporarily unavailable (backend methods missing)
- Payment method management temporarily unavailable (backend methods missing)
- Admin hotel visibility controls temporarily unavailable (backend methods missing)

### Rollback Plan
If critical issues are discovered:
1. Revert to previous canister version (v46)
2. Investigate root cause
3. Apply hotfix if needed
4. Re-deploy with fix

### Notes
- This is a compatibility restoration release, not a feature release
- Backend methods need to be re-implemented to restore full functionality
- Room photo upload is the only fully functional feature in this release
- All other features show clear "unavailable" messages to users
- No data loss - all unavailable features fail gracefully with error messages

---

## Release V33 - Deploy Retry & UI Notice

**Release Date:** [YYYY-MM-DD]  
**Deployed By:** [Name]  
**Canister Version:** [Version]

### Summary
This release bumps the frontend build version to v33 to force a fresh build artifact and adds an admin-facing notice about the Caffeine deploy UI sometimes not showing the Publish URL / Open App link.

### Deploy Outcome
- [ ] Caffeine showed the Publish URL / "Open App" link after deployment
- [ ] If URL was missing: Recorded error message or confirmation that deploy succeeded but URL did not appear
- [ ] App is accessible and functional (verified by manual testing)

### Verification Results
- [ ] Admin Panel loads correctly
- [ ] CaffeineDeployUiNotice appears at the top of Admin Panel
- [ ] Notice is informational only and does not block any admin tools
- [ ] Build version v33 is visible in the app footer

### Known Issues
- Caffeine platform may intermittently fail to display the Publish URL / Open App link after successful deploys (platform issue, not app issue)

### Rollback Plan
If critical issues are discovered:
1. Revert to previous canister version (v32)
2. Investigate root cause
3. Apply hotfix if needed
4. Re-deploy with fix

### Notes
- This release does not change any business logic or app functionality
- The CaffeineDeployUiNotice is purely informational for admins
- If the Publish URL is missing, try refreshing the page or switching between Draft/Live tabs

---

## Release V40+ - HOTEL DUMMY One-Time Purge & Ghost Room Prevention

**Release Date:** [YYYY-MM-DD]  
**Deployed By:** [Name]  
**Canister Version:** [Version]

### Summary
This release includes a one-time backend cleanup that removes ALL room data for HOTEL DUMMY and prevents ghost/placeholder rooms from appearing in any hotel listings.

### Verification Results

#### HOTEL DUMMY Purge
- [ ] HOTEL DUMMY shows zero rooms in Guest Browse Hotels
- [ ] HOTEL DUMMY detail page shows "No rooms available"
- [ ] HOTEL DUMMY hotel profile (name, location, contact) is preserved
- [ ] Other hotels' rooms are unaffected

#### Ghost Room Prevention
- [ ] No placeholder rooms (empty fields, $0 price) appear in any hotel listing
- [ ] All displayed rooms have valid data (room number, type, price)
- [ ] Hotel Area → Rooms works correctly for non-HOTEL DUMMY hotels
- [ ] Admin panel hotel visibility toggles work correctly

#### Key Flows Verified
- [ ] Guest Browse Hotels loads and shows active hotels correctly
- [ ] Hotel Detail page displays rooms correctly for non-HOTEL DUMMY hotels
- [ ] Hotel Area → Rooms (non-HOTEL DUMMY) allows room creation/editing
- [ ] Admin panel loads and hotel visibility toggles work

#### Idempotency Check
- [ ] Subsequent upgrade does not cause errors or duplicate cleanup
- [ ] HOTEL DUMMY remains at zero rooms after multiple upgrades

### Known Issues
- None

### Rollback Plan
If critical issues are discovered:
1. Revert to previous canister version
2. Investigate root cause
3. Apply hotfix if needed
4. Re-deploy with fix

### Notes
- The one-time cleanup is idempotent and safe to run multiple times
- HOTEL DUMMY can re-add rooms manually via Hotel Area if needed
- Ghost room prevention is permanent and applies to all hotels

---

## Release V39 - Legacy Data Cleanup

**Release Date:** [YYYY-MM-DD]  
**Deployed By:** [Name]  
**Canister Version:** [Version]

### Summary
This release removes ghost room photos and legacy payment methods (GOPAY, email-as-payment-method) while preserving active hotel data for token `HOTEL_17705984310722985941`.

### Verification Results

#### Ghost Room Photos
- [ ] No old/ghost room photos appear in Guest Browse Hotels
- [ ] Hotel detail pages show only current room photos
- [ ] Admin view shows consistent data with guest view

#### Legacy Payment Methods
- [ ] GOPAY payment method removed from hotel profile
- [ ] Email not listed as payment method
- [ ] Hotel can add new payment methods successfully

#### Active Hotel Data Preserved
- [ ] All current rooms and photos intact for token `HOTEL_17705984310722985941`
- [ ] Hotel profile data (name, location, address, contact) intact
- [ ] Room editing and photo upload still work

#### Legacy Token Cleanup
- [ ] Legacy token `1-invite-1770546868497298151` marked as "Used" or "Unbound (Legacy)"
- [ ] No legacy token data appears in app

### Known Issues
- None

### Rollback Plan
If critical issues are discovered:
1. Revert to previous canister version
2. Use Admin Panel → Data Cleanup Utility to manually restore data if needed
3. Investigate root cause
4. Apply hotfix if needed
5. Re-deploy with fix

### Notes
- If ghost photos or legacy payment methods still appear, use Admin Panel → Data Cleanup Utility to manually remove them
