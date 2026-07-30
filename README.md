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

---

## ✒️ Typography System

The typography hierarchy uses Google Fonts loaded via CSS `@import`:
- **Headings & Page Titles**: [`Inter`](https://fonts.google.com/specimen/Inter)
- **Paragraphs, Body Text, Links (`<a>`), Buttons & Navigation**: [`Andika`](https://fonts.google.com/specimen/Andika)

### Type Scale Hierarchy

| Selector / Class | Font Family | Desktop Size | Tablet (≤1024px) | Mobile (≤480px) | Line Height & Weight |
|---|---|---|---|---|---|
| **`h1` / `.title`** | `Inter` | `40px` | `32px` | `28px` | Line-height `1.08em`, Weight `500` |
| **`h2` / `.subtitle`** | `Inter` | `28px` | `24px` | `20px` | Line-height `1.20em`, Weight `400` |
| **`.big-txt`** | `Andika` | `18px` | `16px` | `16px` | Line-height `1.40em`, Weight `400` |
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
├── components.js            # Dynamic component loader & mobile navigation controller
├── index.html               # Main homepage
├── style.css                # Centralized stylesheet & design system tokens
└── README.md                # Design system & project documentation
```
