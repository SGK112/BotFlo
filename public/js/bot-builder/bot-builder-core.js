/**
 * BotFlo.ai - Bot Builder Core Module
 * Main orchestrator for the bot builder interface
 */

class BotBuilderCore {
    constructor() {
        this.currentBot = this.getDefaultBot();
        this.isInitialized = false;
        this.apiClient = new BotBuilderAPI();
        this.modules = {};
        
        this.initializeModules();
    }

    /**
     * Initialize all bot builder modules
     */
    initializeModules() {
        // Initialize sub-modules
        this.modules.ui = new BotBuilderUI(this);
        this.modules.preview = new BotBuilderPreview(this);
        this.modules.properties = new BotBuilderProperties(this);
        this.modules.templates = new BotBuilderTemplates(this);
        this.modules.deployment = new BotBuilderDeployment(this);
        this.modules.visual = new BotBuilderVisual(this);
        
        console.log('🤖 Bot Builder Core initialized');
    }

    /**
     * Initialize the bot builder when DOM is ready
     */
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // Load bot from URL if specified
            await this.loadBotFromURL();
            
            // Initialize all modules
            await Promise.all([
                this.modules.ui.initialize(),
                this.modules.preview.initialize(),
                this.modules.properties.initialize(),
                this.modules.templates.initialize(),
                this.modules.deployment.initialize(),
                this.modules.visual.initialize()
            ]);
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Update initial state
            this.updateAllModules();
            
            this.isInitialized = true;
            this.showNotification('Bot Builder loaded successfully!', 'success');
            
        } catch (error) {
            console.error('Failed to initialize bot builder:', error);
            this.showNotification('Failed to load bot builder', 'error');
        }
    }

    /**
     * Get default bot configuration
     */
    getDefaultBot() {
        return {
            id: null,
            name: 'My Chatbot',
            type: 'customer-service',
            icon: '🤖',
            welcome: 'Hello! How can I help you today?',
            description: 'A helpful customer service bot',
            
            // Conversation flow
            nodes: [],
            edges: [],
            
            // Messages and responses
            quickActions: ['Get Help', 'Contact Support', 'Check Status'],
            responses: {
                greeting: 'Hello! How can I help you today?',
                fallback: "I'm sorry, I didn't understand. Can you please rephrase?",
                goodbye: 'Thank you for chatting with me. Have a great day!',
                error: 'Something went wrong. Please try again.'
            },
            
            // Styling
            style: {
                primaryColor: '#667eea',
                secondaryColor: '#764ba2',
                size: 'medium',
                position: 'bottom-right',
                theme: 'modern'
            },
            
            // Settings
            settings: {
                analytics: true,
                fileUploads: true,
                userRegistration: false,
                typing: true,
                sound: false
            },
            
            // Integrations
            integrations: {
                webhook: null,
                email: null,
                slack: null,
                analytics: null
            },
            
            // Deployment
            deployment: {
                status: 'draft',
                url: null,
                embedCode: null,
                lastDeployed: null
            }
        };
    }

    /**
     * Load bot configuration from URL parameters
     */
    async loadBotFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const botId = urlParams.get('bot');
        const template = urlParams.get('template');
        const customize = urlParams.get('customize');
        
        if (botId) {
            // Load existing bot
            try {
                const bot = await this.apiClient.getBot(botId);
                this.currentBot = { ...this.currentBot, ...bot };
                console.log('Loaded bot from ID:', botId);
            } catch (error) {
                console.error('Failed to load bot:', error);
                this.showNotification('Failed to load bot', 'error');
            }
        } else if (template) {
            // Load from template
            try {
                const templateConfig = await this.apiClient.getTemplate(template);
                this.currentBot = { ...this.currentBot, ...templateConfig, type: template };
                console.log('Loaded template:', template);
            } catch (error) {
                console.error('Failed to load template:', error);
                this.showNotification('Failed to load template', 'error');
            }
        }
        
        if (customize === 'true') {
            this.showNotification(`Customizing ${this.currentBot.name}`, 'info');
        }
    }

    /**
     * Update bot property and sync with modules
     */
    updateBotProperty(property, value, skipSave = false) {
        // Handle nested properties (e.g., 'style.primaryColor')
        if (property.includes('.')) {
            const parts = property.split('.');
            let obj = this.currentBot;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!obj[parts[i]]) obj[parts[i]] = {};
                obj = obj[parts[i]];
            }
            obj[parts[parts.length - 1]] = value;
        } else {
            this.currentBot[property] = value;
        }
        
        // Update all modules
        this.updateAllModules();
        
        // Auto-save (debounced)
        if (!skipSave) {
            this.debouncedSave();
        }
        
        this.showNotification(`Updated ${property.split('.').pop()}`, 'success');
    }

    /**
     * Update all modules with current bot state
     */
    updateAllModules() {
        Object.values(this.modules).forEach(module => {
            if (module.update) {
                module.update(this.currentBot);
            }
        });
    }

    /**
     * Set up global event listeners
     */
    setupEventListeners() {
        // Bot type change
        document.getElementById('botType')?.addEventListener('change', (e) => {
            this.changeBotType(e.target.value);
        });

        // Save button
        document.getElementById('saveBot')?.addEventListener('click', () => {
            this.saveBot();
        });

        // Deploy button
        document.getElementById('deployBot')?.addEventListener('click', () => {
            this.deployBot();
        });

        // Preview toggle
        document.getElementById('togglePreview')?.addEventListener('click', () => {
            this.modules.preview.toggle();
        });
    }

    /**
     * Change bot type and load new template
     */
    async changeBotType(type) {
        try {
            const template = await this.apiClient.getTemplate(type);
            this.currentBot = { 
                ...this.currentBot, 
                ...template, 
                type: type,
                // Preserve custom settings
                name: this.currentBot.name,
                id: this.currentBot.id
            };
            
            this.updateAllModules();
            this.showNotification(`Switched to ${template.name || type}`, 'success');
        } catch (error) {
            console.error('Failed to change bot type:', error);
            this.showNotification('Failed to load template', 'error');
        }
    }

    /**
     * Save bot configuration
     */
    async saveBot() {
        try {
            let result;
            if (this.currentBot.id) {
                // Update existing bot
                result = await this.apiClient.updateBot(this.currentBot.id, this.currentBot);
            } else {
                // Create new bot
                result = await this.apiClient.createBot(this.currentBot);
                this.currentBot.id = result.botId;
            }
            
            this.showNotification('Bot saved successfully!', 'success');
            return result;
        } catch (error) {
            console.error('Failed to save bot:', error);
            this.showNotification('Failed to save bot', 'error');
            throw error;
        }
    }

    /**
     * Deploy bot
     */
    async deployBot() {
        try {
            // Save first if needed
            if (!this.currentBot.id) {
                await this.saveBot();
            }
            
            const result = await this.apiClient.deployBot(this.currentBot.id);
            
            this.currentBot.deployment = {
                ...this.currentBot.deployment,
                status: 'deployed',
                url: result.url,
                embedCode: result.embedCode,
                lastDeployed: new Date().toISOString()
            };
            
            this.modules.deployment.update(this.currentBot);
            this.showNotification('Bot deployed successfully!', 'success');
            
            return result;
        } catch (error) {
            console.error('Failed to deploy bot:', error);
            this.showNotification('Failed to deploy bot', 'error');
            throw error;
        }
    }

    /**
     * Debounced save function
     */
    debouncedSave = this.debounce(async () => {
        if (this.currentBot.id) {
            try {
                await this.apiClient.updateBot(this.currentBot.id, this.currentBot);
                console.log('Auto-saved bot');
            } catch (error) {
                console.error('Auto-save failed:', error);
            }
        }
    }, 2000);

    /**
     * Utility: Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        if (this.modules.ui && this.modules.ui.showNotification) {
            this.modules.ui.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * Get current bot configuration
     */
    getCurrentBot() {
        return this.currentBot;
    }

    /**
     * Set bot configuration
     */
    setCurrentBot(bot) {
        this.currentBot = bot;
        this.updateAllModules();
    }
}

// Export for use in other modules
window.BotBuilderCore = BotBuilderCore;
