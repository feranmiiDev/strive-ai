---
name: Antigravity Lumina
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4e4355'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#7f7386'
  outline-variant: '#d1c1d7'
  surface-tint: '#8d02e3'
  primary: '#8a00de'
  on-primary: '#ffffff'
  primary-container: '#a635fb'
  on-primary-container: '#fffbff'
  inverse-primary: '#e0b6ff'
  secondary: '#00696f'
  on-secondary: '#ffffff'
  secondary-container: '#00f1fd'
  on-secondary-container: '#006a6f'
  tertiary: '#5d5c5b'
  on-tertiary: '#ffffff'
  tertiary-container: '#757474'
  on-tertiary-container: '#f7feff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#f2daff'
  primary-fixed-dim: '#e0b6ff'
  on-primary-fixed: '#2e004e'
  on-primary-fixed-variant: '#6c00ae'
  secondary-fixed: '#6ff6ff'
  secondary-fixed-dim: '#00dce6'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#004f53'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 24px
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
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
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
  margin-desktop: 48px
---

## Brand & Style
This design system captures a sense of weightlessness and hyper-modern fluidity. Drawing directly from the Antigravity aesthetic, it utilizes **Glassmorphism** and **High-Motion** visuals to create an interface that feels like it’s floating in a digital ether. 

The brand personality is innovative, technical, yet highly approachable. It relies on a "Pure White" canvas punctuated by vibrant, energetic accents. The user experience should feel fast, responsive, and ethereal, utilizing procedural backgrounds and blurred glass panels to provide a multi-dimensional depth without clutter.

## Colors
The palette is dominated by a stark **Pure White** background to maintain the "light" and "airy" theme. Vibrancy is introduced through high-frequency accents: **Electric Purple** for primary actions and **Neon Cyan** for secondary highlights and success states.

The neutral palette is kept minimal, using a deep off-black for text to ensure legibility against the white and glass surfaces. Glass surfaces use a semi-transparent white tint, creating a sophisticated layering effect.

## Typography
**Hanken Grotesk** is the sole typeface, chosen for its clean, geometric, and modern construction. 

- **Headlines:** Use tighter letter-spacing and heavier weights to anchor the floating layout.
- **Body:** Open leading (line-height) is essential to maintain the "breathable" feel of the system.
- **Labels:** Small caps or slightly increased letter-spacing should be used for metadata to distinguish it from body prose.
- **Mobile:** For screens smaller than 768px, `display-lg` should scale down to 40px and `headline-lg` to 32px.

## Layout & Spacing
The layout follows a **Fluid Grid** model with generous margins to emphasize the "floating" nature of the content. Elements are rarely cramped; negative space is treated as a functional element.

- **Grid:** 12-column system for desktop, 4-column for mobile.
- **Rhythm:** An 8px linear scale drives all padding and margin increments.
- **Safe Areas:** High-motion particles and background gradients should bleed into the margins, while functional UI stays within the container-max.

## Elevation & Depth
Depth is achieved through **Glassmorphism** and **Chromo-Shadows**. Rather than traditional grey shadows, this system uses low-opacity blurs of the accent colors (Purple/Cyan) to imply light refraction.

- **Glass Panels:** Apply `backdrop-filter: blur(20px)` and a thin `1px` solid white border at 80% opacity.
- **Shadows:** Floating elements (like cards or primary buttons) use a dual-stack shadow: a soft, neutral ambient occlusion shadow combined with a subtle Electric Purple glow at the bottom-right.
- **Layers:** Use z-index to stack glass panels, increasing the blur amount on deeper layers to simulate focal depth.

## Shapes
The shape language is consistently **Rounded**, avoiding sharp corners to maintain the friendly, high-tech aesthetic. 

- **Primary Elements:** 0.5rem (8px) radius.
- **Large Containers/Cards:** 1.5rem (24px) radius to create a soft, organic feel for the glass panels.
- **Interactive Triggers:** Buttons and inputs utilize a slightly more aggressive rounding (1rem) to differentiate them from static containers.

## Components
- **Buttons:** Primary buttons use a solid Electric Purple fill with a Cyan outer glow on hover. Secondary buttons are ultra-clear glass with a 1px white border.
- **Input Fields:** Semi-transparent white backgrounds with a subtle Cyan bottom-border that "glows" and expands when focused.
- **Cards (Glass Panels):** High-transparency white backgrounds with heavy backdrop-blur. Content inside cards should have high contrast (Deep Charcoal or Purple).
- **Chips/Badges:** Small, pill-shaped elements with Neon Cyan backgrounds and white text, or glass backgrounds with Purple borders.
- **Lists:** Separated by thin, low-opacity lines or simply by vertical space. Hovering over a list item should trigger a subtle glass highlight effect.
- **Progressive Particles:** Not a standard component, but a background requirement. Use SVG or Canvas-based particles that react slightly to cursor movement to reinforce the "Antigravity" theme.