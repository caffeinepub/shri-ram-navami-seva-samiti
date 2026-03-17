# Shri Ram Navami Seva Samiti

## Current State
After admin approval, member sees QR code and a 'मैंने भुगतान कर दिया है' button. Tapping this button directly calls `confirmMemberPayment` on the backend, instantly marking payment as done and unlocking ID card — with no actual verification.

## Requested Changes (Diff)

### Add
- Backend: `paymentScreenshot` field to MemberApplication type
- Backend: `submitPaymentProof(id, screenshot)` public function — members call this to upload their payment screenshot
- Frontend (member side): Replace the single button with a screenshot upload form; after upload show 'Admin की पुष्टि का इंतज़ार करें' message
- Frontend (admin panel): Show payment screenshot thumbnail for each approved member; add 'भुगतान पुष्टि करें' button that calls `confirmMemberPayment`

### Modify
- `confirmMemberPayment` is now only used from admin panel (not directly by member)
- Member success state only shows after `paymentDone === true` (set by admin)

### Remove
- Remove member-side direct payment confirm button (`handleConfirmMemberPayment`)

## Implementation Plan
1. Update backend: add `paymentScreenshot` field, add `submitPaymentProof` function
2. Update frontend member lookup section: screenshot upload form, pending verification message
3. Update admin panel: show payment screenshot, add confirm payment button
