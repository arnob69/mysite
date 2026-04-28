// Universal Header & Footer Loader
// Detects page depth and adjusts component paths accordingly.

(function () {
    // Figure out the base path to /components/ relative to the current page.
    // Pages at root (index.html)       → "components/"
    // Pages in a folder (works/page.html) → "../components/"
    const depth = window.location.pathname.split('/').filter(Boolean).length;
    // On GitHub Pages, the first segment might be the repo name.
    // For a custom domain (arnob69.com), depth of the root page is 0 or 1.
    // We use a simple approach: check if components/ is reachable, fallback to ../components/
    
    const basePath = document.documentElement.dataset.basePath || '';
    const componentsPath = basePath + 'components/';

    async function loadComponent(id, file) {
        const el = document.getElementById(id);
        if (!el) return;
        try {
            const response = await fetch(componentsPath + file);
            if (response.ok) {
                el.innerHTML = await response.text();
            } else {
                console.warn(`Could not load ${file}: ${response.status}`);
            }
        } catch (err) {
            console.warn(`Error loading ${file}:`, err);
        }
    }

    // Load both components
    Promise.all([
        loadComponent('header-placeholder', 'header.html'),
        loadComponent('footer-placeholder', 'footer.html')
    ]);
})();
