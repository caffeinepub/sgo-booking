# Release Notes Template

Use this template to document verification results for each release. Copy the relevant section into your PR description or release notes.

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
- If ghost photos or legacy payment methods still appear, use Admin Panel → Data Cleanup Utility
- Active hotel token `HOTEL_17705984310722985941` must remain functional

---

## Template for Future Releases

**Release Date:** [YYYY-MM-DD]  
**Deployed By:** [Name]  
**Canister Version:** [Version]

### Summary
[Brief description of changes]

### Verification Results
- [ ] [Key verification point 1]
- [ ] [Key verification point 2]
- [ ] [Key verification point 3]

### Known Issues
- [List any known issues or limitations]

### Rollback Plan
[Steps to rollback if needed]

### Notes
[Any additional context or observations]
