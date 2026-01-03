/**
 * Enterprise Sidebar - Advanced Navigation System
 * Features: SPA Navigation, Prefetching, Skeleton Loading, Ripple Effects
 */

class EnterpriseSidebar {
    constructor() {
        this.currentPage = window.location.pathname.split('/').pop() || 'index.html';
        this.prefetchCache = new Map();
        this.isNavigating = false;
        this.init();
    }

    init() {
        this.setupActiveStates();
        this.setupSPANavigation();
        this.setupPrefetching();
       // this.setupRippleEffects();
        this.setupAccordionMenus();
        this.setupSkeletonLoading();
    }

    /**
     * Set active state for current page
     */
    setupActiveStates() {
        // First, check submenu items (if any)
        const submenuItems = document.querySelectorAll('.submenu-item');
        submenuItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href && (href === this.currentPage || href.includes(this.currentPage))) {
                item.classList.add('active');

                // Expand parent submenu
                const parentItem = item.closest('.submenu')?.previousElementSibling;
                if (parentItem && parentItem.classList.contains('has-submenu')) {
                    parentItem.classList.add('expanded', 'active');
                    const submenu = parentItem.nextElementSibling;
                    if (submenu && submenu.classList.contains('submenu')) {
                        submenu.classList.add('expanded');
                    }
                }
            }
        });

        // Then check regular nav items (including those with href)
        const navItems = document.querySelectorAll('.nav-item[href]');
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href && (href === this.currentPage || href.includes(this.currentPage))) {
                item.classList.add('active');
            }
        });
    }

    /**
     * Setup Single Page Application Navigation
     * DISABLED: SPA navigation has issues with script re-initialization
     * Now uses normal page navigation for reliability
     */
    setupSPANavigation() {
        // SPA navigation is disabled due to issues with script initialization
        // The browser will handle navigation normally (full page reload)
        // This ensures all JavaScript is properly initialized on each page
        console.log('📌 SPA Navigation disabled - using standard page navigation');

        // Don't add click handlers that prevent default navigation
        // Let the browser handle <a href="..."> links normally
    }

    /**
     * Navigate to page without reload
     */
    async navigateToPage(href, clickedItem) {
        if (this.isNavigating) return;

        this.isNavigating = true;

        // Remove active state from all items
        document.querySelectorAll('.nav-item, .submenu-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active state to clicked item
        clickedItem.classList.add('active');

        // Show loading state
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.add('loading');
            this.showSkeletonLoading(mainContent);
        }

        try {
            // Check if page is in cache
            let content;
            if (this.prefetchCache.has(href)) {
                content = this.prefetchCache.get(href);
            } else {
                // Fetch page content
                const response = await fetch(href);
                const html = await response.text();

                // Extract main content from fetched page
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newMainContent = doc.querySelector('.main-content') || doc.querySelector('body');

                if (newMainContent) {
                    content = newMainContent.innerHTML;
                    this.prefetchCache.set(href, content);
                } else {
                    // Fallback: use full body content
                    content = doc.body ? doc.body.innerHTML : html;
                    this.prefetchCache.set(href, content);
                }
            }

            // Update URL without reload
            window.history.pushState({ path: href }, '', href);

            // Update main content
            if (mainContent) {
                // Small delay for smooth transition
                await this.delay(100);

                // Set new content (inline scripts will execute automatically)
                mainContent.innerHTML = content;

                // Re-initialize only external scripts (avoid redeclaration errors)
                this.reinitializeScripts(mainContent);

                // Small delay to ensure scripts are executed and functions are available
                await this.delay(300);

                // Trigger page initialization after SPA navigation
                this.initializePageAfterNavigation(mainContent, href);

                // Additional delay to ensure all initialization is complete
                await this.delay(100);

                mainContent.classList.remove('loading');
                mainContent.classList.add('loaded');
            }

        } catch (error) {
            console.error('Navigation error:', error);
            // Fallback to normal navigation
            window.location.href = href;
        } finally {
            this.isNavigating = false;
        }
    }

    /**
     * Setup Prefetching - Load pages on hover
     * DISABLED: Prefetching disabled since SPA navigation is off
     */
    setupPrefetching() {
        // Prefetching disabled - not needed with standard page navigation
    }

    /**
     * Prefetch page content
     */
    async prefetchPage(href) {
        try {
            const response = await fetch(href);
            const html = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const mainContent = doc.querySelector('.main-content') || doc.querySelector('body');

            if (mainContent) {
                this.prefetchCache.set(href, mainContent.innerHTML);
            }
        } catch (error) {
            console.warn('Prefetch failed for:', href, error);
        }
    }

    /**
     * Setup Ripple Effects
     */
    setupRippleEffects() {
        const navItems = document.querySelectorAll('.nav-item, .submenu-item');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                this.createRipple(e, item);
            });
        });
    }

    /**
     * Create ripple effect
     */
   createRipple(event, element) {
    // đảm bảo item làm "khung" cho ripple
    element.style.position = element.style.position || 'relative';
    element.style.overflow = element.style.overflow || 'hidden';

    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    // QUAN TRỌNG: để ripple không chiếm layout
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '9999px';
    ripple.style.pointerEvents = 'none';
    ripple.style.transform = 'scale(0)';
    ripple.style.opacity = '0.25';
    ripple.style.background = 'rgba(255,255,255,0.9)';
    ripple.style.animation = 'ripple 600ms ease-out';

    ripple.classList.add('ripple');
    element.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

    /**
     * Setup Accordion Menus for submenus
     */
setupAccordionMenus() {
    const submenuHeaders = document.querySelectorAll('.nav-item.has-submenu');

    submenuHeaders.forEach(header => {
        header.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const submenu = header.nextElementSibling;
            if (!submenu || !submenu.classList.contains('submenu')) return;

            const isExpanded = header.classList.contains('expanded');

            // ✅ Cho phép mở nhiều mục: chỉ toggle mục hiện tại
            header.classList.toggle('expanded', !isExpanded);
            submenu.classList.toggle('expanded', !isExpanded);
        });
    });
}

    /**
     * Show skeleton loading
     */
    showSkeletonLoading(container) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-container';
        skeleton.innerHTML = `
            <div class="space-y-4 p-6">
                <div class="skeleton-line long"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-line long"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-line long"></div>
            </div>
        `;
        container.appendChild(skeleton);
    }

    /**
     * Setup skeleton loading for initial page load
     */
    setupSkeletonLoading() {
        // Show skeleton while page is loading
        const mainContent = document.querySelector('.main-content');
        if (mainContent && !mainContent.classList.contains('loaded')) {
            mainContent.classList.add('loading');
            setTimeout(() => {
                mainContent.classList.remove('loading');
                mainContent.classList.add('loaded');
            }, 300);
        }
    }

    /**
     * Re-initialize scripts in new content
     */
    reinitializeScripts(container) {
        // IMPORTANT: Inline scripts are already executed when innerHTML is set
        // We need to keep them temporarily to ensure functions are defined globally
        // Then remove them after a delay to prevent redeclaration errors
        // DO NOT remove immediately - functions need time to be defined

        // Only load external scripts that aren't already loaded globally
        const externalScripts = container.querySelectorAll('script[src]');
        externalScripts.forEach(oldScript => {
            const src = oldScript.getAttribute('src');
            if (src) {
                // Check if script is already loaded in document
                const existingScript = document.querySelector(`script[src="${src}"]`);
                if (!existingScript) {
                    const newScript = document.createElement('script');
                    newScript.src = src;
                    newScript.async = false;
                    document.head.appendChild(newScript);
                }
                // Remove from container since we've handled it
                oldScript.remove();
            }
        });

        // Remove inline scripts after a delay to prevent redeclaration errors
        // But keep them long enough for functions to be defined in global scope
        setTimeout(() => {
            const inlineScripts = container.querySelectorAll('script:not([src])');
            inlineScripts.forEach(script => {
                // Only remove if it's not needed (functions are already in global scope)
                script.remove();
            });
        }, 200);
    }

    /**
     * Initialize page after SPA navigation
     * This ensures data loading functions are called
     */
    initializePageAfterNavigation(container, href) {
        // Dispatch custom event for pages to listen
        const pageLoadEvent = new CustomEvent('spaPageLoad', {
            detail: { href, container }
        });
        document.dispatchEvent(pageLoadEvent);

        // Auto-detect and call common data loading functions based on page
        const pageName = this.getPageNameFromHref(href);

        // Wait a bit more for all scripts to be ready
        setTimeout(() => {
            this.callPageSpecificLoadFunctions(pageName);
        }, 100);
    }

    /**
     * Get page name from href
     */
    getPageNameFromHref(href) {
        const url = new URL(href, window.location.origin);
        const pathname = url.pathname;
        const filename = pathname.split('/').pop() || 'index.html';
        return filename.replace('.html', '');
    }

    /**
     * Call page-specific load functions
     */
    callPageSpecificLoadFunctions(pageName) {
        // Common load functions pattern - call all that exist
        const loadFunctions = [
            'loadCompanyLogo',
            'loadUserInfo',
            'loadUnreadCount',
            'loadCustomers',
            'loadProjects',
            'loadAccessories',
            'loadAluminumSystems',
            'loadGlassItems',
            'loadOtherItems',
            'loadTransactions',
            'loadScraps',
            'loadStats',
            'loadDashboardStats',
            'loadProductionOrders',
            'loadInstallationProjects',
            'loadHandoverProjects',
            'loadExportedMaterials',
            'loadFinanceData',
            'loadProjectsForExport'
        ];

        // Try to call each function if it exists
        loadFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                try {
                    window[funcName]();
                } catch (error) {
                    console.warn(`Error calling ${funcName}:`, error);
                }
            }
        });

        // Page-specific initialization
        switch (pageName) {
            case 'sales':
                // Load customers by default
                if (typeof window.loadCustomers === 'function') {
                    window.loadCustomers();
                }
                break;

            case 'inventory':
                // Load stats and default tab (accessory)
                if (typeof window.loadStats === 'function') {
                    window.loadStats();
                }
                if (typeof window.loadAccessories === 'function') {
                    window.loadAccessories();
                }
                if (typeof window.loadProjectsForExport === 'function') {
                    window.loadProjectsForExport();
                }
                break;

            case 'production-management':
                if (typeof window.loadProjects === 'function') {
                    window.loadProjects();
                }
                break;
        }
    }

    /**
     * Utility: Delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Handle browser back/forward buttons
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.path) {
        window.location.href = e.state.path;
    }
});

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.enterpriseSidebar = new EnterpriseSidebar();
    });
} else {
    window.enterpriseSidebar = new EnterpriseSidebar();
}

