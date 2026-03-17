# Shri Ram Navami Seva Samiti

## Current State
Admin panel opens as a modal dialog with max-width 3xl and maxHeight 90vh. After login, it shows tabs and content inside the modal. Design is saffron/golden themed but constrained inside a popup.

## Requested Changes (Diff)

### Add
- Full-screen admin panel view after login (covers entire viewport, like a dedicated page)
- Professional sidebar navigation for admin panel (tabs on left side instead of top)
- Stats/summary cards at the top of each section
- Better table/card layout for donations and members with more spacing and polish
- Professional admin header with logout button and user info

### Modify
- After successful login, admin panel should expand to full screen (fixed inset-0, z-[100])
- Login screen stays as centered card (not full screen)
- Admin panel layout: left sidebar with navigation + right content area
- Overall visual quality: more professional dashboard look with better typography, spacing, and visual hierarchy

### Remove
- Nothing removed, only enhanced

## Implementation Plan
1. Change adminOpen modal: login shows as centered modal overlay, but after adminAuthenticated becomes true, switch to full-screen layout (fixed inset-0)
2. Create a sidebar with navigation items (दान इतिहास, सदस्यता आवेदन) on the left
3. Right content area with proper header showing admin info + logout button
4. Stats cards showing count summaries at top of each tab
5. Improve donation and member cards with better spacing and visual design
6. Professional color scheme consistent with site's saffron/golden theme
