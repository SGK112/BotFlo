/**
 * BotFlo.ai - Bot Builder UI Module
 * Handles all UI interactions and state management
 */

class BotBuilderUI {
    constructor(core) {
        this.core = core;
        this.currentTab = 'properties';
        this.sidebarCollapsed = false;
        this.notifications = [];
    }

    /**
     * Initialize UI components
     */
    async initialize() {
        this.setupTabSystem();
        this.setupSidebar();
        this.setupNotifications();
        this.setupKeyboardShortcuts();
        this.setupResponsiveHandling();
        
        console.log('🎨 Bot Builder UI initialized');
    }

    /**
     * Set up tab system
     */
    setupTabSystem() {
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });

        this.currentTab = tabName;

        // Load tab-specific content
        this.loadTabContent(tabName);

        // Update URL without page reload
        const url = new URL(window.location);
        url.searchParams.set('tab', tabName);
        window.history.replaceState({}, '', url);
    }

    /**
     * Load content for specific tab
     */
    loadTabContent(tabName) {
        switch (tabName) {
            case 'properties':
                this.core.modules.properties?.loadPropertiesPanel();
                break;
            case 'visual':
                this.core.modules.visual?.loadVisualEditor();
                break;
            case 'settings':
                this.loadSettingsTab();
                break;
            case 'deployment':
                this.core.modules.deployment?.loadDeploymentPanel();
                break;
        }
    }

    /**
     * Set up sidebar functionality
     */
    setupSidebar() {
        const toggleBtn = document.getElementById('toggleSidebar');
        const sidebar = document.querySelector('.sidebar');

        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Handle sidebar resize
        this.setupSidebarResize();
    }

    /**
     * Toggle sidebar visibility
     */
    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');

        if (sidebar && mainContent) {
            this.sidebarCollapsed = !this.sidebarCollapsed;
            
            sidebar.classList.toggle('collapsed', this.sidebarCollapsed);
            mainContent.classList.toggle('sidebar-collapsed', this.sidebarCollapsed);

            // Update toggle button icon
            const toggleBtn = document.getElementById('toggleSidebar');
            if (toggleBtn) {
                const icon = toggleBtn.querySelector('i');
                if (icon) {
                    icon.className = this.sidebarCollapsed ? 
                        'fas fa-chevron-right' : 'fas fa-chevron-left';
                }
            }

            // Store preference
            localStorage.setItem('botbuilder-sidebar-collapsed', this.sidebarCollapsed);
        }
    }

    /**
     * Set up sidebar resizing
     */
    setupSidebarResize() {
        const sidebar = document.querySelector('.sidebar');
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'sidebar-resize-handle';
        
        if (sidebar) {
            sidebar.appendChild(resizeHandle);

            let isResizing = false;
            let startX = 0;
            let startWidth = 0;

            resizeHandle.addEventListener('mousedown', (e) => {
                isResizing = true;
                startX = e.clientX;
                startWidth = parseInt(document.defaultView.getComputedStyle(sidebar).width, 10);
                document.addEventListener('mousemove', handleResize);
                document.addEventListener('mouseup', stopResize);
                e.preventDefault();
            });

            const handleResize = (e) => {
                if (!isResizing) return;
                const width = startWidth + e.clientX - startX;
                const minWidth = 250;
                const maxWidth = 500;
                
                if (width >= minWidth && width <= maxWidth) {
                    sidebar.style.width = width + 'px';
                    document.documentElement.style.setProperty('--sidebar-width', width + 'px');
                }
            };

            const stopResize = () => {
                isResizing = false;
                document.removeEventListener('mousemove', handleResize);
                document.removeEventListener('mouseup', stopResize);
                
                // Store width preference
                localStorage.setItem('botbuilder-sidebar-width', sidebar.style.width);
            };
        }
    }

    /**
     * Set up notification system
     */
    setupNotifications() {
        // Create notifications container if it doesn't exist
        let container = document.getElementById('notifications-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications-container';
            container.className = 'notifications-container';
            document.body.appendChild(container);
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 5000) {
        const notification = {
            id: Date.now() + Math.random(),
            message,
            type,
            timestamp: new Date()
        };

        this.notifications.push(notification);
        this.renderNotification(notification, duration);
    }

    /**
     * Render notification element
     */
    renderNotification(notification, duration) {
        const container = document.getElementById('notifications-container');
        if (!container) return;

        const element = document.createElement('div');
        element.className = `notification notification-${notification.type}`;
        element.dataset.id = notification.id;
        
        const icon = this.getNotificationIcon(notification.type);
        
        element.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${icon}"></i>
                <span class="notification-message">${notification.message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(element);

        // Animate in
        setTimeout(() => {
            element.classList.add('notification-show');
        }, 10);

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification.id);
            }, duration);
        }
    }

    /**
     * Remove notification
     */
    removeNotification(id) {
        const element = document.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.classList.add('notification-hide');
            setTimeout(() => {
                element.remove();
            }, 300);
        }

        // Remove from array
        this.notifications = this.notifications.filter(n => n.id !== id);
    }

    /**
     * Get icon for notification type
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    /**
     * Set up keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S: Save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.core.saveBot();
                return;
            }

            // Ctrl/Cmd + D: Deploy
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.core.deployBot();
                return;
            }

            // Ctrl/Cmd + P: Toggle Preview
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                this.core.modules.preview?.toggle();
                return;
            }

            // Tab switching (Ctrl/Cmd + 1-4)
            if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const tabs = ['properties', 'visual', 'settings', 'deployment'];
                const tabIndex = parseInt(e.key) - 1;
                if (tabs[tabIndex]) {
                    this.switchTab(tabs[tabIndex]);
                }
                return;
            }

            // Escape: Close modals/panels
            if (e.key === 'Escape') {
                this.closeAllModals();
                return;
            }
        });
    }

    /**
     * Set up responsive handling
     */
    setupResponsiveHandling() {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        
        const handleResponsive = (e) => {
            const isMobile = e.matches;
            document.body.classList.toggle('mobile-layout', isMobile);
            
            if (isMobile && !this.sidebarCollapsed) {
                this.toggleSidebar();
            }
        };

        mediaQuery.addListener(handleResponsive);
        handleResponsive(mediaQuery);
    }

    /**
     * Load settings tab content
     */
    loadSettingsTab() {
        const settings = document.getElementById('botSettings');
        if (!settings) return;

        const bot = this.core.getCurrentBot();
        
        settings.innerHTML = `
            <div class="settings-panel">
                <div class="settings-section">
                    <h3>Bot Configuration</h3>
                    <div class="form-group">
                        <label class="form-label">Configuration JSON</label>
                        <textarea class="form-textarea code-editor" readonly>${JSON.stringify(bot, null, 2)}</textarea>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>General Settings</h3>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" ${bot.settings.analytics ? 'checked' : ''} 
                                   onchange="window.botBuilder.updateBotProperty('settings.analytics', this.checked)">
                            <span>Enable Analytics</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" ${bot.settings.fileUploads ? 'checked' : ''} 
                                   onchange="window.botBuilder.updateBotProperty('settings.fileUploads', this.checked)">
                            <span>Allow File Uploads</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" ${bot.settings.userRegistration ? 'checked' : ''} 
                                   onchange="window.botBuilder.updateBotProperty('settings.userRegistration', this.checked)">
                            <span>Require User Registration</span>
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Chat Settings</h3>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" ${bot.settings.typing ? 'checked' : ''} 
                                   onchange="window.botBuilder.updateBotProperty('settings.typing', this.checked)">
                            <span>Show Typing Indicator</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" ${bot.settings.sound ? 'checked' : ''} 
                                   onchange="window.botBuilder.updateBotProperty('settings.sound', this.checked)">
                            <span>Enable Sound Notifications</span>
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Advanced</h3>
                    <div class="form-group">
                        <button class="btn btn-secondary" onclick="window.botBuilder.exportBot()">
                            <i class="fas fa-download"></i> Export Bot
                        </button>
                        <button class="btn btn-secondary" onclick="window.botBuilder.importBot()">
                            <i class="fas fa-upload"></i> Import Bot
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Close all open modals
     */
    closeAllModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
        
        document.querySelectorAll('.dropdown.open').forEach(dropdown => {
            dropdown.classList.remove('open');
        });
    }

    /**
     * Update UI with new bot data
     */
    update(bot) {
        // Update bot name in header
        const botNameEl = document.getElementById('botName');
        if (botNameEl) {
            botNameEl.textContent = bot.name;
        }

        // Update bot type selector
        const botTypeEl = document.getElementById('botType');
        if (botTypeEl) {
            botTypeEl.value = bot.type;
        }

        // Update save button state
        this.updateSaveButtonState(bot);
        
        // Update deploy button state
        this.updateDeployButtonState(bot);
    }

    /**
     * Update save button state
     */
    updateSaveButtonState(bot) {
        const saveBtn = document.getElementById('saveBot');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = bot.id ? 
                '<i class="fas fa-save"></i> Save' : 
                '<i class="fas fa-plus"></i> Create Bot';
        }
    }

    /**
     * Update deploy button state
     */
    updateDeployButtonState(bot) {
        const deployBtn = document.getElementById('deployBot');
        if (deployBtn) {
            const isDeployed = bot.deployment?.status === 'deployed';
            deployBtn.innerHTML = isDeployed ? 
                '<i class="fas fa-sync"></i> Redeploy' : 
                '<i class="fas fa-rocket"></i> Deploy';
            deployBtn.disabled = !bot.id;
        }
    }

    /**
     * Restore UI state from localStorage
     */
    restoreState() {
        // Restore sidebar state
        const sidebarCollapsed = localStorage.getItem('botbuilder-sidebar-collapsed') === 'true';
        if (sidebarCollapsed) {
            this.toggleSidebar();
        }

        // Restore sidebar width
        const sidebarWidth = localStorage.getItem('botbuilder-sidebar-width');
        if (sidebarWidth) {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.style.width = sidebarWidth;
                document.documentElement.style.setProperty('--sidebar-width', sidebarWidth);
            }
        }

        // Restore active tab
        const urlParams = new URLSearchParams(window.location.search);
        const activeTab = urlParams.get('tab') || 'properties';
        this.switchTab(activeTab);
    }
}

// Export for use in other modules
window.BotBuilderUI = BotBuilderUI;
