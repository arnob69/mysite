/* ── Load component HTML from a file and inject into a placeholder ── */
async function loadComponent(id, file) {
    const placeholder = document.getElementById(id);
    if (!placeholder) return;
    const res  = await fetch(file);
    const html = await res.text();
    placeholder.innerHTML = html;
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

    /* Close overlay when any nav link inside it is clicked */
    overlay.querySelectorAll('.mobile_nav_link, .mobile_menu_cta').forEach(link => {
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
    const current = window.location.pathname;

    document.querySelectorAll('.navigation_link').forEach(link => {
        const linkPath = new URL(link.href, location.origin).pathname;

        if (linkPath === current || (linkPath !== '/' && current.startsWith(linkPath))) {
            link.classList.add('active');

            /* If this is a child link, also activate the parent */
            const parentMenu = link.closest('.navigation_dropdown > .navigation_menu');
            if (parentMenu) {
                const parentLink = parentMenu.closest('.navigation_dropdown')
                    ?.querySelector(':scope > .navigation_link');
                if (parentLink) parentLink.classList.add('active');
            }
        }
    });
}

/* ── Boot ── */
(async () => {
    await loadComponent('header-placeholder', 'components/header.html');
    await loadComponent('footer-placeholder', 'components/footer.html');
    initMobileMenu();
    setActiveLinks();
})();