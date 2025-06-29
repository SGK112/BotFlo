// BotFlo App - Modern Navigation System
class BotFloApp {
    constructor() {
        this.currentPath = window.location.pathname;
        this.init();
    }

    init() {
        this.createHeader();
        this.createMobileNav();
        this.createFooter();
        this.setupEventListeners();
        this.initPWA();
        this.handleRouting();
    }

    createHeader() {
        // Prevent duplicate headers
        if (document.querySelector('.app-header')) return;

        const headerHTML = `
            <header class="app-header" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: var(--header-height);
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-bottom: 1px solid var(--gray-200);
                z-index: 1000;
                transition: all var(--transition-base);
            ">
                <nav style="
                    max-width: var(--max-content-width);
                    margin: 0 auto;
                    padding: 0 var(--space-4);
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                ">
                    <!-- Logo -->
                    <a href="/" style="
                        display: flex;
                        align-items: center;
                        gap: var(--space-2);
                        text-decoration: none;
                        color: var(--gray-900);
                        font-weight: 800;
                        font-size: var(--font-size-xl);
                    ">
                        <i class="fas fa-robot" style="
                            color: var(--primary);
                            font-size: var(--font-size-2xl);
                        "></i>
                        BotFlo
                    </a>

                    <!-- Desktop Navigation -->
                    <div class="desktop-nav" style="
                        display: flex;
                        align-items: center;
                        gap: var(--space-8);
                    ">
                        <nav style="display: flex; gap: var(--space-6);">
                            <a href="/marketplace-new.html" class="nav-link ${this.isActive('/marketplace') ? 'active' : ''}" style="
                                text-decoration: none;
                                color: var(--gray-600);
                                font-weight: 500;
                                transition: all var(--transition-base);
                                padding: var(--space-2) 0;
                                border-bottom: 2px solid transparent;
                            ">
                                <i class="fas fa-store"></i> Store
                            </a>
                            <a href="/dashboard.html" class="nav-link ${this.isActive('/dashboard') ? 'active' : ''}" style="
                                text-decoration: none;
                                color: var(--gray-600);
                                font-weight: 500;
                                transition: all var(--transition-base);
                                padding: var(--space-2) 0;
                                border-bottom: 2px solid transparent;
                            ">
                                <i class="fas fa-chart-line"></i> Dashboard
                            </a>
                            <a href="/customize.html" class="nav-link ${this.isActive('/customize') ? 'active' : ''}" style="
                                text-decoration: none;
                                color: var(--gray-600);
                                font-weight: 500;
                                transition: all var(--transition-base);
                                padding: var(--space-2) 0;
                                border-bottom: 2px solid transparent;
                            ">
                                <i class="fas fa-cog"></i> Customize
                            </a>
                        </nav>
                        
                        <!-- CTA Buttons -->
                        <div style="display: flex; gap: var(--space-3); align-items: center;">
                            <button class="cart-btn" onclick="window.location.href='/marketplace-new.html#cart'" style="
                                background: none;
                                border: none;
                                color: var(--gray-600);
                                font-size: var(--font-size-lg);
                                cursor: pointer;
                                position: relative;
                                padding: var(--space-2);
                            ">
                                <i class="fas fa-shopping-cart"></i>
                                <span class="cart-count" style="
                                    position: absolute;
                                    top: 0;
                                    right: 0;
                                    background: var(--error);
                                    color: white;
                                    border-radius: 50%;
                                    width: 18px;
                                    height: 18px;
                                    font-size: 10px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-weight: bold;
                                ">0</span>
                            </button>
                            <a href="/profile.html" class="btn btn-secondary btn-sm">
                                <i class="fas fa-user"></i> Account
                            </a>
                        </div>
                    </div>

                    <!-- Mobile Menu Button -->
                    <button class="mobile-menu-btn" onclick="this.closest('.app-header').querySelector('.mobile-menu').classList.toggle('active')" style="
                        display: none;
                        background: none;
                        border: none;
                        font-size: var(--font-size-xl);
                        color: var(--gray-600);
                        cursor: pointer;
                        padding: var(--space-2);
                    ">
                        <i class="fas fa-bars"></i>
                    </button>
                </nav>

                <!-- Mobile Menu -->
                <div class="mobile-menu" style="
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border-bottom: 1px solid var(--gray-200);
                    transform: translateY(-100%);
                    opacity: 0;
                    visibility: hidden;
                    transition: all var(--transition-base);
                    z-index: -1;
                ">
                    <div style="padding: var(--space-4);">
                        <nav style="display: flex; flex-direction: column; gap: var(--space-4);">
                            <a href="/marketplace-new.html" style="
                                display: flex;
                                align-items: center;
                                gap: var(--space-3);
                                padding: var(--space-3);
                                text-decoration: none;
                                color: var(--gray-700);
                                border-radius: var(--border-radius);
                                transition: all var(--transition-base);
                            ">
                                <i class="fas fa-store"></i> Chatbot Store
                            </a>
                            <a href="/dashboard.html" style="
                                display: flex;
                                align-items: center;
                                gap: var(--space-3);
                                padding: var(--space-3);
                                text-decoration: none;
                                color: var(--gray-700);
                                border-radius: var(--border-radius);
                                transition: all var(--transition-base);
                            ">
                                <i class="fas fa-chart-line"></i> My Dashboard
                            </a>
                            <a href="/customize.html" style="
                                display: flex;
                                align-items: center;
                                gap: var(--space-3);
                                padding: var(--space-3);
                                text-decoration: none;
                                color: var(--gray-700);
                                border-radius: var(--border-radius);
                                transition: all var(--transition-base);
                            ">
                                <i class="fas fa-cog"></i> Customize Bot
                            </a>
                            <a href="/profile.html" style="
                                display: flex;
                                align-items: center;
                                gap: var(--space-3);
                                padding: var(--space-3);
                                text-decoration: none;
                                color: var(--gray-700);
                                border-radius: var(--border-radius);
                                transition: all var(--transition-base);
                            ">
                                <i class="fas fa-user"></i> My Account
                            </a>
                        </nav>
                    </div>
                </div>
            </header>
        `;

        document.body.insertAdjacentHTML('afterbegin', headerHTML);
        this.updateCartCount();
    }

    createMobileNav() {
        // Prevent duplicate mobile nav
        if (document.querySelector('.mobile-nav')) return;

        const mobileNavHTML = `
            <nav class="mobile-nav">
                <div class="mobile-nav-items">
                    <a href="/" class="mobile-nav-item ${this.isActive('/') ? 'active' : ''}">
                        <i class="fas fa-home"></i>
                        <span>Home</span>
                    </a>
                    <a href="/marketplace-new.html" class="mobile-nav-item ${this.isActive('/marketplace') ? 'active' : ''}">
                        <i class="fas fa-store"></i>
                        <span>Store</span>
                    </a>
                    <a href="/dashboard.html" class="mobile-nav-item ${this.isActive('/dashboard') ? 'active' : ''}">
                        <i class="fas fa-chart-line"></i>
                        <span>Bots</span>
                    </a>
                    <a href="/customize.html" class="mobile-nav-item ${this.isActive('/customize') ? 'active' : ''}">
                        <i class="fas fa-cog"></i>
                        <span>Create</span>
                    </a>
                    <a href="/profile.html" class="mobile-nav-item ${this.isActive('/profile') ? 'active' : ''}">
                        <i class="fas fa-user"></i>
                        <span>Profile</span>
                    </a>
                </div>
            </nav>
        `;

        document.body.insertAdjacentHTML('beforeend', mobileNavHTML);
    }

    createFooter() {
        // Prevent duplicate footers
        if (document.querySelector('.app-footer')) return;

        const footerHTML = `
            <footer class="app-footer" style="
                background: var(--gray-900);
                color: var(--gray-300);
                padding: var(--space-12) 0 var(--space-8);
                margin-top: var(--space-16);
            ">
                <div style="
                    max-width: var(--max-content-width);
                    margin: 0 auto;
                    padding: 0 var(--space-4);
                ">
                    <div style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: var(--space-8);
                        margin-bottom: var(--space-8);
                    ">
                        <!-- Brand -->
                        <div>
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: var(--space-2);
                                margin-bottom: var(--space-4);
                                color: white;
                                font-weight: 800;
                                font-size: var(--font-size-xl);
                            ">
                                <i class="fas fa-robot" style="color: var(--primary);"></i>
                                BotFlo
                            </div>
                            <p style="margin-bottom: var(--space-4);">
                                Create and deploy professional chatbots in minutes. 
                                Transform your business with AI-powered customer engagement.
                            </p>
                            <div style="display: flex; gap: var(--space-3);">
                                <a href="#" style="color: var(--gray-400); font-size: var(--font-size-xl);">
                                    <i class="fab fa-twitter"></i>
                                </a>
                                <a href="#" style="color: var(--gray-400); font-size: var(--font-size-xl);">
                                    <i class="fab fa-linkedin"></i>
                                </a>
                                <a href="#" style="color: var(--gray-400); font-size: var(--font-size-xl);">
                                    <i class="fab fa-github"></i>
                                </a>
                            </div>
                        </div>

                        <!-- Quick Links -->
                        <div>
                            <h4 style="color: white; margin-bottom: var(--space-4);">Quick Links</h4>
                            <nav style="display: flex; flex-direction: column; gap: var(--space-2);">
                                <a href="/marketplace-new.html" style="color: var(--gray-400); text-decoration: none;">Chatbot Store</a>
                                <a href="/dashboard.html" style="color: var(--gray-400); text-decoration: none;">Dashboard</a>
                                <a href="/customize.html" style="color: var(--gray-400); text-decoration: none;">Customize</a>
                                <a href="/pricing.html" style="color: var(--gray-400); text-decoration: none;">Pricing</a>
                            </nav>
                        </div>

                        <!-- Support -->
                        <div>
                            <h4 style="color: white; margin-bottom: var(--space-4);">Support</h4>
                            <nav style="display: flex; flex-direction: column; gap: var(--space-2);">
                                <a href="/docs.html" style="color: var(--gray-400); text-decoration: none;">Documentation</a>
                                <a href="/contact.html" style="color: var(--gray-400); text-decoration: none;">Contact</a>
                                <a href="/community.html" style="color: var(--gray-400); text-decoration: none;">Community</a>
                                <a href="/blog.html" style="color: var(--gray-400); text-decoration: none;">Blog</a>
                            </nav>
                        </div>

                        <!-- Legal -->
                        <div>
                            <h4 style="color: white; margin-bottom: var(--space-4);">Legal</h4>
                            <nav style="display: flex; flex-direction: column; gap: var(--space-2);">
                                <a href="/privacy.html" style="color: var(--gray-400); text-decoration: none;">Privacy Policy</a>
                                <a href="/terms.html" style="color: var(--gray-400); text-decoration: none;">Terms of Service</a>
                                <a href="/cookies.html" style="color: var(--gray-400); text-decoration: none;">Cookie Policy</a>
                            </nav>
                        </div>
                    </div>

                    <!-- Copyright -->
                    <div style="
                        border-top: 1px solid var(--gray-700);
                        padding-top: var(--space-6);
                        text-align: center;
                        color: var(--gray-500);
                    ">
                        <p>&copy; 2025 BotFlo. All rights reserved. Made with ❤️ for better customer experiences.</p>
                    </div>
                </div>
            </footer>
        `;

        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }

    setupEventListeners() {
        // Handle mobile menu
        document.addEventListener('click', (e) => {
            const mobileMenu = document.querySelector('.mobile-menu');
            if (mobileMenu && !e.target.closest('.mobile-menu') && !e.target.closest('.mobile-menu-btn')) {
                mobileMenu.classList.remove('active');
            }
        });

        // Handle navigation active states
        this.updateActiveNavLinks();

        // Handle scroll for header effect
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.app-header');
            if (header) {
                if (window.scrollY > 50) {
                    header.style.background = 'rgba(255, 255, 255, 0.98)';
                    header.style.boxShadow = 'var(--shadow-lg)';
                } else {
                    header.style.background = 'rgba(255, 255, 255, 0.95)';
                    header.style.boxShadow = 'none';
                }
            }
        });

        // Handle responsive design
        window.addEventListener('resize', () => {
            this.handleResponsive();
        });

        this.handleResponsive();
    }

    initPWA() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => console.log('SW registered'))
                .catch(error => console.log('SW registration failed'));
        }

        // Handle install prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallBanner();
        });

        // Handle app install
        window.addEventListener('appinstalled', (evt) => {
            console.log('App installed');
            this.hideInstallBanner();
        });
    }

    showInstallBanner() {
        // Show install banner if not already shown
        if (!localStorage.getItem('install-banner-dismissed')) {
            const banner = document.createElement('div');
            banner.id = 'install-banner';
            banner.innerHTML = `
                <div style="
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    right: 20px;
                    max-width: 400px;
                    margin: 0 auto;
                    background: var(--gradient-primary);
                    color: white;
                    padding: var(--space-4);
                    border-radius: var(--border-radius-lg);
                    box-shadow: var(--shadow-xl);
                    z-index: 1001;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: var(--space-3);
                ">
                    <div>
                        <h4 style="margin: 0 0 var(--space-1) 0;">📱 Install BotFlo</h4>
                        <p style="margin: 0; font-size: var(--font-size-sm); opacity: 0.9;">Get the mobile app experience</p>
                    </div>
                    <div style="display: flex; gap: var(--space-2);">
                        <button onclick="botFloApp.installApp()" style="
                            background: rgba(255,255,255,0.2);
                            border: 1px solid rgba(255,255,255,0.3);
                            color: white;
                            padding: var(--space-2) var(--space-3);
                            border-radius: var(--border-radius);
                            cursor: pointer;
                            font-size: var(--font-size-sm);
                        ">Install</button>
                        <button onclick="botFloApp.dismissInstallBanner()" style="
                            background: none;
                            border: none;
                            color: white;
                            font-size: var(--font-size-lg);
                            cursor: pointer;
                            padding: var(--space-1);
                        ">×</button>
                    </div>
                </div>
            `;
            document.body.appendChild(banner);
        }
    }

    installApp() {
        // Implementation will depend on the install prompt
        console.log('Installing app...');
        this.dismissInstallBanner();
    }

    dismissInstallBanner() {
        const banner = document.getElementById('install-banner');
        if (banner) {
            banner.remove();
            localStorage.setItem('install-banner-dismissed', 'true');
        }
    }

    hideInstallBanner() {
        this.dismissInstallBanner();
    }

    updateCartCount() {
        const cartCount = localStorage.getItem('cart-count') || '0';
        const cartElement = document.querySelector('.cart-count');
        if (cartElement) {
            cartElement.textContent = cartCount;
            cartElement.style.display = cartCount === '0' ? 'none' : 'flex';
        }
    }

    isActive(path) {
        return this.currentPath.includes(path) || 
               (path === '/' && (this.currentPath === '/' || this.currentPath === '/index.html'));
    }

    updateActiveNavLinks() {
        document.querySelectorAll('.nav-link').forEach(link => {
            if (this.isActive(link.getAttribute('href'))) {
                link.style.color = 'var(--primary)';
                link.style.borderBottomColor = 'var(--primary)';
            }
        });

        document.querySelectorAll('.mobile-nav-item').forEach(link => {
            if (this.isActive(link.getAttribute('href'))) {
                link.classList.add('active');
            }
        });
    }

    handleResponsive() {
        const desktopNav = document.querySelector('.desktop-nav');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        
        if (window.innerWidth <= 768) {
            if (desktopNav) desktopNav.style.display = 'none';
            if (mobileMenuBtn) mobileMenuBtn.style.display = 'block';
        } else {
            if (desktopNav) desktopNav.style.display = 'flex';
            if (mobileMenuBtn) mobileMenuBtn.style.display = 'none';
        }
    }

    handleRouting() {
        // Simple client-side routing for better app experience
        window.addEventListener('popstate', () => {
            this.currentPath = window.location.pathname;
            this.updateActiveNavLinks();
        });
    }

    // Utility methods for cart management
    addToCart(item) {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart.push(item);
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('cart-count', cart.length.toString());
        this.updateCartCount();
        this.showNotification('Added to cart!', 'success');
    }

    removeFromCart(itemId) {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart = cart.filter(item => item.id !== itemId);
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('cart-count', cart.length.toString());
        this.updateCartCount();
        this.showNotification('Removed from cart', 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: calc(var(--header-height) + 20px);
            right: 20px;
            z-index: 1002;
            min-width: 300px;
            animation: slideUp 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// CSS for mobile menu active state
const mobileMenuStyles = document.createElement('style');
mobileMenuStyles.textContent = `
    .mobile-menu.active {
        transform: translateY(0) !important;
        opacity: 1 !important;
        visibility: visible !important;
        z-index: 999 !important;
    }
    
    .mobile-menu a:hover {
        background: var(--gray-50) !important;
    }
`;
document.head.appendChild(mobileMenuStyles);

// Initialize the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.botFloApp = new BotFloApp();
    });
} else {
    window.botFloApp = new BotFloApp();
}
