/**
 * BotFlo.ai - Bot Builder Properties Module
 * Handles the properties panel and form interactions
 */

class BotBuilderProperties {
    constructor(core) {
        this.core = core;
        this.currentSection = 'basic';
        this.formElements = new Map();
    }

    /**
     * Initialize properties module
     */
    async initialize() {
        this.setupPropertiesPanel();
        this.setupQuickActions();
        this.loadPropertiesPanel();
        
        console.log('⚙️ Bot Builder Properties initialized');
    }

    /**
     * Set up properties panel
     */
    setupPropertiesPanel() {
        const quickActions = document.querySelectorAll('.quick-action');
        quickActions.forEach(action => {
            action.addEventListener('click', (e) => {
                const section = action.dataset.section;
                this.selectQuickAction(action, section);
            });
        });
    }

    /**
     * Set up quick actions
     */
    setupQuickActions() {
        // Auto-select first quick action if none selected
        const firstAction = document.querySelector('.quick-action');
        if (firstAction && !document.querySelector('.quick-action.selected')) {
            this.selectQuickAction(firstAction, firstAction.dataset.section);
        }
    }

    /**
     * Load properties panel content
     */
    loadPropertiesPanel() {
        // Load current section or default to basic
        this.loadQuickActionContent(this.currentSection);
    }

    /**
     * Select quick action and load content
     */
    selectQuickAction(element, section) {
        // Remove selected class from all quick actions
        document.querySelectorAll('.quick-action').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Add selected class to clicked element
        element.classList.add('selected');
        
        // Load corresponding content
        this.currentSection = section;
        this.loadQuickActionContent(section);
    }

    /**
     * Load content for specific section
     */
    loadQuickActionContent(section) {
        const content = document.getElementById('propertiesContent');
        if (!content) return;

        const bot = this.core.getCurrentBot();

        switch(section) {
            case 'basic':
                this.loadBasicProperties(content, bot);
                break;
            case 'messages':
                this.loadMessagesProperties(content, bot);
                break;
            case 'actions':
                this.loadActionsProperties(content, bot);
                break;
            case 'style':
                this.loadStyleProperties(content, bot);
                break;
            case 'integrations':
                this.loadIntegrationsProperties(content, bot);
                break;
            default:
                this.loadBasicProperties(content, bot);
        }
    }

    /**
     * Load basic properties form
     */
    loadBasicProperties(content, bot) {
        content.innerHTML = `
            <div class="properties-section">
                <h3>Basic Settings</h3>
                
                <div class="form-group">
                    <label class="form-label">Bot Name</label>
                    <input type="text" 
                           class="form-input" 
                           value="${bot.name}" 
                           onchange="window.botBuilder.updateBotProperty('name', this.value)"
                           placeholder="Enter bot name">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Bot Icon</label>
                    <div class="icon-picker">
                        <input type="text" 
                               class="form-input icon-input" 
                               value="${bot.icon}" 
                               onchange="window.botBuilder.updateBotProperty('icon', this.value)"
                               placeholder="🤖">
                        <div class="icon-suggestions">
                            ${this.getIconSuggestions().map(icon => `
                                <button class="icon-option" onclick="window.botBuilder.updateBotProperty('icon', '${icon}')">
                                    ${icon}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Welcome Message</label>
                    <textarea class="form-textarea" 
                              onchange="window.botBuilder.updateBotProperty('welcome', this.value)"
                              placeholder="Enter welcome message"
                              rows="3">${bot.welcome}</textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-textarea" 
                              onchange="window.botBuilder.updateBotProperty('description', this.value)"
                              placeholder="Describe what your bot does"
                              rows="2">${bot.description || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Bot Type</label>
                    <select class="form-select" 
                            id="botType"
                            onchange="window.botBuilder.changeBotType(this.value)">
                        ${this.getBotTypeOptions(bot.type)}
                    </select>
                </div>
            </div>
        `;
    }

    /**
     * Load messages properties form
     */
    loadMessagesProperties(content, bot) {
        content.innerHTML = `
            <div class="properties-section">
                <h3>Messages & Responses</h3>
                
                <div class="form-group">
                    <label class="form-label">Quick Actions</label>
                    <div class="quick-actions-editor" id="quickActionsEditor">
                        ${(bot.quickActions || []).map((action, index) => `
                            <div class="quick-action-item">
                                <input type="text" 
                                       class="form-input" 
                                       value="${action}" 
                                       onchange="window.botBuilder.modules.properties.updateQuickAction(${index}, this.value)">
                                <button class="btn btn-danger btn-small" 
                                        onclick="window.botBuilder.modules.properties.removeQuickAction(${index})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn btn-secondary btn-small" 
                            onclick="window.botBuilder.modules.properties.addQuickAction()">
                        <i class="fas fa-plus"></i> Add Quick Action
                    </button>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Response Templates</label>
                    <div class="responses-editor">
                        ${Object.entries(bot.responses || {}).map(([key, value]) => `
                            <div class="response-item">
                                <label class="form-label">${this.formatResponseLabel(key)}</label>
                                <textarea class="form-textarea" 
                                          onchange="window.botBuilder.modules.properties.updateResponse('${key}', this.value)"
                                          rows="2">${value}</textarea>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="form-group">
                    <button class="btn btn-secondary" 
                            onclick="window.botBuilder.modules.properties.addCustomResponse()">
                        <i class="fas fa-plus"></i> Add Custom Response
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Load actions properties form
     */
    loadActionsProperties(content, bot) {
        content.innerHTML = `
            <div class="properties-section">
                <h3>Bot Actions</h3>
                <p class="section-description">Configure what your bot can do</p>
                
                <div class="actions-grid">
                    <div class="action-item">
                        <label class="checkbox-label">
                            <input type="checkbox" 
                                   ${this.hasAction(bot, 'email') ? 'checked' : ''} 
                                   onchange="window.botBuilder.modules.properties.toggleAction('email', this.checked)">
                            <span class="checkbox-custom"></span>
                            <div class="action-info">
                                <div class="action-title">Send Emails</div>
                                <div class="action-description">Allow bot to send email notifications</div>
                            </div>
                        </label>
                    </div>
                    
                    <div class="action-item">
                        <label class="checkbox-label">
                            <input type="checkbox" 
                                   ${this.hasAction(bot, 'appointments') ? 'checked' : ''} 
                                   onchange="window.botBuilder.modules.properties.toggleAction('appointments', this.checked)">
                            <span class="checkbox-custom"></span>
                            <div class="action-info">
                                <div class="action-title">Schedule Appointments</div>
                                <div class="action-description">Book and manage appointments</div>
                            </div>
                        </label>
                    </div>
                    
                    <div class="action-item">
                        <label class="checkbox-label">
                            <input type="checkbox" 
                                   ${this.hasAction(bot, 'leads') ? 'checked' : ''} 
                                   onchange="window.botBuilder.modules.properties.toggleAction('leads', this.checked)">
                            <span class="checkbox-custom"></span>
                            <div class="action-info">
                                <div class="action-title">Collect Leads</div>
                                <div class="action-description">Capture and store lead information</div>
                            </div>
                        </label>
                    </div>
                    
                    <div class="action-item">
                        <label class="checkbox-label">
                            <input type="checkbox" 
                                   ${this.hasAction(bot, 'payments') ? 'checked' : ''} 
                                   onchange="window.botBuilder.modules.properties.toggleAction('payments', this.checked)">
                            <span class="checkbox-custom"></span>
                            <div class="action-info">
                                <div class="action-title">Process Payments</div>
                                <div class="action-description">Handle payment transactions</div>
                            </div>
                        </label>
                    </div>
                    
                    <div class="action-item">
                        <label class="checkbox-label">
                            <input type="checkbox" 
                                   ${this.hasAction(bot, 'files') ? 'checked' : ''} 
                                   onchange="window.botBuilder.modules.properties.toggleAction('files', this.checked)">
                            <span class="checkbox-custom"></span>
                            <div class="action-info">
                                <div class="action-title">File Uploads</div>
                                <div class="action-description">Allow users to upload files</div>
                            </div>
                        </label>
                    </div>
                    
                    <div class="action-item">
                        <label class="checkbox-label">
                            <input type="checkbox" 
                                   ${this.hasAction(bot, 'analytics') ? 'checked' : ''} 
                                   onchange="window.botBuilder.modules.properties.toggleAction('analytics', this.checked)">
                            <span class="checkbox-custom"></span>
                            <div class="action-info">
                                <div class="action-title">Analytics Tracking</div>
                                <div class="action-description">Track conversations and performance</div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Load style properties form
     */
    loadStyleProperties(content, bot) {
        content.innerHTML = `
            <div class="properties-section">
                <h3>Style & Appearance</h3>
                
                <div class="form-group">
                    <label class="form-label">Primary Color</label>
                    <div class="color-picker-container">
                        <input type="color" 
                               class="color-input" 
                               value="${bot.style?.primaryColor || '#667eea'}"
                               onchange="window.botBuilder.updateBotProperty('style.primaryColor', this.value)">
                        <div class="color-presets">
                            ${this.getColorPresets().map(color => `
                                <div class="color-option ${bot.style?.primaryColor === color ? 'selected' : ''}" 
                                     style="background: ${color};" 
                                     onclick="window.botBuilder.updateBotProperty('style.primaryColor', '${color}')">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Secondary Color</label>
                    <input type="color" 
                           class="color-input" 
                           value="${bot.style?.secondaryColor || '#764ba2'}"
                           onchange="window.botBuilder.updateBotProperty('style.secondaryColor', this.value)">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Bot Size</label>
                    <select class="form-select" 
                            onchange="window.botBuilder.updateBotProperty('style.size', this.value)">
                        <option value="small" ${bot.style?.size === 'small' ? 'selected' : ''}>Small (300px)</option>
                        <option value="medium" ${bot.style?.size === 'medium' ? 'selected' : ''}>Medium (350px)</option>
                        <option value="large" ${bot.style?.size === 'large' ? 'selected' : ''}>Large (400px)</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Position</label>
                    <select class="form-select" 
                            onchange="window.botBuilder.updateBotProperty('style.position', this.value)">
                        <option value="bottom-left" ${bot.style?.position === 'bottom-left' ? 'selected' : ''}>Bottom Left</option>
                        <option value="bottom-right" ${bot.style?.position === 'bottom-right' ? 'selected' : ''}>Bottom Right</option>
                        <option value="top-left" ${bot.style?.position === 'top-left' ? 'selected' : ''}>Top Left</option>
                        <option value="top-right" ${bot.style?.position === 'top-right' ? 'selected' : ''}>Top Right</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Theme</label>
                    <select class="form-select" 
                            onchange="window.botBuilder.updateBotProperty('style.theme', this.value)">
                        <option value="modern" ${bot.style?.theme === 'modern' ? 'selected' : ''}>Modern</option>
                        <option value="classic" ${bot.style?.theme === 'classic' ? 'selected' : ''}>Classic</option>
                        <option value="minimal" ${bot.style?.theme === 'minimal' ? 'selected' : ''}>Minimal</option>
                        <option value="rounded" ${bot.style?.theme === 'rounded' ? 'selected' : ''}>Rounded</option>
                    </select>
                </div>
            </div>
        `;
    }

    /**
     * Load integrations properties form
     */
    loadIntegrationsProperties(content, bot) {
        content.innerHTML = `
            <div class="properties-section">
                <h3>Integrations</h3>
                <p class="section-description">Connect your bot to external services</p>
                
                <div class="integration-item">
                    <div class="integration-header">
                        <h4>Webhook</h4>
                        <label class="toggle-switch">
                            <input type="checkbox" 
                                   ${bot.integrations?.webhook ? 'checked' : ''} 
                                   onchange="window.botBuilder.modules.properties.toggleIntegration('webhook', this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="integration-config ${bot.integrations?.webhook ? 'active' : ''}">
                        <div class="form-group">
                            <label class="form-label">Webhook URL</label>
                            <input type="url" 
                                   class="form-input" 
                                   value="${bot.integrations?.webhook?.url || ''}"
                                   onchange="window.botBuilder.modules.properties.updateIntegrationConfig('webhook', 'url', this.value)"
                                   placeholder="https://example.com/webhook">
                        </div>
                    </div>
                </div>
                
                <div class="integration-item">
                    <div class="integration-header">
                        <h4>Email Notifications</h4>
                        <label class="toggle-switch">
                            <input type="checkbox" 
                                   ${bot.integrations?.email ? 'checked' : ''} 
                                   onchange="window.botBuilder.modules.properties.toggleIntegration('email', this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="integration-config ${bot.integrations?.email ? 'active' : ''}">
                        <div class="form-group">
                            <label class="form-label">Notification Email</label>
                            <input type="email" 
                                   class="form-input" 
                                   value="${bot.integrations?.email?.address || ''}"
                                   onchange="window.botBuilder.modules.properties.updateIntegrationConfig('email', 'address', this.value)"
                                   placeholder="notifications@example.com">
                        </div>
                    </div>
                </div>
                
                <div class="integration-item">
                    <div class="integration-header">
                        <h4>Slack</h4>
                        <label class="toggle-switch">
                            <input type="checkbox" 
                                   ${bot.integrations?.slack ? 'checked' : ''} 
                                   onchange="window.botBuilder.modules.properties.toggleIntegration('slack', this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="integration-config ${bot.integrations?.slack ? 'active' : ''}">
                        <div class="form-group">
                            <label class="form-label">Slack Webhook URL</label>
                            <input type="url" 
                                   class="form-input" 
                                   value="${bot.integrations?.slack?.webhookUrl || ''}"
                                   onchange="window.botBuilder.modules.properties.updateIntegrationConfig('slack', 'webhookUrl', this.value)"
                                   placeholder="https://hooks.slack.com/...">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Helper methods
     */
    
    getIconSuggestions() {
        return ['🤖', '💬', '🎯', '⭐', '🚀', '💡', '🔧', '📱', '🌟', '🎉'];
    }

    getBotTypeOptions(currentType) {
        const types = [
            { value: 'customer-service', label: 'Customer Service' },
            { value: 'lead-generation', label: 'Lead Generation' },
            { value: 'sales', label: 'Sales Assistant' },
            { value: 'support', label: 'Technical Support' },
            { value: 'booking', label: 'Appointment Booking' },
            { value: 'ecommerce', label: 'E-commerce' },
            { value: 'custom', label: 'Custom Bot' }
        ];

        return types.map(type => 
            `<option value="${type.value}" ${currentType === type.value ? 'selected' : ''}>${type.label}</option>`
        ).join('');
    }

    getColorPresets() {
        return ['#667eea', '#764ba2', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];
    }

    formatResponseLabel(key) {
        return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
    }

    hasAction(bot, action) {
        return bot.actions?.includes(action) || false;
    }

    /**
     * Event handlers
     */

    updateQuickAction(index, value) {
        const bot = this.core.getCurrentBot();
        if (bot.quickActions && bot.quickActions[index] !== undefined) {
            bot.quickActions[index] = value;
            this.core.updateBotProperty('quickActions', bot.quickActions, true);
        }
    }

    addQuickAction() {
        const bot = this.core.getCurrentBot();
        if (!bot.quickActions) bot.quickActions = [];
        bot.quickActions.push('New Action');
        this.core.updateBotProperty('quickActions', bot.quickActions);
        this.loadQuickActionContent('messages');
    }

    removeQuickAction(index) {
        const bot = this.core.getCurrentBot();
        if (bot.quickActions && bot.quickActions[index] !== undefined) {
            bot.quickActions.splice(index, 1);
            this.core.updateBotProperty('quickActions', bot.quickActions);
            this.loadQuickActionContent('messages');
        }
    }

    updateResponse(key, value) {
        this.core.updateBotProperty(`responses.${key}`, value);
    }

    addCustomResponse() {
        const key = prompt('Enter response key (e.g., "custom_greeting"):');
        if (key && key.trim()) {
            this.core.updateBotProperty(`responses.${key.trim()}`, 'Enter your response here');
            this.loadQuickActionContent('messages');
        }
    }

    toggleAction(action, enabled) {
        const bot = this.core.getCurrentBot();
        if (!bot.actions) bot.actions = [];
        
        if (enabled && !bot.actions.includes(action)) {
            bot.actions.push(action);
        } else if (!enabled) {
            bot.actions = bot.actions.filter(a => a !== action);
        }
        
        this.core.updateBotProperty('actions', bot.actions);
    }

    toggleIntegration(integration, enabled) {
        if (enabled) {
            this.core.updateBotProperty(`integrations.${integration}`, {});
        } else {
            this.core.updateBotProperty(`integrations.${integration}`, null);
        }
        this.loadQuickActionContent('integrations');
    }

    updateIntegrationConfig(integration, key, value) {
        this.core.updateBotProperty(`integrations.${integration}.${key}`, value);
    }

    /**
     * Update properties panel with new bot data
     */
    update(bot) {
        // Reload current section with new data
        this.loadQuickActionContent(this.currentSection);
    }
}

// Export for use in other modules
window.BotBuilderProperties = BotBuilderProperties;
