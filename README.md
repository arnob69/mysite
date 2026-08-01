# Design System & Documentation

Welcome to the **arnob69.com** design system and code structure documentation. This document details the CSS design tokens, typography rules, component layouts, responsive breakpoints, and repository architecture.

---

## 🎨 Color & Design System Tokens

The site implements native CSS `light-dark()` primitives defined on `:root`, delivering automatic light and dark mode styling based on system user preferences alongside standard layout tokens.

| Token | CSS Variable | Value / Light-Dark Definition | Purpose & Application |
|---|---|---|---|
| **Base Dark** | `--color_B` | `light-dark(#000, #fff)` | Primary text, headings, dark surfaces & active states |
| **Base Light** | `--color_W` | `light-dark(#fff, #000)` | Primary page background, card surfaces |
| **Transparent** | `--color_0` | `light-dark(#0000, #fff0)` | Default transparent button fill |
| **Muted Dark (60%)** | `--color_B_60` | `light-dark(#00000099, #ffffffcc)` | Secondary navigation links, default SVG icon stroke |
| **Subtle Dark (80%)** | `--color_B_80` | `light-dark(#000000cc, #ffffffcc)` | Paragraph copy, secondary text elements |
| **Inverted Muted (60%)** | `--color_W_60` | `light-dark(#ffffffcc, #00000099)` | Reversed dropdown menu background link colors |
| **Border Radius** | `--radius` | `4px` | Standard border radius for dropdown menus and cards |
| **Motion Ease** | `--ease` | `cubic-bezier(.16,1,.3,1)` | Reveal, page-transition & letter-wave easing |
| **Motion Duration** | `--motion` | `.7s` | Reveal fade/slide duration |
| **Motion Duration (fast)** | `--motion-fast` | `.45s` | Page-transition crossfade duration |

---

## ✒️ Typography System

The typography hierarchy uses Google Fonts loaded via CSS `@import`:
- **Headings & Page Titles**: [`Inter`](https://fonts.google.com/specimen/Inter)
- **Paragraphs, Body Text, Links (`<a>`), Buttons & Navigation**: [`Andika`](https://fonts.google.com/specimen/Andika)

### Type Scale Hierarchy

| Selector / Class | Font Family | Desktop Size | Tablet (≤1024px) | Mobile (≤480px) | Line Height & Weight |
|---|---|---|---|---|---|
| **`h1` / `.title`** | `Inter` | `40px` | `32px` | `28px` | Line-height `1.08em`, Weight `500` |
| **`h2` / `.subtitle`** | `Inter` | `24px` | `24px` | `20px` | Line-height `1.20em`, Weight `400` |
| **`.big-txt`** | `Andika` | `18px` | `16px` | `16px` | Line-height `1.40em`, Weight `300` |
| **`p` / `.txt`** | `Andika` | `16px` | `14px` | `14px` | Line-height `1.60em`, Weight `400` |
| **`a` / `button` / `.cta_button`** | `Andika` | `16px` | `14px` | `14px` | Line-height `1.00em`, Weight `400` |

---

## 🧱 Layout Components & Patterns

### 1. Spatial Grid & Padding Hierarchy

| Container | Breakpoint | Top Padding | Left/Right Padding | Bottom Padding | Gap | Content Offset Alignment |
|---|---|---|---|---|---|---|
| **`.page`** | **Desktop (`>1024px`)** | `260px` | `0px` | `80px` | `80px` | Centered `1280px` container |
| **`.page`** | **Tablet (`≤1024px`)** | `220px` | `32px` | `60px` | `60px` | Flush left content alignment |
| **`.page`** | **Mobile (`≤480px`)** | `180px` | `16px` | `40px` | `40px` | Flush left content alignment |
| **`.sticky_header`** | **Desktop (`>1024px`)** | `20px` | `0px` | `20px` | — | Fixed top `0`, `max-width: 1280px` |
| **`.sticky_header`** | **Tablet (`≤1024px`)** | `16px` | `32px` | `16px` | — | Aligns with `.page` `32px` side padding |
| **`.sticky_header`** | **Mobile (`≤480px`)** | `16px` | `16px` | `16px` | — | Aligns with `.page` `16px` side padding |
| **`.site_footer`** | **Desktop (`>1024px`)** | `40px` | `0px` | `40px` | — | Minimal borderless `space-between` layout |
| **`.site_footer`** | **Tablet (`≤1024px`)** | `40px` | `32px` | `40px` | — | Aligns with `.page` `32px` side padding |
| **`.site_footer`** | **Mobile (`≤480px`)** | `40px` | `16px` | `40px` | — | Aligns with `.page` `16px` side padding |

---

### 2. Header & Dropdown Navigation
- **Desktop Navigation**: Fixed top header (`position: fixed; top: 0; z-index: 999`) with dropdown menus (`.navigation_dropdown`) rendered over `--color_B` dark surfaces using `border-radius: var(--radius)`.
- **Mobile Navigation Overlay**: Full-screen overlay menu (`.mobile_menu_overlay`) aligned to page padding (`220px` top / `32px` side on tablet, `180px` top / `16px` side on mobile).
- **Mobile Accordion Sub-menus**:
  - Sub-menus are set to `display: none` when collapsed.
  - Interactive click handlers enforce a **maximum of 1 open sub-menu at a time**.
  - All navigation rows share an exact `height: 24px` for uniform vertical rhythm.

---

### 3. Ultra-Minimal Borderless Footer (`.site_footer`)
- **Layout**: Borderless `space-between` flex row.
- **Left Side**: Copyright label `© ARN03`.
- **Right Side**: Essential external links (`GitHub`, `Figma`, `YouTube`) styled as `.cta_button` components with vector SVG arrow icons (`.arrow_icon`) and `target="_blank"`.

---

### 4. Call-to-Action Buttons & Button Wrappers (`.cta_button`, `.featured_work_button`)
- **Flex Wrap Layout**: `.featured_work_button` containers use `display: flex; gap: 16px; flex-wrap: wrap;` ensuring action button pairs wrap cleanly without overflow on narrow screens.
- **Interactive States**: `.cta_button` and `.cta_button_alt` elements pair label text with inline vector arrow icons (`.arrow_icon`) featuring `.35s ease` color and stroke transitions, plus the letter-wave hover motion described below.

---

### 5. Motion System (`components.js` + `style.css`)
Three coordinated pieces, all driven by `components.js` toggling CSS classes — no inline styles anywhere.

**Reveal.** Any `.section`, `.featured_card`, `.split_content`, `.split_media`, `.faq_item`, or `.site_footer` is watched with an `IntersectionObserver`. Its content is flattened into a sequence of `.reveal-item`s — transparently unwrapping purely-structural containers (`.header_text_group`, `.contact_form`) and stopping at grid wrappers (`.featured`, `.split_layout`, `.faq_accordion`) whose own children register as independent reveal groups instead. Each item gets a `reveal-in-N` / `reveal-out-N` pair (`N` = position from the start / from the end) so entering staggers top-to-bottom and un-revealing on scroll-past staggers in reverse, bottom-to-top — both defined declaratively in `style.css` via CSS specificity, not inline styles or JS-computed timing. Same mechanism handles the first-load reveal (an `IntersectionObserver` reports already-visible elements immediately on `observe()`) and every subsequent scroll re-entry.

- New reveal group → add its selector to `REVEAL_ROOT_SELECTOR` in `components.js`.
- New purely-structural wrapper (spacing only, no visual identity of its own) → add to `REVEAL_FLATTEN_SELECTOR`.
- New grid/list wrapper whose children should reveal independently → add to `REVEAL_SKIP_SELECTOR`.
- Raise `REVEAL_MAX_STAGGER` (and add matching `.reveal-in-N`/`.reveal-out-N` rules in `style.css`) if a group ever needs more than 8 staggered pieces.

**Letter wave (Staggered Bounce animation).** `components.js` splits `.cta_button`, regular `a` links, and button labels into one `<span class="letter">` per character (spaces left as plain text) inside an `aria-hidden` wrapper; the accessible name moves to an `aria-label` on the element so screen readers still hear the real word.

*Note: This animation is active globally on all buttons, CTA buttons, and regular links. It is explicitly excluded from desktop navigation links (`.navigation_link`) and mobile navigation menus (`.mobile_nav_link`, `.mobile_sub_link`) to keep site menus static.*

On hover, JS toggles a `.wave-active` class on the element (using a double `requestAnimationFrame` trick to force the browser to restart the animation cleanly on every re-hover). When `.wave-active` is applied:
1. All letters instantly become invisible (`opacity: 0`).
2. Each letter then plays the `letter-reveal` `@keyframes` animation — fading in (`opacity: 0 → 1`) with a small vertical bounce (`translateY(6px) → translateY(-3px) → translateY(0)`) — over 350ms with `ease` timing.
3. Staggered `animation-delay` values (40ms per character via `nth-child` rules, up to 16 characters) create a sequential ripple from left to right.
4. On `mouseleave`, the `.wave-active` class is removed and letters return to full visibility instantly.

This approach uses only `opacity` and `transform` (both GPU-composited), causing **zero layout reflow or shift** — the link never changes size or position.

An alternative style (**`letter-pulse`**) is also defined in [style.css](file:///home/arnob/Downloads/ARN03-animated%20(1)/style.css#L484) and documented in [letter_reveal_component.md](file:///home/arnob/Downloads/ARN03-animated%20(1)/letter_reveal_component.md). It swaps the vertical bounce/fade-in for a clean, quiet scale pulse wave where letters remain fully visible.

**Page transitions.** Internal link clicks are intercepted (event-delegated on `document`, so no per-link wiring is needed); the destination is fetched, and only its `.page` content is swapped in — the header/footer persist and are re-rooted (`reRootLinks`) since their relative links depend on folder depth. The swap is wrapped in `document.startViewTransition` where supported for the crossfade defined via `::view-transition-old/new(root)`; browsers without it still get the reload-free swap, just without the crossfade. `prefers-reduced-motion: reduce` disables all three pieces in favor of showing content immediately.

---

## 🖼️ Images
`<img>` tags use `loading="lazy" decoding="async"` except each page's first/hero image, which stays eager so it never waits to appear. Follow this convention for any new images added below the fold. Several existing images in `/images` are considerably larger than they need to be for web delivery (multiple are 3–5.6MB); compressing/resizing those would make every animation on the page — not just the ones added here — feel snappier, especially on slower connections or devices.

---

## 📁 Repository Structure

```
/
├── articles/                # Articles section pages
├── components/              # Modular component fragments (header.html, footer.html)
├── contact/                 # Contact page
├── faq/                     # FAQ accordion page
├── images/                  # Media and graphical assets
├── lets-craft-a-website/    # Services & web design sub-app
├── resources/               # Code & design resources
├── works/                   # Case studies & portfolio projects
├── components.js            # Component loader, mobile nav, reveal/letter-wave/page-transition motion system
├── index.html               # Main homepage
├── style.css                # Centralized stylesheet & design system tokens
└── README.md                # Design system & project documentation
```
