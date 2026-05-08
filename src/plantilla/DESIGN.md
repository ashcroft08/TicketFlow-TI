---
name: Technical ERP Design System
colors:
  surface: '#f9f9ff'
  surface-dim: '#cadaff'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e8edff'
  surface-container-high: '#e0e8ff'
  surface-container-highest: '#d7e2ff'
  on-surface: '#041b3c'
  on-surface-variant: '#434654'
  inverse-surface: '#1d3052'
  inverse-on-surface: '#edf0ff'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#0c56d0'
  primary: '#003d9b'
  on-primary: '#ffffff'
  primary-container: '#0052cc'
  on-primary-container: '#c4d2ff'
  inverse-primary: '#b2c5ff'
  secondary: '#006c47'
  on-secondary: '#ffffff'
  secondary-container: '#82f9be'
  on-secondary-container: '#00734c'
  tertiary: '#851800'
  on-tertiary: '#ffffff'
  tertiary-container: '#b02300'
  on-tertiary-container: '#ffc6b9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#0040a2'
  secondary-fixed: '#82f9be'
  secondary-fixed-dim: '#65dca4'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005235'
  tertiary-fixed: '#ffdad2'
  tertiary-fixed-dim: '#ffb4a3'
  on-tertiary-fixed: '#3d0600'
  on-tertiary-fixed-variant: '#8b1a00'
  background: '#f9f9ff'
  on-background: '#041b3c'
  surface-variant: '#d7e2ff'
typography:
  h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  h2:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  code:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-margin: 24px
  gutter: 16px
  sidebar-width: 240px
  density-dense: 8px
  density-comfortable: 16px
---

## Brand & Style

The brand personality of the design system is authoritative, dependable, and precision-oriented. It is engineered for IT professionals who require high-density information environments that prioritize utility over aesthetic flair. The design style follows a **Corporate / Modern** approach, blending the structured efficiency of professional-grade software with the clean clarity of modern minimalism. 

The emotional response should be one of "controlled efficiency." Every element is designed to reduce cognitive load during high-stress troubleshooting or complex inventory audits. The interface avoids unnecessary decoration, using whitespace purposefully to separate data clusters while maintaining a high information density required for expert-level workflows.

## Colors

The palette for the design system is rooted in functional signaling. 

- **Primary (IT Blue):** Used for primary actions, navigation states, and brand-level components. It signals intelligence and reliability.
- **Success (Green):** Specifically reserved for "Active" ticket statuses, "Online" asset status, and completed tasks.
- **Alert (Red):** Used exclusively for critical issues, hardware failures, or overdue tickets.
- **Neutral Grayscale:** A comprehensive range of cool grays. The background uses a light gray to reduce eye strain, while borders and text utilize darker tones for crisp legibility and structural definition.

Color should be used sparingly to draw attention to status changes and actionable items, ensuring that the interface remains neutral until human intervention or system status requires a visual cue.

## Typography

This design system utilizes **Inter** for its systematic, utilitarian qualities. Given the ERP nature of the product, typography is optimized for data scanning rather than long-form reading.

- **Scale:** A compact scale is used to accommodate dense information layouts.
- **Weights:** Semi-bold (600) is used for headers and labels to provide immediate hierarchy against the standard 400 weight body text.
- **Numerical Data:** For inventory counts and ticket IDs, ensure the use of tabular lining (font-feature-settings: 'tnum') to keep columns of numbers perfectly aligned in data tables.
- **Labels:** Small, all-caps labels are used for metadata and table headers to distinguish structural elements from user-generated content.

## Layout & Spacing

The layout philosophy of the design system is a **Fluid Grid** with a fixed-width navigation sidebar. 

- **Grid:** A 12-column grid system is used for page content. Elements should span 3, 4, 6, or 12 columns to maintain structural balance.
- **Sidebar:** A vertical sidebar fixed at 240px resides on the left, containing the primary application navigation.
- **Density:** We employ an 8px-based spacing rhythm. For data-heavy views (inventory lists, ticket logs), padding is reduced to 8px (dense) to maximize vertical real estate. For configuration pages or dashboards, padding increases to 16px (comfortable).
- **Margins:** Standard page margins are set to 24px to provide breathing room from the edge of the viewport and the sidebar.

## Elevation & Depth

To maintain a clean and professional appearance, the design system avoids heavy shadows in favor of **Tonal Layers** and **Low-Contrast Outlines**.

- **Z-Axis Hierarchy:** The background uses the lowest level gray. Main content surfaces (cards, tables) are pure white with a 1px solid border (#DFE1E6).
- **Floating Elements:** Modals and dropdown menus use a single, soft ambient shadow (0px 4px 12px rgba(9, 30, 66, 0.15)) to indicate they are temporary overlays.
- **Interaction:** Buttons and interactive cards do not lift on hover; instead, they utilize subtle background color shifts (e.g., darkening by 5%) to indicate state change without disrupting the visual plane.

## Shapes

The shape language is **Soft (Level 1)**. 

- **Radius:** A standard 4px (0.25rem) border radius is applied to all buttons, input fields, and status badges. This creates a modern feel that remains rigid enough for a professional ERP context.
- **Large Components:** Cards and main containers use an 8px radius to subtly distinguish major sections of the interface.
- **Circular Elements:** Reserved strictly for user avatars or specific toggle switches.

## Components

The components within the design system are built for durability and high-frequency use.

- **Data Tables:** The core of the system. They feature sticky headers, sortable columns, and a 1px bottom border on rows. Row height is fixed at 40px for "dense" mode.
- **Status Badges:** Compact labels with a subtle background tint and high-contrast text. 
    - *Critical:* Light red background, Bold Red text.
    - *Active:* Light green background, Bold Green text.
- **Action Buttons:**
    - *Primary:* Solid IT Blue with white text.
    - *Secondary:* Ghost style with IT Blue border and text.
    - *Tertiary:* Text only, for low-priority actions like "Cancel."
- **Input Fields:** Rectangular with a 1px gray border. Focus state is indicated by a 2px IT Blue stroke. Labels are always positioned above the input.
- **Navigation Sidebar:** Dark-themed (#172B4D) or high-contrast light. Icons are paired with labels for clarity. Active states are indicated by a 4px vertical "Primary Blue" strip on the left edge.
- **Inventory Cards:** Used for high-level asset summaries, featuring a large numerical value (count) and a small sparkline for trends.