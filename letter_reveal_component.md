# Letter Reveal Animation — Reusable Component

A drop-in sequential letter reveal animation. On hover, all letters hide instantly, then each letter fades in with a small bounce — one by one. **Zero layout shift.**

Works on: **links, buttons, paragraphs, headings** — any text element.

> [!NOTE]
> **Codebase Integration Status:**
> The **Staggered Bounce** (`letter-reveal`) animation is fully active globally for all buttons, CTA buttons, and regular links.
> - **Active Scope:** Set in [components.js](file:///home/arnob/Downloads/ARN03-animated%20(1)/components.js#L294) to target `.cta_button`, `button`, and regular `a` links.
> - **Navigation Exclusions:** Desktop navigation menus (`.navigation_link`) and mobile navigation menus (`.mobile_nav_link`, `.mobile_sub_link`) are explicitly excluded to keep menu selections static.
> - **CSS Definitions:** Located in the `Letter wave (hover)` block of [style.css](file:///home/arnob/Downloads/ARN03-animated%20(1)/style.css#L509).

---

## Preview

| State | What happens |
|-------|-------------|
| **Default** | Text visible, no animation |
| **Hover starts** | All letters go invisible instantly |
| **During hover** | Each letter fades in + pops up sequentially (40ms stagger) |
| **Hover ends** | Letters return to normal immediately |

---

## CSS

```css
/* ─── Letter Reveal Animation ─────────────────────────────────── */

@keyframes letter-reveal {
    0%   { opacity: 0; transform: translateY(6px); }
    50%  { opacity: 1; transform: translateY(-3px); }
    100% { opacity: 1; transform: translateY(0); }
}

/* Container that wraps the split letters */
.letter-wave {
    display: inline;
}

/* Each individual letter span */
.letter-wave .letter {
    display: inline-block;
}

/* ─── Trigger: add .wave-active class on hover via JS ─────────── */

.wave-active .letter-wave .letter {
    opacity: 0;
    animation: letter-reveal .35s ease forwards;
}

/* Staggered delays — each letter appears 40ms after the previous */
.wave-active .letter-wave .letter:nth-child(1)  { animation-delay: 0ms; }
.wave-active .letter-wave .letter:nth-child(2)  { animation-delay: 40ms; }
.wave-active .letter-wave .letter:nth-child(3)  { animation-delay: 60ms; }
.wave-active .letter-wave .letter:nth-child(4)  { animation-delay: 80ms; }
.wave-active .letter-wave .letter:nth-child(5)  { animation-delay: 100ms; }
.wave-active .letter-wave .letter:nth-child(6)  { animation-delay: 120ms; }
.wave-active .letter-wave .letter:nth-child(7)  { animation-delay: 140ms; }
.wave-active .letter-wave .letter:nth-child(8)  { animation-delay: 160ms; }
.wave-active .letter-wave .letter:nth-child(9)  { animation-delay: 180ms; }
.wave-active .letter-wave .letter:nth-child(10) { animation-delay: 200ms; }
.wave-active .letter-wave .letter:nth-child(11) { animation-delay: 220ms; }
.wave-active .letter-wave .letter:nth-child(12) { animation-delay: 240ms; }
.wave-active .letter-wave .letter:nth-child(13) { animation-delay: 260ms; }
.wave-active .letter-wave .letter:nth-child(14) { animation-delay: 280ms; }
.wave-active .letter-wave .letter:nth-child(15) { animation-delay: 300ms; }
.wave-active .letter-wave .letter:nth-child(16) { animation-delay: 320ms; }
.wave-active .letter-wave .letter:nth-child(17) { animation-delay: 340ms; }
.wave-active .letter-wave .letter:nth-child(18) { animation-delay: 360ms; }
.wave-active .letter-wave .letter:nth-child(19) { animation-delay: 380ms; }
.wave-active .letter-wave .letter:nth-child(20) { animation-delay: 400ms; }
.wave-active .letter-wave .letter:nth-child(n+21) { animation-delay: 420ms; }

/* ─── Reduced motion ─────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
    .letter-wave .letter {
        animation: none !important;
    }
    .wave-active .letter-wave .letter {
        animation: none !important;
        opacity: 1 !important;
    }
}
```

---

## JavaScript

```js
/**
 * Letter Reveal — Reusable Module
 *
 * Usage:
 *   1. Add class "letter-reveal" to any element whose text you want animated.
 *   2. Call  initLetterReveal()  after the DOM is ready.
 *
 * The script will:
 *   - Split the element's text into individual <span class="letter"> spans
 *   - Wrap them in a <span class="letter-wave"> container
 *   - Add mouseenter / mouseleave listeners to toggle .wave-active
 *   - Preserve spaces as plain text nodes (no collapsing)
 */

function initLetterReveal(scope = document) {
    const selector = '.letter-reveal';
    const els = [];

    if (scope.nodeType === Node.ELEMENT_NODE && scope.matches(selector)) {
        els.push(scope);
    }
    scope.querySelectorAll(selector).forEach(el => els.push(el));

    els.forEach(el => {
        if (el.dataset.letterRevealReady) return; // already wired
        el.dataset.letterRevealReady = 'true';

        // Find the text source — could be a nested <span> or the element itself
        const textEl =
            Array.from(el.children).find(c => c.tagName === 'SPAN' && !c.classList.contains('letter-wave'))
            || el;
        const label = textEl.textContent.trim();
        if (!label) return;

        // Accessibility: move visible text to aria-label
        el.setAttribute('aria-label', label);

        // Build the letter-wave wrapper
        const wave = document.createElement('span');
        wave.className = 'letter-wave';
        wave.setAttribute('aria-hidden', 'true');

        Array.from(label).forEach(ch => {
            if (ch === ' ') {
                wave.appendChild(document.createTextNode(' '));
            } else {
                const span = document.createElement('span');
                span.className = 'letter';
                span.textContent = ch;
                wave.appendChild(span);
            }
        });

        textEl.textContent = '';
        textEl.appendChild(wave);

        // Hover listeners — double rAF ensures animation replays every time
        el.addEventListener('mouseenter', () => {
            el.classList.remove('wave-active');
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    el.classList.add('wave-active');
                });
            });
        });

        el.addEventListener('mouseleave', () => {
            el.classList.remove('wave-active');
        });
    });
}

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => initLetterReveal());
```

---

## HTML Usage Examples

### Link / Button
```html
<a href="/contact" class="letter-reveal">Let's Talk</a>

<button class="letter-reveal">Submit Now</button>
```

### Heading
```html
<h2 class="letter-reveal">Featured Works</h2>
```

### Paragraph
```html
<p class="letter-reveal">We craft beautiful digital experiences.</p>
```

### Link with icon (icon stays, text animates)
```html
<a href="/contact" class="letter-reveal">
    <svg class="icon" viewBox="0 0 24 24"><!-- icon SVG --></svg>
    <span>Let's Talk</span>
</a>
```

---

## Customization

| What | How | Default |
|------|-----|---------|
| **Jump height** | Change `translateY(6px)` / `translateY(-3px)` in `@keyframes` | 6px down → 3px up |
| **Speed per letter** | Change `.35s` in animation duration | 350ms |
| **Stagger gap** | Change the `animation-delay` increment | 40ms |
| **Easing** | Change `ease` to any timing function | `ease` |
| **Trigger** | Replace hover JS with scroll/click/intersection observer | Hover |

### Example: Faster, subtler animation
```css
@keyframes letter-reveal {
    0%   { opacity: 0; transform: translateY(4px); }
    50%  { opacity: 1; transform: translateY(-1px); }
    100% { opacity: 1; transform: translateY(0); }
}

.wave-active .letter-wave .letter {
    animation: letter-reveal .25s ease forwards;
}
```

### Example: Trigger on scroll (Intersection Observer)
```js
// Instead of hover, reveal letters when element scrolls into view
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('wave-active');
            observer.unobserve(entry.target); // one-time reveal
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.letter-reveal').forEach(el => observer.observe(el));
```

### Alternative Option: Clean Minimal Scale Pulse (No Fade-In)
This alternative style keeps all letters fully visible (no opacity fading) and triggers a gentle, sequential scale wave through the characters when hovered:

```css
@keyframes letter-pulse {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.15); }
    100% { transform: scale(1); }
}

.wave-active .letter-wave .letter {
    opacity: 1; /* keep letters visible, override default hidden state */
    animation: letter-pulse .3s ease-in-out forwards;
}
```

---

> [!TIP]
> The animations are purely GPU-accelerated (opacity, transform, filter) — they cause **zero layout reflow**. Safe to use on any element without affecting surrounding content.

> [!IMPORTANT]
> For longer text (paragraphs), consider increasing the stagger to cover more characters. The CSS above handles up to 20 characters. For longer text, add more `nth-child` rules or use the JS approach below to set `animation-delay` inline dynamically.

### Dynamic delay via JS (unlimited characters)
```js
// Add this inside the forEach(ch => ...) loop, after creating the span:
span.style.animationDelay = `${index * 40}ms`;
```
Replace the static `nth-child` CSS rules with this single JS line for texts of any length.
