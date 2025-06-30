// BotFlo Builder Redirect System
// This script unifies all builder entry points to use the same bot-builder.html

(function() {
    'use strict';

    const UNIFIED_BUILDER_URL = '/bot-builder.html';
    
    // Configuration for different entry points
    const BUILDER_CONFIGS = {
        'premade': {
            mode: 'quick-start',
            source: 'premade-bots',
            title: 'Customize Your Bot'
        },
        'template': {
            mode: 'templates',
            source: 'template-selection',
            title: 'Build from Template'
        },
        'website-import': {
            mode: 'website-import',
            source: 'website-scraper',
            title: 'Import from Website'
        },
        'advanced': {
            mode: 'flow-builder',
            source: 'advanced-builder',
            title: 'Advanced Flow Builder'
        },
        'quick': {
            mode: 'quick-start',
            source: 'quick-builder',
            title: 'Quick Bot Builder'
        }
    };

    // Function to redirect to unified builder
    function redirectToUnifiedBuilder(config, params = {}) {
        const url = new URL(UNIFIED_BUILDER_URL, window.location.origin);
        
        // Add configuration parameters
        url.searchParams.set('mode', config.mode);
        url.searchParams.set('source', config.source);
        url.searchParams.set('title', config.title);
        
        // Add any additional parameters
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                url.searchParams.set(key, value);
            }
        });
        
        // Redirect to unified builder
        window.location.href = url.toString();
    }

    // Premade bot selection handler
    window.selectPremadeBot = function(botId, botName) {
        redirectToUnifiedBuilder(BUILDER_CONFIGS.premade, {
            'bot-id': botId,
            'bot-name': botName,
            'preset': 'premade'
        });
    };

    // Template selection handler
    window.selectTemplate = function(templateId, templateName) {
        redirectToUnifiedBuilder(BUILDER_CONFIGS.template, {
            'template-id': templateId,
            'template-name': templateName,
            'preset': 'template'
        });
    };

    // Website import handler
    window.startWebsiteImport = function(websiteUrl) {
        redirectToUnifiedBuilder(BUILDER_CONFIGS['website-import'], {
            'website-url': websiteUrl,
            'preset': 'website'
        });
    };

    // Advanced builder handler
    window.openAdvancedBuilder = function(flow = null) {
        redirectToUnifiedBuilder(BUILDER_CONFIGS.advanced, {
            'flow': flow,
            'preset': 'advanced'
        });
    };

    // Quick builder handler
    window.openQuickBuilder = function() {
        redirectToUnifiedBuilder(BUILDER_CONFIGS.quick, {
            'preset': 'quick'
        });
    };

    // Upgrade flow handler
    window.handleUpgradeFlow = function(plan = 'pro') {
        // First redirect to payment, then back to builder
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `/payment.html?plan=${plan}&return=${returnUrl}`;
    };

    // Initialize based on current page
    function initializePageHandlers() {
        const currentPath = window.location.pathname;
        
        // Handle legacy builder pages
        const legacyBuilders = [
            '/builders.html',
            '/advanced-flow-builder.html',
            '/advanced-flow-builder-clean.html',
            '/advanced-flow-builder-production.html',
            '/simple-bot-builder.html'
        ];
        
        if (legacyBuilders.includes(currentPath)) {
            // Show migration notice
            showMigrationNotice();
        }
        
        // Update marketplace links
        updateMarketplaceLinks();
        
        // Update navigation links
        updateNavigationLinks();
    }

    function showMigrationNotice() {
        const notice = document.createElement('div');
        notice.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 1rem;
            text-align: center;
            z-index: 10000;
            font-weight: 500;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        `;
        
        notice.innerHTML = `
            <div style="max-width: 800px; margin: 0 auto; display: flex; align-items: center; justify-content: center; gap: 1rem;">
                <i class="fas fa-rocket"></i>
                <span>🎉 Welcome to the new unified BotFlo Builder!</span>
                <button onclick="this.parentElement.parentElement.remove(); openAdvancedBuilder();" style="
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                ">Try New Builder</button>
            </div>
        `;
        
        document.body.appendChild(notice);
        document.body.style.paddingTop = '70px';
    }

    function updateMarketplaceLinks() {
        // Update marketplace "customize" and "preview" buttons
        document.addEventListener('click', function(e) {
            const button = e.target.closest('[onclick*="customize"]');
            if (button) {
                e.preventDefault();
                const botId = extractBotId(button.getAttribute('onclick'));
                if (botId) {
                    selectPremadeBot(botId, `Marketplace Bot ${botId}`);
                }
            }
        });
    }

    function updateNavigationLinks() {
        // Update common navigation links to point to unified builder
        const builderLinks = document.querySelectorAll('a[href*="builder"], a[href*="create"]');
        builderLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href.includes('builder') || href.includes('create'))) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    openAdvancedBuilder();
                });
            }
        });
    }

    function extractBotId(onclickString) {
        const match = onclickString.match(/customize\(['"]([^'"]+)['"]/);
        return match ? match[1] : null;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePageHandlers);
    } else {
        initializePageHandlers();
    }

    // Export functions for global access
    window.BotFloBuilderRedirect = {
        selectPremadeBot,
        selectTemplate,
        startWebsiteImport,
        openAdvancedBuilder,
        openQuickBuilder,
        handleUpgradeFlow
    };

})();
