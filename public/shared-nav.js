// Shared Navigation JavaScript
class BotFloNavigation {
    constructor() {
        this.init();
    }

    init() {
        this.createNavigation();
        this.setupEventListeners();
        this.setActiveNavItem();
        this.handleScroll();
    }

    createNavigation() {
        // Get the current page to set active state
        const currentPath = window.location.pathname;
        
        const navigationHTML = `
            <header class="botflo-header" id="botfloHeader">
                <nav class="botflo-nav-container">
                    <a href="/" class="botflo-logo">
                        <i class="fas fa-robot"></i>
                        BotFlo.ai
                    </a>
                    
                    <ul class="botflo-nav-menu" id="botfloNavMenu">
                        <li class="botflo-nav-item">
                            <a href="/" ${currentPath === '/' ? 'class="active"' : ''}>Home</a>
                        </li>
                        <li class="botflo-nav-item botflo-dropdown">
                            <a href="/builders" ${currentPath.includes('/builders') ? 'class="active"' : ''}>
                                Builders <i class="fas fa-chevron-down" style="font-size: 0.7rem; margin-left: 0.25rem;"></i>
                            </a>
                            <div class="botflo-dropdown-menu">
                                <a href="/builders" class="botflo-dropdown-item">
                                    <i class="fas fa-list-ul"></i> Compare All
                                </a>
                                <a href="/builders/visual" class="botflo-dropdown-item">
                                    <i class="fas fa-project-diagram"></i> Visual Builder
                                </a>
                                <a href="/builders/enhanced" class="botflo-dropdown-item">
                                    <i class="fas fa-magic"></i> Enhanced Designer
                                </a>
                                <a href="/builders/simple" class="botflo-dropdown-item">
                                    <i class="fas fa-play-circle"></i> Simple Builder
                                </a>
                            </div>
                        </li>
                        <li class="botflo-nav-item">
                            <a href="/marketplace" ${currentPath.includes('/marketplace') ? 'class="active"' : ''}>Marketplace</a>
                        </li>
                        <li class="botflo-nav-item">
                            <a href="/features" ${currentPath.includes('/features') ? 'class="active"' : ''}>Features</a>
                        </li>
                        <li class="botflo-nav-item">
                            <a href="/pricing" ${currentPath.includes('/pricing') ? 'class="active"' : ''}>Pricing</a>
                        </li>
                        <li class="botflo-nav-item botflo-dropdown">
                            <a href="/docs" ${currentPath.includes('/docs') || currentPath.includes('/tutorials') || currentPath.includes('/support') ? 'class="active"' : ''}>
                                Resources <i class="fas fa-chevron-down" style="font-size: 0.7rem; margin-left: 0.25rem;"></i>
                            </a>
                            <div class="botflo-dropdown-menu">
                                <a href="/docs" class="botflo-dropdown-item">
                                    <i class="fas fa-book"></i> Documentation
                                </a>
                                <a href="/tutorials" class="botflo-dropdown-item">
                                    <i class="fas fa-graduation-cap"></i> Tutorials
                                </a>
                                <a href="/blog" class="botflo-dropdown-item">
                                    <i class="fas fa-newspaper"></i> Blog
                                </a>
                                <a href="/support" class="botflo-dropdown-item">
                                    <i class="fas fa-life-ring"></i> Support
                                </a>
                            </div>
                        </li>
                        <li class="botflo-nav-item">
                            <a href="/about" ${currentPath.includes('/about') ? 'class="active"' : ''}>About</a>
                        </li>
                        
                        <!-- Mobile CTA -->
                        <div class="botflo-nav-cta">
                            <a href="/demo" class="botflo-btn botflo-btn-secondary">
                                <i class="fas fa-play"></i> Try Demo
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
                    
                    <button class="botflo-mobile-toggle" id="botfloMobileToggle" aria-label="Toggle navigation menu">
                        <i class="fas fa-bars"></i>
                    </button>
                </nav>
            </header>
            <div class="botflo-nav-spacer"></div>
        `;

        // Try to insert navigation into placeholder, otherwise insert at beginning of body
        const placeholder = document.getElementById('navigation-placeholder');
        if (placeholder) {
            placeholder.innerHTML = navigationHTML;
        } else {
            document.body.insertAdjacentHTML('afterbegin', navigationHTML);
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
                    icon.className = 'fas fa-times';
                    document.body.style.overflow = 'hidden';
                } else {
                    icon.className = 'fas fa-bars';
                    document.body.style.overflow = '';
                }
            });
        }

        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.botflo-nav-item a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    const icon = mobileToggle.querySelector('i');
                    icon.className = 'fas fa-bars';
                    document.body.style.overflow = '';
                }
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu && navMenu.classList.contains('active')) {
                if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                    navMenu.classList.remove('active');
                    const icon = mobileToggle.querySelector('i');
                    icon.className = 'fas fa-bars';
                    document.body.style.overflow = '';
                }
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                icon.className = 'fas fa-bars';
                document.body.style.overflow = '';
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                icon.className = 'fas fa-bars';
                document.body.style.overflow = '';
                mobileToggle.focus();
            }
        });
    }

    setActiveNavItem() {
        const currentPath = window.location.pathname;
        const navItems = document.querySelectorAll('.botflo-nav-item a');
        
        navItems.forEach(item => {
            item.classList.remove('active');
            
            // Simple path matching
            const href = item.getAttribute('href');
            if (href === currentPath || 
                (href !== '/' && currentPath.startsWith(href))) {
                item.classList.add('active');
            }
        });
    }

    handleScroll() {
        const header = document.getElementById('botfloHeader');
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add scrolled class for styling
            if (scrollTop > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScrollTop = scrollTop;
        });
    }

    // Utility method to highlight current section
    highlightCurrentSection() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.botflo-nav-item a[href^="#"]');
        
        window.addEventListener('scroll', () => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                
                if (window.pageYOffset >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    // Smooth scroll for anchor links
    enableSmoothScroll() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const headerHeight = 80;
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const navigation = new BotFloNavigation();
    navigation.enableSmoothScroll();
    
    // Add fade-in animation to page content
    const mainContent = document.querySelector('main') || document.querySelector('.main-content') || document.body.children[1];
    if (mainContent) {
        mainContent.classList.add('botflo-fade-in');
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BotFloNavigation;
}

// Global utility functions
window.BotFloUtils = {
    // Show loading state
    showLoading: (element) => {
        element.style.opacity = '0.6';
        element.style.pointerEvents = 'none';
    },
    
    // Hide loading state
    hideLoading: (element) => {
        element.style.opacity = '1';
        element.style.pointerEvents = 'auto';
    },
    
    // Show toast notification
    showToast: (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `botflo-toast botflo-toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add toast styles if not already present
        if (!document.querySelector('#botflo-toast-styles')) {
            const styles = document.createElement('style');
            styles.id = 'botflo-toast-styles';
            styles.textContent = `
                .botflo-toast {
                    position: fixed;
                    top: 90px;
                    right: 20px;
                    background: white;
                    padding: 1rem 1.5rem;
                    border-radius: 0.5rem;
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    z-index: 10000;
                    animation: slideInRight 0.3s ease-out;
                    border-left: 4px solid var(--nav-primary);
                }
                .botflo-toast-success { border-left-color: var(--nav-success); }
                .botflo-toast-error { border-left-color: var(--error); }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};
