// Modern Navigation JavaScript - BotFlo
class ModernBotFloNavigation {
    constructor() {
        this.init();
    }

    init() {
        this.createNavigation();
        this.createFooter();
        this.setupEventListeners();
        this.setActiveNavItem();
        this.handleScroll();
    }

    createNavigation() {
        const currentPath = window.location.pathname;
        
        const navigationHTML = `
            <header class="botflo-header" id="botfloHeader">
                <nav class="botflo-nav-container">
                    <a href="/" class="botflo-logo">
                        <i class="fas fa-robot"></i>
                        BotFlo
                    </a>
                    
                    <ul class="botflo-nav-menu" id="botfloNavMenu">
                        <li class="botflo-nav-item">
                            <a href="/builders" ${currentPath.includes('/builders') || currentPath.includes('/demo') ? 'class="active"' : ''}>
                                Build Bot
                            </a>
                        </li>
                        <li class="botflo-nav-item">
                            <a href="/marketplace" ${currentPath.includes('/marketplace') ? 'class="active"' : ''}>
                                Marketplace
                            </a>
                        </li>
                        <li class="botflo-nav-item">
                            <a href="/pricing" ${currentPath.includes('/pricing') ? 'class="active"' : ''}>
                                Pricing
                            </a>
                        </li>
                        
                        <!-- Mobile CTA -->
                        <div class="botflo-nav-cta mobile-cta">
                            <a href="/demo" class="botflo-btn botflo-btn-secondary">
                                <i class="fas fa-play"></i> Try Free Demo
                            </a>
                            <a href="/builders" class="botflo-btn botflo-btn-primary">
                                <i class="fas fa-rocket"></i> Start Building
                            </a>
                        </div>
                    </ul>
                    
                    <!-- Desktop CTA -->
                    <div class="botflo-nav-cta">
                        <a href="/demo" class="botflo-btn botflo-btn-secondary">
                            <i class="fas fa-play"></i> Try Demo
                        </a>
                        <a href="/builders" class="botflo-btn botflo-btn-primary">
                            <i class="fas fa-rocket"></i> Start Building
                        </a>
                    </div>
                    
                    <!-- Mobile Menu Toggle -->
                    <button class="botflo-mobile-toggle" id="botfloMobileToggle" aria-label="Toggle mobile menu">
                        <i class="fas fa-bars"></i>
                    </button>
                </nav>
            </header>
        `;

        // Insert navigation at the beginning of the body
        if (document.body) {
            document.body.insertAdjacentHTML('afterbegin', navigationHTML);
        } else {
            // If body doesn't exist yet, wait for DOM to load
            document.addEventListener('DOMContentLoaded', () => {
                document.body.insertAdjacentHTML('afterbegin', navigationHTML);
                this.setupEventListeners();
            });
        }
    }

    createFooter() {
        const footerHTML = `
            <footer class="botflo-footer">
                <div class="footer-container">
                    <div class="footer-content">
                        <!-- Brand Section -->
                        <div class="footer-brand">
                            <a href="/" class="footer-logo">
                                <i class="fas fa-robot"></i>
                                BotFlo
                            </a>
                            <p class="footer-description">
                                Build powerful AI chatbots without coding. The easiest way to create, customize, and deploy intelligent conversational assistants.
                            </p>
                            <div class="footer-social">
                                <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                                <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
                                <a href="#" aria-label="GitHub"><i class="fab fa-github"></i></a>
                                <a href="#" aria-label="Discord"><i class="fab fa-discord"></i></a>
                            </div>
                        </div>

                        <!-- Product Section -->
                        <div class="footer-section">
                            <h4>Product</h4>
                            <ul>
                                <li><a href="/builders">Bot Builder</a></li>
                                <li><a href="/demo">Try Demo</a></li>
                                <li><a href="/marketplace">Marketplace</a></li>
                                <li><a href="/pricing">Pricing</a></li>
                            </ul>
                        </div>

                        <!-- Resources Section -->
                        <div class="footer-section">
                            <h4>Resources</h4>
                            <ul>
                                <li><a href="/docs">Documentation</a></li>
                                <li><a href="/tutorials">Tutorials</a></li>
                                <li><a href="/blog">Blog</a></li>
                                <li><a href="/community">Community</a></li>
                            </ul>
                        </div>

                        <!-- Company Section -->
                        <div class="footer-section">
                            <h4>Company</h4>
                            <ul>
                                <li><a href="/#about">About</a></li>
                                <li><a href="/contact">Contact</a></li>
                                <li><a href="/support">Support</a></li>
                                <li><a href="/careers">Careers</a></li>
                            </ul>
                        </div>

                        <!-- Legal Section -->
                        <div class="footer-section">
                            <h4>Legal</h4>
                            <ul>
                                <li><a href="/privacy">Privacy Policy</a></li>
                                <li><a href="/terms">Terms of Service</a></li>
                                <li><a href="/cookies">Cookie Policy</a></li>
                                <li><a href="/security">Security</a></li>
                            </ul>
                        </div>
                    </div>

                    <!-- Footer Bottom -->
                    <div class="footer-bottom">
                        <div class="footer-bottom-content">
                            <p>&copy; ${new Date().getFullYear()} BotFlo. All rights reserved.</p>
                            <div class="footer-bottom-links">
                                <a href="/status">Status</a>
                                <a href="/api">API</a>
                                <a href="/changelog">Changelog</a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        `;

        // Insert footer at the end of the body
        if (document.body) {
            document.body.insertAdjacentHTML('beforeend', footerHTML);
        } else {
            // If body doesn't exist yet, wait for DOM to load
            document.addEventListener('DOMContentLoaded', () => {
                document.body.insertAdjacentHTML('beforeend', footerHTML);
            });
        }
    }

    setupEventListeners() {
        // Mobile menu toggle
        const mobileToggle = document.getElementById('botfloMobileToggle');
        const navMenu = document.getElementById('botfloNavMenu');
        
        if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                const icon = mobileToggle.querySelector('i');
                if (navMenu.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Close mobile menu on resize if viewport becomes large
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && navMenu) {
                navMenu.classList.remove('active');
                const icon = mobileToggle?.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Enhanced CTA tracking
        this.setupCTATracking();
    }

    setupCTATracking() {
        // Add click tracking for conversion optimization
        const ctaButtons = document.querySelectorAll('.botflo-btn');
        ctaButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const buttonText = button.textContent.trim();
                const href = button.getAttribute('href');
                
                // Analytics tracking (you can integrate with your analytics)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'cta_click', {
                        'button_text': buttonText,
                        'destination': href,
                        'location': 'navigation'
                    });
                }
                
                console.log(`CTA clicked: ${buttonText} -> ${href}`);
            });
        });
    }

    setActiveNavItem() {
        const currentPath = window.location.pathname;
        const navItems = document.querySelectorAll('.botflo-nav-item a');
        
        navItems.forEach(item => {
            item.classList.remove('active');
            const href = item.getAttribute('href');
            
            // More intelligent active state detection
            if (href === currentPath || 
                (href !== '/' && currentPath.startsWith(href)) ||
                (href === '/builders' && (currentPath.includes('/demo') || currentPath.includes('/builder')))) {
                item.classList.add('active');
            }
        });
    }

    handleScroll() {
        const header = document.getElementById('botfloHeader');
        if (!header) return;

        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateHeader = () => {
            const scrollY = window.scrollY;
            
            if (scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScrollY = scrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        });
    }
}

// Initialize navigation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ModernBotFloNavigation();
    });
} else {
    new ModernBotFloNavigation();
}
