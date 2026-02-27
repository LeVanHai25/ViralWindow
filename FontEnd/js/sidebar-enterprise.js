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
        this.setupMobileMenu();
        this.setupActiveStates();
        this.setupSPANavigation();
        this.setupPrefetching();
        // this.setupRippleEffects();
        this.setupAccordionMenus();
        this.setupSkeletonLoading();
        this.loadUserRoleDisplay();
        this.loadCompanyLogo();
    }

    /**
     * Mobile Hamburger Menu - Auto inject and manage
     * Creates hamburger button + overlay, handles open/close
     */
    setupMobileMenu() {
        // Create hamburger button
        const hamburger = document.createElement('button');
        hamburger.className = 'mobile-hamburger';
        hamburger.id = 'mobileHamburger';
        hamburger.setAttribute('aria-label', 'Menu');
        hamburger.innerHTML = `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
        `;
        document.body.appendChild(hamburger);

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.id = 'sidebarOverlay';
        document.body.appendChild(overlay);

        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;

        // Toggle sidebar
        const toggleSidebar = (open) => {
            if (open) {
                sidebar.classList.add('mobile-open');
                overlay.classList.add('show');
                hamburger.innerHTML = `
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                `;
            } else {
                sidebar.classList.remove('mobile-open');
                overlay.classList.remove('show');
                hamburger.innerHTML = `
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                `;
            }
        };

        // Hamburger click
        hamburger.addEventListener('click', () => {
            const isOpen = sidebar.classList.contains('mobile-open');
            toggleSidebar(!isOpen);
        });

        // Overlay click → close
        overlay.addEventListener('click', () => toggleSidebar(false));

        // Close when clicking a nav link (on mobile)
        sidebar.addEventListener('click', (e) => {
            const link = e.target.closest('a.nav-item, a.submenu-item');
            if (link && link.getAttribute('href') && window.innerWidth <= 768) {
                setTimeout(() => toggleSidebar(false), 150);
            }
        });

        // Handle resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('mobile-open');
                overlay.classList.remove('show');
            }
        });
    }


    /**
     * Get API base URL - dynamically detect from current environment
     */
    getApiBase() {
        // Try to use global API_BASE if defined
        if (typeof window.API_BASE !== 'undefined') {
            return window.API_BASE;
        }
        // Fallback: detect from current location
        const port = window.location.port || '3001';
        return `http://localhost:${port === '5500' || port === '5501' ? '3001' : port}/api`;
    }

    /**
     * Load and display company logo from settings API
     */
    async loadCompanyLogo() {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) return;

            const apiBase = this.getApiBase();
            const response = await fetch(`${apiBase}/settings`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (result.success && result.data) {
                const settings = result.data;

                // Update company name
                const companyNameEl = document.getElementById('companyName');
                if (companyNameEl && settings.company_name) {
                    companyNameEl.textContent = settings.company_name;
                }

                // Update company logo
                const companyLogo = document.getElementById('companyLogo');
                const companyLogoIcon = document.getElementById('companyLogoIcon');

                if (settings.logo_path && companyLogo && companyLogoIcon) {
                    companyLogo.src = settings.logo_path;
                    companyLogo.classList.remove('hidden');
                    companyLogoIcon.classList.add('hidden');
                    console.log(`[Sidebar] Loaded company logo: ${settings.company_name}`);
                }
            }
        } catch (e) {
            console.error('Error loading company logo:', e);
        }
    }

    /**
     * Load and display user role from API /auth/me
     * Gọi API để lấy role_name mới nhất và cập nhật sessionStorage
     */
    loadUserRoleDisplay() {

        // Đầu tiên hiển thị từ sessionStorage (để UI không bị trống)
        this.displayUserFromSession();

        // Sau đó gọi API để lấy dữ liệu mới nhất
        this.fetchAndUpdateUserRole();
    }

    /**
     * Display user info from sessionStorage (quick initial display)
     */
    displayUserFromSession() {
        try {
            const userStr = sessionStorage.getItem('user');
            if (!userStr) return;

            const user = JSON.parse(userStr);
            this.updateSidebarUI(user);
        } catch (e) {
            console.error('Error displaying user from session:', e);
        }
    }

    /**
     * Fetch latest user data from API and update sessionStorage
     */
    async fetchAndUpdateUserRole() {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) return;

            const apiBase = this.getApiBase();
            const response = await fetch(`${apiBase}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            const result = await response.json();

            if (result.success && result.data) {
                const user = result.data;

                // Cập nhật sessionStorage với dữ liệu mới nhất từ API
                const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
                const updatedUser = {
                    ...currentUser,
                    ...user,
                    role_name: user.role_name || (user.user_type === 'admin' ? 'Quản trị viên' : 'Chưa phân quyền')
                };
                sessionStorage.setItem('user', JSON.stringify(updatedUser));

                // Cập nhật UI với dữ liệu mới
                this.updateSidebarUI(updatedUser);

                console.log(`[Sidebar] Updated from API - User: ${updatedUser.full_name}, Role: ${updatedUser.role_name}`);
            }
        } catch (e) {
            console.error('Error fetching user role from API:', e);
        }
    }

    /**
     * Update sidebar UI with user data
     */
    updateSidebarUI(user) {
        // Role fallback mapping table (khi API không trả về role_name)
        const ROLE_NAME_MAPPING = {
            1: 'Super Admin',
            2: 'Quản lý',
            3: 'Kế toán',
            4: 'Thiết kế',
            5: 'Sản xuất',
            6: 'Kho',
            7: 'Lắp đặt',
            8: 'Kinh doanh'
        };

        // Xác định roleName với fallback logic
        let roleName = user.role_name;

        // Fallback 1: Dùng mapping nếu có role_id
        if (!roleName && user.role_id) {
            roleName = ROLE_NAME_MAPPING[user.role_id];
            console.log(`[Sidebar] Using fallback mapping for role_id ${user.role_id}: ${roleName}`);
        }

        // Fallback 2: Dùng user_type
        if (!roleName) {
            roleName = user.user_type === 'admin' ? 'Quản trị viên' : 'Chưa phân quyền';
        }

        const fullName = user.full_name || 'Người dùng';

        // Cập nhật tên người dùng
        const userNameElements = document.querySelectorAll('#sidebarUserName, .sidebar-user-name');
        userNameElements.forEach(el => {
            if (el) el.textContent = fullName;
        });

        // Cập nhật chức vụ - tìm element có class text-blue-200 trong sidebar user section
        const roleElements = document.querySelectorAll('.p-4.border-b .text-xs.text-blue-200, .sidebar-role-text, #sidebarUserRole');
        roleElements.forEach(el => {
            if (el) el.textContent = roleName;
        });

        // Fallback: tìm element trong user profile section
        const userProfileSection = document.querySelector('.p-4.border-b.border-blue-600');
        if (userProfileSection) {
            const roleEl = userProfileSection.querySelector('.text-xs.text-blue-200');
            if (roleEl) {
                roleEl.textContent = roleName;
                roleEl.setAttribute('data-role', user.role_id || '');
            }
        }

        // Cập nhật avatar nếu có
        if (user.avatar_url) {
            const avatarInitial = document.getElementById('sidebarUserAvatarInitial');
            const avatarImage = document.getElementById('sidebarUserAvatarImage');
            if (avatarInitial && avatarImage) {
                avatarInitial.classList.add('hidden');
                avatarImage.src = user.avatar_url;
                avatarImage.classList.remove('hidden');
            }
        } else {
            // Hiển thị initial nếu không có avatar
            const avatarInitial = document.getElementById('sidebarUserAvatarInitial');
            const avatarImage = document.getElementById('sidebarUserAvatarImage');
            if (avatarInitial) {
                avatarInitial.textContent = (fullName || 'U').charAt(0).toUpperCase();
                avatarInitial.classList.remove('hidden');
            }
            if (avatarImage) {
                avatarImage.classList.add('hidden');
            }
        }
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
        console.log('[Sidebar] setupAccordionMenus - Found', submenuHeaders.length, 'submenu headers');

        submenuHeaders.forEach((header, index) => {
            // Skip if already has listener (prevent duplicates)
            if (header.dataset.accordionInit) return;
            header.dataset.accordionInit = 'true';

            header.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[Sidebar] Submenu clicked:', index, header.textContent.trim().substring(0, 30));

                const submenu = header.nextElementSibling;
                if (!submenu || !submenu.classList.contains('submenu')) {
                    console.log('[Sidebar] No submenu found for header:', index);
                    return;
                }

                const isExpanded = header.classList.contains('expanded');
                console.log('[Sidebar] Toggle submenu', index, 'isExpanded:', isExpanded, '-> ', !isExpanded);

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

