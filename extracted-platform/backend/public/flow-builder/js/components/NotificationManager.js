/**
 * NotificationManager - Handles application notifications and alerts
 */
import { EventEmitter } from '../core/EventEmitter.js';

export class NotificationManager extends EventEmitter {
    constructor() {
        super();
        this.container = null;
        this.notifications = new Map();
        this.notificationCounter = 0;
        this.defaultDuration = 5000;
        this.maxNotifications = 5;
        
        this.init();
    }

    /**
     * Initialize the notification manager
     */
    init() {
        this.container = document.getElementById('notification') || this.createContainer();
        this.setupStyles();
    }

    /**
     * Create notification container if it doesn't exist
     */
    createContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);
        return container;
    }

    /**
     * Setup default styles if not already defined
     */
    setupStyles() {
        if (!document.querySelector('#notification-manager-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-manager-styles';
            style.textContent = `
                .notification-container {
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    z-index: 1200;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    pointer-events: none;
                }
                
                .notification-item {
                    background: white;
                    border-radius: 8px;
                    padding: 16px 20px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    max-width: 400px;
                    min-width: 300px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transform: translateX(100%);
                    transition: all 0.3s ease;
                    pointer-events: auto;
                    border-left: 4px solid transparent;
                }
                
                .notification-item.show {
                    transform: translateX(0);
                }
                
                .notification-item.success {
                    border-left-color: #10b981;
                    background: #f0fdf4;
                }
                
                .notification-item.error {
                    border-left-color: #dc2626;
                    background: #fef2f2;
                }
                
                .notification-item.warning {
                    border-left-color: #d97706;
                    background: #fffbeb;
                }
                
                .notification-item.info {
                    border-left-color: #0ea5e9;
                    background: #f0f9ff;
                }
                
                .notification-icon {
                    font-size: 18px;
                    flex-shrink: 0;
                }
                
                .notification-content {
                    flex: 1;
                    min-width: 0;
                }
                
                .notification-title {
                    font-weight: 600;
                    font-size: 14px;
                    margin-bottom: 2px;
                    color: #1f2937;
                }
                
                .notification-message {
                    font-size: 13px;
                    color: #4b5563;
                    line-height: 1.4;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: #6b7280;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: all 0.2s;
                    font-size: 14px;
                    flex-shrink: 0;
                }
                
                .notification-close:hover {
                    background: rgba(0, 0, 0, 0.1);
                    color: #374151;
                }
                
                .notification-progress {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 2px;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 0 0 8px 8px;
                    transition: width linear;
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Show a notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, warning, info)
     * @param {object} options - Additional options
     */
    show(message, type = 'info', options = {}) {
        const notificationId = `notification_${++this.notificationCounter}`;
        
        const notification = {
            id: notificationId,
            message,
            type,
            title: options.title,
            duration: options.duration ?? this.defaultDuration,
            persistent: options.persistent ?? false,
            actions: options.actions ?? [],
            timestamp: Date.now()
        };

        // Limit number of notifications
        this.enforceLimits();

        // Create and show notification
        const element = this.createNotificationElement(notification);
        this.container.appendChild(element);
        
        // Store reference
        this.notifications.set(notificationId, {
            ...notification,
            element
        });

        // Trigger show animation
        requestAnimationFrame(() => {
            element.classList.add('show');
        });

        // Auto-hide if not persistent
        if (!notification.persistent && notification.duration > 0) {
            this.startAutoHide(notificationId, notification.duration);
        }

        this.emit('notification:show', notification);
        return notificationId;
    }

    /**
     * Show success notification
     * @param {string} message - Message to show
     * @param {object} options - Additional options
     */
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    /**
     * Show error notification
     * @param {string} message - Message to show
     * @param {object} options - Additional options
     */
    error(message, options = {}) {
        return this.show(message, 'error', { 
            duration: 0, // Errors persist by default
            ...options 
        });
    }

    /**
     * Show warning notification
     * @param {string} message - Message to show
     * @param {object} options - Additional options
     */
    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    /**
     * Show info notification
     * @param {string} message - Message to show
     * @param {object} options - Additional options
     */
    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    /**
     * Create notification DOM element
     * @param {object} notification - Notification data
     * @returns {HTMLElement} Notification element
     */
    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = `notification-item ${notification.type}`;
        element.dataset.notificationId = notification.id;

        const icon = this.getNotificationIcon(notification.type);
        const hasTitle = notification.title && notification.title.trim();

        element.innerHTML = `
            <div class="notification-icon">
                ${icon}
            </div>
            <div class="notification-content">
                ${hasTitle ? `<div class="notification-title">${this.escapeHtml(notification.title)}</div>` : ''}
                <div class="notification-message">${this.escapeHtml(notification.message)}</div>
                ${this.renderActions(notification.actions)}
            </div>
            <button class="notification-close" type="button" aria-label="Close notification">
                <i class="fas fa-times"></i>
            </button>
            ${notification.duration > 0 && !notification.persistent ? '<div class="notification-progress"></div>' : ''}
        `;

        // Setup event handlers
        this.setupNotificationHandlers(element, notification);

        return element;
    }

    /**
     * Get icon for notification type
     * @param {string} type - Notification type
     * @returns {string} Icon HTML
     */
    getNotificationIcon(type) {
        const icons = {
            success: '<i class="fas fa-check-circle" style="color: #10b981;"></i>',
            error: '<i class="fas fa-exclamation-circle" style="color: #dc2626;"></i>',
            warning: '<i class="fas fa-exclamation-triangle" style="color: #d97706;"></i>',
            info: '<i class="fas fa-info-circle" style="color: #0ea5e9;"></i>'
        };
        return icons[type] || icons.info;
    }

    /**
     * Render action buttons
     * @param {array} actions - Action definitions
     * @returns {string} Actions HTML
     */
    renderActions(actions) {
        if (!actions || actions.length === 0) return '';

        const actionsHtml = actions.map(action => `
            <button class="notification-action" data-action="${action.id}" type="button">
                ${this.escapeHtml(action.label)}
            </button>
        `).join('');

        return `<div class="notification-actions">${actionsHtml}</div>`;
    }

    /**
     * Setup event handlers for notification element
     * @param {HTMLElement} element - Notification element
     * @param {object} notification - Notification data
     */
    setupNotificationHandlers(element, notification) {
        // Close button
        const closeBtn = element.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide(notification.id);
            });
        }

        // Action buttons
        const actionBtns = element.querySelectorAll('.notification-action');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const actionId = e.target.dataset.action;
                const action = notification.actions.find(a => a.id === actionId);
                if (action && action.handler) {
                    action.handler(notification);
                }
                
                // Auto-hide after action unless specified otherwise
                if (!action.keepOpen) {
                    this.hide(notification.id);
                }
            });
        });

        // Click to dismiss (if enabled)
        if (notification.clickToDismiss !== false) {
            element.addEventListener('click', (e) => {
                // Don't dismiss if clicking on actions or close button
                if (!e.target.closest('.notification-action, .notification-close')) {
                    this.hide(notification.id);
                }
            });
        }
    }

    /**
     * Start auto-hide timer for notification
     * @param {string} notificationId - Notification ID
     * @param {number} duration - Duration in milliseconds
     */
    startAutoHide(notificationId, duration) {
        const notification = this.notifications.get(notificationId);
        if (!notification) return;

        const progressBar = notification.element.querySelector('.notification-progress');
        if (progressBar) {
            progressBar.style.width = '100%';
            progressBar.style.transition = `width ${duration}ms linear`;
            
            // Start the progress animation
            requestAnimationFrame(() => {
                progressBar.style.width = '0%';
            });
        }

        // Set timeout to hide
        const timeoutId = setTimeout(() => {
            this.hide(notificationId);
        }, duration);

        // Store timeout for potential cancellation
        notification.timeoutId = timeoutId;
    }

    /**
     * Hide a notification
     * @param {string} notificationId - Notification ID
     */
    hide(notificationId) {
        const notification = this.notifications.get(notificationId);
        if (!notification) return;

        // Clear auto-hide timeout
        if (notification.timeoutId) {
            clearTimeout(notification.timeoutId);
        }

        // Start hide animation
        notification.element.classList.remove('show');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
            this.notifications.delete(notificationId);
            this.emit('notification:hide', notification);
        }, 300);
    }

    /**
     * Hide all notifications
     */
    hideAll() {
        const notificationIds = Array.from(this.notifications.keys());
        notificationIds.forEach(id => this.hide(id));
    }

    /**
     * Hide notifications by type
     * @param {string} type - Notification type to hide
     */
    hideByType(type) {
        const notificationsToHide = Array.from(this.notifications.values())
            .filter(n => n.type === type)
            .map(n => n.id);
        
        notificationsToHide.forEach(id => this.hide(id));
    }

    /**
     * Enforce notification limits
     */
    enforceLimits() {
        const notifications = Array.from(this.notifications.values())
            .sort((a, b) => a.timestamp - b.timestamp);

        // Remove oldest notifications if we exceed the limit
        while (notifications.length >= this.maxNotifications) {
            const oldest = notifications.shift();
            this.hide(oldest.id);
        }
    }

    /**
     * Update notification content
     * @param {string} notificationId - Notification ID
     * @param {object} updates - Updates to apply
     */
    update(notificationId, updates) {
        const notification = this.notifications.get(notificationId);
        if (!notification) return;

        // Update notification data
        Object.assign(notification, updates);

        // Update DOM
        if (updates.message) {
            const messageEl = notification.element.querySelector('.notification-message');
            if (messageEl) {
                messageEl.textContent = updates.message;
            }
        }

        if (updates.title) {
            const titleEl = notification.element.querySelector('.notification-title');
            if (titleEl) {
                titleEl.textContent = updates.title;
            }
        }

        this.emit('notification:update', notification);
    }

    /**
     * Get notification count
     * @param {string} type - Optional type filter
     * @returns {number} Notification count
     */
    getCount(type) {
        if (type) {
            return Array.from(this.notifications.values())
                .filter(n => n.type === type).length;
        }
        return this.notifications.size;
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Set default duration for notifications
     * @param {number} duration - Duration in milliseconds
     */
    setDefaultDuration(duration) {
        this.defaultDuration = duration;
    }

    /**
     * Set maximum number of notifications
     * @param {number} max - Maximum number
     */
    setMaxNotifications(max) {
        this.maxNotifications = max;
        this.enforceLimits();
    }

    /**
     * Destroy the notification manager
     */
    destroy() {
        this.hideAll();
        this.removeAllListeners();
        
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        
        const styles = document.querySelector('#notification-manager-styles');
        if (styles) {
            styles.remove();
        }
    }
}
