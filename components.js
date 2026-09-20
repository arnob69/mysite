/* ── Resolve the site root relative to this script ── */
const _scriptEl = document.currentScript ||
    document.querySelector('script[data-root]');

/* data-root tells us how many levels deep we are.
   e.g. depth 0 (root) → root = ""
        depth 1 (/articles/) → root = "../"
        depth 2 (/works/case-study-1/) → root = "../../"          */
const _depth = parseInt(_scriptEl?.dataset?.root ?? '0', 10);
const ROOT   = '../'.repeat(_depth);   // "" when at site root

/* Calculate the repository base path dynamically so hosting on subdirectories
   (e.g., GitHub Pages: domain.com/ARN03-animated/) works seamlessly. */
const _pathnameClean = window.location.pathname.replace(/\/index\.html$/, '/');
const _pathSegments = _pathnameClean.split('/').filter(Boolean);
const _baseSegments = _pathSegments.slice(0, _pathSegments.length - _depth);
const BASE_PATH = '/' + _baseSegments.join('/') + (_baseSegments.length ? '/' : '');

/* Given any pathname on the site, work out the same "../../" style
   root prefix that a page living at that depth would use relative to the BASE_PATH. */
function computeRootForPath(pathname) {
    let relativePath = pathname;
    if (pathname.startsWith(BASE_PATH)) {
        relativePath = pathname.slice(BASE_PATH.length);
    }
    let clean = relativePath.replace(/index\.html$/, '');
    clean = clean.replace(/^\/+|\/+$/g, '');
    if (!clean) return '';
    return '../'.repeat(clean.split('/').length);
}

/* ── Load component HTML from a file and inject into a placeholder ── */
async function loadComponent(id, file) {
    const placeholder = document.getElementById(id);
    if (!placeholder) return;
    const res  = await fetch(ROOT + file);
    let html = await res.text();

    /* Clean out any live-reload scripts injected into component fragments by dev servers (e.g. Live Server) */
    html = html.replace(/<!-- Code injected by live-server -->[\s\S]*?<\/script>/gi, '');

    placeholder.innerHTML = html;

    /* Rewrite internal relative links using ROOT, and remember the clean
       (root-anchored) href in a data attribute so these persistent
       header/footer links can be re-rooted later if the page transitions
       to a different folder depth (see reRootLinks). */
    placeholder.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href');
        if (href && !href.match(/^(https?:\/\/|mailto:|tel:|#)/)) {
            const cleanHref = href.replace(/^\//, '');
            a.dataset.href = cleanHref;
            a.setAttribute('href', ROOT + cleanHref);
        }
    });
}

/* Re-root the header/footer's already-injected links to a new depth.
   The header and footer are only fetched once and persist across
   in-place page transitions, so whenever a transition lands on a page
   at a different folder depth, their relative links need rewriting or
   they'd resolve against the wrong directory. */
function reRootLinks(container, root) {
    if (!container) return;
    container.querySelectorAll('a[data-href]').forEach(a => {
        a.setAttribute('href', root + a.dataset.href);
    });
}

/* ── Initialise mobile menu after header is injected ── */
function initMobileMenu() {

    const hamburger = document.querySelector('.hamburger_btn');
    const overlay   = document.querySelector('.mobile_menu_overlay');
    const pageTitle = document.querySelector('.mobile_page_title');

    /* Set page title from <title> tag */
    if (pageTitle) {
        pageTitle.textContent = document.title || 'Page';
    }

    if (!hamburger || !overlay) return;

    /* Toggle open / close */
    hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('is_open');
        overlay.classList.toggle('is_open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen);
        overlay.setAttribute('aria-hidden', !isOpen);
        /* Prevent body scroll when overlay is open */
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    /* Mobile dropdown toggle buttons (accordion - max 1 open at a time) */
    overlay.querySelectorAll('.mobile_dropdown_toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentDropdown = btn.closest('.mobile_dropdown');
            if (!currentDropdown) return;

            const isCurrentlyOpen = currentDropdown.classList.contains('is_open');

            /* Close all open dropdowns inside the overlay */
            overlay.querySelectorAll('.mobile_dropdown.is_open').forEach(openDropdown => {
                openDropdown.classList.remove('is_open');
                const openBtn = openDropdown.querySelector('.mobile_dropdown_toggle');
                if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
            });

            /* If the clicked dropdown was not already open, open it */
            if (!isCurrentlyOpen) {
                currentDropdown.classList.add('is_open');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* Close overlay when any nav link inside it is clicked */
    overlay.querySelectorAll('.mobile_nav_link, .mobile_sub_link, .mobile_menu_cta').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('is_open');
            overlay.classList.remove('is_open');
            hamburger.setAttribute('aria-expanded', 'false');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        });
    });
}

/* ── Mark active navigation links ── */
function setActiveLinks() {
    /* Clear any previous active state first — this now re-runs after
       every in-place page transition, not just once on load. */
    document.querySelectorAll('.navigation_link.active, .mobile_nav_link.active, .mobile_sub_link.active, .footer_link.active')
        .forEach(el => el.classList.remove('active'));

    const currentPath = window.location.pathname.replace(/\/index\.html$/, '/');

    document.querySelectorAll('.navigation_link, .mobile_nav_link, .mobile_sub_link, .footer_link').forEach(link => {
        try {
            const linkPath = new URL(link.href, window.location.href).pathname.replace(/\/index\.html$/, '/');

            if (linkPath === currentPath || (linkPath !== '/' && linkPath.length > 1 && currentPath.endsWith(linkPath))) {
                link.classList.add('active');

                /* If this is a child link, also activate the parent */
                const parentMenu = link.closest('.navigation_dropdown > .navigation_menu');
                if (parentMenu) {
                    const parentLink = parentMenu.closest('.navigation_dropdown')
                        ?.querySelector(':scope > .navigation_link');
                    if (parentLink) parentLink.classList.add('active');
                }

                /* Mobile group parent activation */
                const mobileGroup = link.closest('.mobile_nav_group');
                if (mobileGroup) {
                    const parentMobileLink = mobileGroup.querySelector('.mobile_nav_link');
                    if (parentMobileLink) parentMobileLink.classList.add('active');
                }
            }
        } catch (e) {}
    });
}

/* ══════════════════════════════════════════════════════════════════
   Reveal system
   Containers such as .section or .featured_card are observed as they
   cross the viewport. Their content — flattened through purely
   structural wrappers like .header_text_group, and stopping at grid
   wrappers like .featured whose own cards reveal independently — is
   staggered in reading order via CSS classes (reveal-in-N / reveal-out-N)
   defined in style.css. Un-revealing on scroll-past and replay on
   re-entry both fall out of toggling the same class on intersection
   change, with no inline styles involved anywhere.
   ══════════════════════════════════════════════════════════════════ */

const REVEAL_FLATTEN_SELECTOR = '.header_text_group, .contact_form, .feature_list';
const REVEAL_SKIP_SELECTOR    = '.featured, .split_layout, .faq_accordion';
const REVEAL_ROOT_SELECTOR    = '.section, .featured_card, .split_content, .split_media, .faq_item, .site_footer';
const REVEAL_MAX_STAGGER      = 7; /* matches reveal-in-0..7 / reveal-out-0..7 in style.css */

/* Walk a reveal-group root's descendants, splicing transparent grouping
   wrappers into the sequence and skipping grid/list wrappers entirely
   (their own children register as independent reveal groups instead). */
function getFlatRevealUnits(container) {
    const units = [];
    Array.from(container.children).forEach(child => {
        if (child.matches(REVEAL_SKIP_SELECTOR)) {
            return;
        }
        if (child.matches(REVEAL_FLATTEN_SELECTOR)) {
            units.push(...getFlatRevealUnits(child));
        } else {
            units.push(child);
        }
    });
    return units;
}

const revealUnitsByRoot = new WeakMap();

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const units = revealUnitsByRoot.get(entry.target);
        if (!units) return;
        units.forEach(el => el.classList.toggle('is-revealed', entry.isIntersecting));
    });
}, { threshold: 0, rootMargin: '0px 0px -10% 0px' });

function setupRevealGroup(root) {
    if (revealUnitsByRoot.has(root)) return; /* already wired up */

    const units = getFlatRevealUnits(root);
    if (units.length === 0) return;

    const last = units.length - 1;
    units.forEach((el, i) => {
        el.classList.add(
            'reveal-item',
            `reveal-in-${Math.min(i, REVEAL_MAX_STAGGER)}`,
            `reveal-out-${Math.min(last - i, REVEAL_MAX_STAGGER)}`
        );
    });

    revealUnitsByRoot.set(root, units);
    revealObserver.observe(root);
}

/* scope can be `document` (initial load) or a freshly-swapped-in
   element (after a page transition); safe to call repeatedly since
   setupRevealGroup no-ops on roots it has already wired up. */
function initRevealSystem(scope) {
    const roots = [];
    if (scope.nodeType === Node.ELEMENT_NODE && scope.matches(REVEAL_ROOT_SELECTOR)) {
        roots.push(scope);
    }
    scope.querySelectorAll(REVEAL_ROOT_SELECTOR).forEach(el => roots.push(el));
    roots.forEach(setupRevealGroup);
}

/* ══════════════════════════════════════════════════════════════════
   Letter reveal appearance system (viewport reveal)
   Splits .cta_button / button / .letter-reveal labels into individual
   <span> characters. When buttons enter the viewport, the staggered
   letter appearance animation triggers. All links/buttons use clean
   desktop nav hover styling.
   ══════════════════════════════════════════════════════════════════ */

const buttonViewportObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.remove('wave-active');
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    entry.target.classList.add('wave-active');
                });
            });
        } else {
            entry.target.classList.remove('wave-active');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });

function wrapLetters(el) {
    if (el.dataset.waveSetup) return; /* already wired up */
    el.dataset.waveSetup = 'true';

    /* .cta_button-style links already wrap their label in a <span>
       alongside the arrow icon; plain nav links hold their text
       directly. Either way, find the element that actually owns the
       visible text. */
    const textEl = Array.from(el.children).find(c => c.tagName === 'SPAN') || el;
    const label = textEl.textContent.trim();
    if (!label) return;

    el.setAttribute('aria-label', label);

    const icon = el.querySelector('.arrow_icon');
    if (icon) icon.setAttribute('aria-hidden', 'true');

    const wave = document.createElement('span');
    wave.className = 'letter-wave';
    wave.setAttribute('aria-hidden', 'true');

    Array.from(label).forEach(ch => {
        if (ch === ' ') {
            wave.appendChild(document.createTextNode(' '));
        } else {
            const letter = document.createElement('span');
            letter.className = 'letter';
            letter.textContent = ch;
            wave.appendChild(letter);
        }
    });

    textEl.textContent = '';
    textEl.appendChild(wave);

    /* Observe viewport intersection to trigger appearance animation */
    buttonViewportObserver.observe(el);
}

function initLetterWave(scope) {
    /* Exclude all <a> links from letter-splitting reveal animation so links remain clean and simple */
    const selector = 'button:not(.hamburger_btn):not(.mobile_dropdown_toggle):not(a)';
    const els = [];
    if (scope.nodeType === Node.ELEMENT_NODE && scope.matches(selector)) {
        els.push(scope);
    }
    scope.querySelectorAll(selector).forEach(el => els.push(el));
    els.forEach(wrapLetters);
}

/* ── FAQ accordion (single-open-at-a-time) ──
   Lives here instead of an inline <script> on the FAQ page so it keeps
   working after an in-place page transition swaps that page's content
   in — injected <script> tags don't execute on their own. */
function initFaqAccordion(scope) {
    const accordions = [];
    if (scope.nodeType === Node.ELEMENT_NODE && scope.matches('.faq_accordion')) {
        accordions.push(scope);
    }
    if (scope.querySelectorAll) {
        scope.querySelectorAll('.faq_accordion').forEach(el => accordions.push(el));
    }

    accordions.forEach(accordion => {
        if (accordion.dataset.faqSetup) return;
        accordion.dataset.faqSetup = 'true';

        accordion.querySelectorAll('details').forEach(detail => {
            detail.addEventListener('toggle', () => {
                if (detail.open) {
                    accordion.querySelectorAll('details').forEach(other => {
                        if (other !== detail) other.open = false;
                    });
                }
            });

            /* Open/activate on hover */
            detail.addEventListener('mouseenter', () => {
                if (!detail.open) {
                    detail.open = true;
                }
            });
        });
    });
}

/* ── 16:9 Code Box Line Numbers & Single Scrollbar Sync ── */
function initCodeBoxes(scope = document) {
    const selector = '.code_box_16_9';
    const boxes = [];
    if (scope.nodeType === Node.ELEMENT_NODE && scope.matches(selector)) {
        boxes.push(scope);
    }
    if (scope.querySelectorAll) {
        scope.querySelectorAll(selector).forEach(el => boxes.push(el));
    }

    boxes.forEach(box => {
        if (box.dataset.codeBoxSetup) return;
        box.dataset.codeBoxSetup = 'true';

        const codeEl = box.querySelector('.code_content code') || box.querySelector('code');
        if (!codeEl) return;

        const bodyEl = box.querySelector('.code_box_body') || box;
        const rawText = codeEl.textContent;
        const lines = rawText.split('\n');

        /* Strip empty first/last lines from indented raw text */
        if (lines.length > 0 && lines[0].trim() === '') lines.shift();
        if (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();

        const cleanCodeToCopy = lines.join('\n');

        const wrapper = document.createElement('div');
        wrapper.className = 'code_rows_wrapper';

        lines.forEach((lineText, index) => {
            const row = document.createElement('div');
            row.className = 'code_row';

            const num = document.createElement('span');
            num.className = 'line_num';
            num.textContent = index + 1;

            const code = document.createElement('span');
            code.className = 'line_code';
            code.textContent = lineText || ' ';

            row.appendChild(num);
            row.appendChild(code);
            wrapper.appendChild(row);
        });

        bodyEl.innerHTML = '';
        bodyEl.appendChild(wrapper);

        /* Ensure header copy CTA button exists & header panel contains strictly 2 items */
        let headerEl = box.querySelector('.code_box_header');
        if (!headerEl) {
            headerEl = document.createElement('div');
            headerEl.className = 'code_box_header';
            headerEl.innerHTML = `<span>code_snippet</span>`;
            box.insertBefore(headerEl, bodyEl);
        }

        /* Remove any middle language badge/extra spans so there are strictly 2 items */
        const spans = Array.from(headerEl.children).filter(child => !child.classList.contains('code_copy_btn'));
        if (spans.length > 1) {
            for (let i = 1; i < spans.length; i++) {
                spans[i].remove();
            }
        }

        let copyBtn = headerEl.querySelector('.code_copy_btn');
        if (!copyBtn) {
            copyBtn = document.createElement('button');
            copyBtn.className = 'code_copy_btn cta_button txt';
            copyBtn.setAttribute('aria-label', 'Copy code snippet');
            copyBtn.innerHTML = `
                <svg class="copy_icon arrow_icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="copy_text">Copy</span>
            `;
            headerEl.appendChild(copyBtn);
        }

        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(cleanCodeToCopy);
                const copyText = copyBtn.querySelector('.copy_text');
                if (copyText) copyText.textContent = 'Copied!';
                copyBtn.classList.add('copied');

                setTimeout(() => {
                    if (copyText) copyText.textContent = 'Copy';
                    copyBtn.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy code snippet: ', err);
            }
        });
    });
}

/* ══════════════════════════════════════════════════════════════════
   Page transitions
   Internal same-origin link clicks are intercepted, the destination
   page is fetched, and only its .page content is swapped in — the
   header and footer persist — wrapped in a View Transition where
   supported for a soft crossfade. Browsers without that API still get
   the reload-free swap, just without the crossfade.
   ══════════════════════════════════════════════════════════════════ */

const pageCache = new Map();       // url -> { title, pageOuterHTML, root }
const scrollPositions = new Map(); // url -> last scrollY, for back/forward

function isSpaNavigable(a) {
    if (!a || !a.href) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('download')) return false;
    if (a.origin !== location.origin) return false;
    if (a.getAttribute('href')?.startsWith('#')) return false;
    if (a.pathname === location.pathname && a.hash) return false; /* same-page anchor */
    return true;
}

async function fetchPage(url) {
    if (pageCache.has(url)) return pageCache.get(url);

    const res = await fetch(url);
    if (!res.ok) throw new Error('Fetch failed: ' + res.status);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const pageEl = doc.querySelector('.page');
    if (!pageEl) throw new Error('No .page element in fetched document');

    const data = {
        title: doc.title,
        pageOuterHTML: pageEl.outerHTML,
        root: computeRootForPath(new URL(url).pathname),
    };
    pageCache.set(url, data);
    return data;
}

async function navigateTo(url, opts = {}) {
    const targetUrl = new URL(url, location.href).href;
    if (!opts.isPopState && targetUrl === location.href) return;

    let data;
    try {
        data = await fetchPage(targetUrl);
    } catch (err) {
        window.location.href = targetUrl; /* graceful fallback to a real navigation */
        return;
    }

    const oldPage = document.querySelector('.page');
    if (!oldPage) {
        window.location.href = targetUrl;
        return;
    }

    if (!opts.isPopState) {
        scrollPositions.set(location.href, window.scrollY);
        history.pushState({}, '', targetUrl);
    }

    const applySwap = () => {
        document.title = data.title;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = data.pageOuterHTML;
        const newPage = wrapper.firstElementChild;
        oldPage.replaceWith(newPage);

        reRootLinks(document.getElementById('header-placeholder'), data.root);
        reRootLinks(document.getElementById('footer-placeholder'), data.root);

        setActiveLinks();
        const mobileTitle = document.querySelector('.mobile_page_title');
        if (mobileTitle) mobileTitle.textContent = data.title;

        initLetterWave(newPage);
        initRevealSystem(newPage);
        initFaqAccordion(newPage);
        initCodeBoxes(newPage);

        if (opts.isPopState && scrollPositions.has(targetUrl)) {
            window.scrollTo(0, scrollPositions.get(targetUrl));
        } else {
            window.scrollTo(0, 0);
        }
    };

    if (document.startViewTransition) {
        document.startViewTransition(applySwap);
    } else {
        applySwap();
    }
}

function initPageTransitions() {
    document.addEventListener('click', (e) => {
        if (e.defaultPrevented || e.button !== 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const a = e.target.closest('a');
        if (!isSpaNavigable(a)) return;
        e.preventDefault();
        navigateTo(a.href);
    });

    window.addEventListener('popstate', () => {
        navigateTo(location.href, { isPopState: true });
    });
}

/* ── Boot ── */
(async () => {
    /* Wire up delegated click/popstate handling immediately — it
       doesn't depend on the header/footer having loaded yet. */
    initPageTransitions();

    /* Reveal + wave + FAQ setup for the page content that's already in
       the initial HTML, so above-the-fold content can start its
       entrance animation without waiting on the header/footer fetch. */
    initRevealSystem(document);
    initLetterWave(document);
    initFaqAccordion(document);
    initCodeBoxes(document);

    await loadComponent('header-placeholder', 'components/header.html');
    await loadComponent('footer-placeholder', 'components/footer.html');
    initMobileMenu();
    setActiveLinks();

    /* Re-run across the whole document: idempotent for anything
       already set up, and now also covers the freshly-injected header
       (letter wave) and footer (letter wave + its own reveal group). */
    initLetterWave(document);
    initRevealSystem(document);
})();
