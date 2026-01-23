---
name: ui-ux-designer
description: Expert skill for Green Hill UI/UX design (Web + Bot). Use for designing interfaces, maintaining brand consistency, and ensuring usability. Generates creative, polished code and UI design that avoids generic AI aesthetics.
---

# UI/UX Designer

Design system and usability guidelines for Green Hill.
This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: For Green Hill, we aim for **Modern Tropical Luxury**. Clean, airy, but with vibrant accents.
- **Constraints**:
  - **Web**: Astro, Tailwind CSS, Performance (SSR).
  - **Bot**: Telegram API limitations, Mobile-first.
- **Differentiation**: what makes this UNFORGETTABLE?

**CRITICAL**: Match implementation complexity to the aesthetic vision. Elegance comes from executing the vision well.

## Frontend Aesthetics Guidelines (Web)

Focus on:

- **Typography**: `Inter` (Google Fonts). Use weights and sizes to create hierarchy.
- **Color & Theme**:
  - **Primary**: `green-600` (Brand Green).
  - **Secondary**: `orange-500` (Call to Action).
  - **Background**: `slate-50` (Light), `slate-900` (Dark).
  - Use gradients judiciously (e.g., subtle green-to-teal overlays).
- **Motion**: Use `framer-motion` (if React) or CSS transitions for hover states.
- **Space**: Generous whitespace. Cards should breathe.

**NEVER** use generic AI-generated aesthetics like clashing purple gradients or unstyled scrollbars.

## Admin UI Patterns

- **Card**: White bg, shadow-sm, rounded-lg, border border-gray-100.
- **Table**: Zebra striping, sticky header, hover rows.
- **Modal**: Centered, backdrop blur (`backdrop-blur-sm`).
- **Toast**: Top-right, auto-dismiss 3s, distinct colors (Success/Error).

## Telegram Bot UX

### Menu Principles

1. **Depth vs Breadth**: Max 3 rows of buttons. Max 2 buttons per row.
2. **Back Button**: Always valid. Must return to previous state.
3. **Pagination**: Use `« 1 / 5 »` style for lists > 10 items.
4. **Media**: Use high-quality photos with captions formatted in HTML (bold titles).

### Web Apps (Mini Apps)

Use for complex interactions that Bot API cannot handle gracefully:

- Date pickers (Calendars)
- Map location selection
- Complex forms (Booking)

## References

- `assets/palette.json` (to be created)
- `assets/components/` (HTML/Tailwind snippets)
