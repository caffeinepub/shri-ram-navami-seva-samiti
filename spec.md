# Shri Ram Navami Seva Samiti

## Current State
A Hindi-language website with hero, about, events, donation section, ID card section, membership form modal, and admin panel. The donation form has basic card layout with QR code display. Admin login button is triggered from somewhere in the nav/footer area. The website uses saffron/orange theme throughout.

## Requested Changes (Diff)

### Add
- A floating "Admin" button fixed to the right side of the screen (vertical, small, subtle) that opens the admin login panel

### Modify
- Donation form: Redesign to match the membership form style -- card with labeled input fields, proper spacing, icons, similar layout structure and visual treatment
- Overall website design: More professional polish -- better typography hierarchy, refined cards, improved spacing, subtle decorative elements; keep all existing sections, settings, and functionality intact
- Remove the existing admin login trigger from wherever it currently is (footer/nav) and replace with the floating side button

### Remove
- Nothing else

## Implementation Plan
1. Find where admin panel is triggered currently (check footer/nav for admin button)
2. Add a fixed floating "Admin" button on the right side of the screen
3. Redesign the donation form to match membership form style: card layout, labeled fields with borders, icons, consistent padding
4. Apply professional polish: better section headings, refined card shadows, improved spacing, consistent font sizing hierarchy
5. Keep all functionality, state, backend calls, IDs, and data-ocid attributes intact
