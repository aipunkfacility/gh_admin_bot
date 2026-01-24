---
name: brand-guidelines
description: Applies Green Hill's official brand colors and typography. Use it when styling UI components, creating artifacts, or designing interfaces to ensure consistency with the design system.
license: Complete terms in LICENSE.txt
---

# Green Hill Brand Styling

## Overview

Access Green Hill's official brand identity and style resources.

**Keywords**: branding, green hill, visual identity, colors, typography, design system

## Brand Guidelines

### Colors

**Primary Actions (Action):**

- **Action (Orange)**: `#f97316` (Tailwind `orange-500`) - Used for primary buttons, call-to-actions, and interactive elements.
- **Action Hover**: `#ea580c` (Tailwind `orange-600`) - Hover state for action elements.

**Brand Identity (Brand):**

- **Brand (Green)**: `#16a34a` (Tailwind `green-600`) - Used for logos, sidebars, active states in navigation, and brand accents.
- **Dark**: `#0f172a` (Tailwind `slate-900`) - Primary text and dark backgrounds.
- **Slate**: `#64748b` (Tailwind `slate-500`) - Secondary text.

### Typography

- **Headings**: `Montserrat` (Weights: 700/800/900) - For H1-H6, titles, and emphatic text.
- **Body**: `Inter` (Weights: 400/500/600) - For paragraphs, UI labels, and data tables.
- **Monospace**: `JetBrains Mono` or `Fira Code` - For code blocks.

## Usage in Code

### CSS Variables

The project uses CSS variables defined in `:root`:

```css
:root {
  --color-action: #f97316;
  --color-brand: #16a34a;
  --font-main: 'Inter', sans-serif;
  --font-header: 'Montserrat', sans-serif;
}
```

### Tailwind Classes

- **Action**: `bg-action`, `text-action`, `border-action`
- **Brand**: `bg-brand`, `text-brand`, `border-brand`
- **Fonts**: `font-sans` (Inter), `font-header` (Montserrat)

## Features

### Smart Application

- When designing UI, always prefer `bg-action` for buttons that trigger a state change (Save, Book, Submit).
- Use `bg-brand` for static branding elements (Sidebar, Logo, Badges).
- Ensure high contrast: Action/Brand background usually requires `text-white`.

### Text Styling rules

- Headings are always **Bold** or **ExtraBold**.
- Uppercase helps for section titles (`tracking-widest uppercase`).
