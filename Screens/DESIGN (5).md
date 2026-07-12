---
name: Weightless Academic
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#555f6f'
  on-secondary: '#ffffff'
  secondary-container: '#d6e0f3'
  on-secondary-container: '#596373'
  tertiary: '#494bd6'
  on-tertiary: '#ffffff'
  tertiary-container: '#9699ff'
  on-tertiary-container: '#1d17b2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#d9e3f6'
  secondary-fixed-dim: '#bdc7d9'
  on-secondary-fixed: '#121c2a'
  on-secondary-fixed-variant: '#3d4756'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  title-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  section-gap: 64px
---

## Brand & Style
The design system focuses on a "Weightless SaaS" aesthetic—a philosophy that prioritizes cognitive clarity and physical lightness. It is designed for the high-achieving individual student who views their education as a personal venture rather than an institutional requirement. 

The visual style blends **Modern Minimalism** with **Soft Glassmorphism**. By using high transparency, subtle blurs, and generous negative space, the interface feels less like a rigid database and more like an open, breathable workspace. The target emotional response is one of "Intellectual Flow"—where the UI recedes to let the student’s goals, progress, and insights take center stage.

Key characteristics:
- **Atmospheric:** Use of background blurs to suggest depth without weight.
- **Precision:** Sharp, purposeful data visualizations.
- **Personalized:** Focus on individual milestones, "Deep Work" timers, and personal grade trajectories.

## Colors
The palette is rooted in **Emerald Green**, symbolizing growth, vitality, and successful completion. This is paired with **Deep Charcoal** for authoritative typography and structural elements.

- **Primary (Emerald):** Reserved for "success" states, progress bars, and primary action triggers.
- **Secondary (Charcoal):** Used for high-emphasis text and grounding elements like navigation icons.
- **Tertiary (Indigo):** A subtle accent for "Deep Work" or "Research" categories to differentiate from standard tasks.
- **Background Strategy:** The interface uses a "Pure White" base. Over this, semi-transparent surfaces (Glassmorphism) allow soft, out-of-focus academic-themed imagery (like blurred library vistas or botanical sketches) to peek through, creating an airy, layered environment.

## Typography
This design system utilizes **Hanken Grotesk** exclusively to maintain a cohesive, high-performance SaaS feel. The typeface’s geometric clarity provides the precision required for data-heavy academic dashboards while remaining approachable.

- **Headlines:** Use tighter letter spacing and heavier weights to create strong visual anchors.
- **Data Points:** Numbers should use the medium weight to ensure they stand out against body copy.
- **Labels:** Small caps or increased letter spacing should be used for metadata and category tags to ensure they don't compete with primary content.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a "Wide Margin" philosophy to reinforce the sense of weightlessness. Content should never feel cramped; if in doubt, increase the white space.

- **Grid:** A 12-column system for desktop, collapsing to a single column for mobile.
- **Rhythm:** An 8px linear scale governs all padding and margins. 
- **The "Floating" Philosophy:** Components should have generous external margins (24px+) to appear as if they are floating independently over the background imagery.
- **Responsive Behavior:** On mobile, glassmorphism intensity increases (less transparency) to ensure legibility over smaller screen areas, and the `headline-lg` scales down significantly.

## Elevation & Depth
Depth is created through **Glassmorphism and Tonal Layering** rather than traditional heavy shadows.

1.  **Level 0 (Base):** Pure white background with soft, 5% opacity academic imagery.
2.  **Level 1 (Cards/Containers):** `rgba(255, 255, 255, 0.6)` with a `20px` backdrop-filter blur. A 1px solid white border (`rgba(255, 255, 255, 0.8)`) mimics light hitting the edge of a glass pane.
3.  **Level 2 (Active/Floating):** Subtle, ultra-diffused shadow (`0px 20px 40px rgba(0, 0, 0, 0.04)`) used only for elements the user is currently interacting with, like an active modal or a dragged task.

Avoid dark shadows. The goal is to simulate "etched glass" rather than "projected objects."

## Shapes
The shape language is **Modern Rounded**, utilizing a `0.5rem` (8px) base radius. This strikes a balance between the precision of a professional tool and the comfort of a personal space.

- **Standard Elements:** Buttons and small inputs use the base `rounded` (8px).
- **Large Containers:** Dashboard widgets and cards use `rounded-lg` (16px) to create a softer, more inviting appearance.
- **Interactive Triggers:** Status chips and search bars use `rounded-xl` (24px) or full pills to distinguish them from static content.

## Components
- **Buttons:** Primary buttons use a solid Emerald Green fill with white text. Secondary buttons are "Ghost" style: transparent background, 1px Charcoal border, and Charcoal text.
- **Status Chips:** Use a light tint of the primary color (`rgba(16, 185, 129, 0.1)`) with high-contrast text to indicate "Completed" or "Active" courses.
- **Academic Cards:** Each card (e.g., "Current GPA", "Next Assignment") must feature a glass effect. Titles are `title-md` and data points use the Primary Emerald Green.
- **Input Fields:** Minimalist design with a 1px soft grey bottom border that transforms into an Emerald Green border on focus. No heavy boxes.
- **Progress Gauges:** Circular, thin-stroke gauges to visualize credit completion or "Deep Work" sessions.
- **Focus Timer:** A bespoke component featuring a large `display-lg` countdown timer centered in a glass container, used to trigger a "distraction-free" UI mode where navigation fades out.