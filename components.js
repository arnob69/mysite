/* ── Resolve the site root relative to this script ── */
const _scriptEl = document.currentScript ||
    document.querySelector('script[data-root]');

/* data-root tells us how many levels deep we are.
   e.g. depth 0 (root) → root = ""
        depth 1 (/articles/) → root = "../"
        depth 2 (/works/case-study-1/) → root = "../../"          */
const _depth = parseInt(_scriptEl?.dataset?.root ?? '0', 10);
const ROOT   = '../'.repeat(_depth);   // "" when at site root

/* ── Load component HTML from a file and inject into a placeholder ── */
async function loadComponent(id, file) {
    const placeholder = document.getElementById(id);
    if (!placeholder) return;
    const res  = await fetch(ROOT + file);
    let html = await res.text();

    /* Clean out any live-reload scripts injected into component fragments by dev servers (e.g. Live Server) */
    html = html.replace(/<!-- Code injected by live-server -->[\s\S]*?<\/script>/gi, '');

    placeholder.innerHTML = html;

    /* Rewrite internal relative links using ROOT */
    placeholder.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href');
        if (href && !href.match(/^(https?:\/\/|mailto:|tel:|#)/)) {
            const cleanHref = href.replace(/^\//, '');
            a.setAttribute('href', ROOT + cleanHref);
        }
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

/* ── Boot ── */
(async () => {
    await loadComponent('header-placeholder', 'components/header.html');
    await loadComponent('footer-placeholder', 'components/footer.html');
    initMobileMenu();
    setActiveLinks();
})();