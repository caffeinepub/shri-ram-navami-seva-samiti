# Shri Ram Navami Seva Samiti

## Current State
A Hindi-language static website for Ramnavami Seva Samiti with hero, about, events, donation (QR code only), and social sections. Footer has 'Website Designed by: Prakash Kumar' in small text.

## Requested Changes (Diff)

### Add
- Donation details form below the QR code in the donation section: fields for donor name, phone number, amount paid, and a message/note (optional)
- On form submit, save the donation record to the backend canister
- Show a success confirmation card after submission
- Admin view section (accessible via a button at bottom of donation section) to view all submitted donation records in a table/list
- Admin panel is password-protected (simple PIN: 1234) for privacy

### Modify
- Footer: 'Website Designed by: Prakash Kumar' — make it larger (text-base or text-lg), styled more prominently with a subtle border/highlight, not just a tiny footnote

### Remove
- Nothing removed

## Implementation Plan
1. Motoko backend: `submitDonation(name, phone, amount, note)` → stores DonationRecord with timestamp; `getDonations()` → returns all records
2. Frontend: Add DonationForm component in donation section with fields + submit button
3. Show success state after submit
4. Admin panel: PIN-protected dialog/section showing all donation records
5. Footer: increase Prakash Kumar credit size and style
