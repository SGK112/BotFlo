/**
 * BotFlo.ai - Bot Builder Templates Module
 * Handles bot templates and template management
 */

class BotBuilderTemplates {
    constructor(core) {
        this.core = core;
        this.templates = new Map();
        this.customTemplates = new Map();
    }

    /**
     * Initialize templates module
     */
    async initialize() {
        await this.loadBuiltInTemplates();
        await this.loadCustomTemplates();
        
        console.log('📋 Bot Builder Templates initialized');
    }

    /**
     * Load built-in templates
     */
    async loadBuiltInTemplates() {
        const builtInTemplates = {
            'customer-service': {
                id: 'customer-service',
                name: 'Customer Service Bot',
                description: 'Handle customer inquiries and support requests',
                category: 'support',
                icon: '🎧',
                isPremium: false,
                config: {
                    name: 'Customer Service Bot',
                    type: 'customer-service',
                    icon: '🎧',
                    welcome: 'Hello! I\'m here to help with your questions. How can I assist you today?',
                    description: 'A helpful customer service bot that can handle common inquiries',
                    quickActions: [
                        'Track Order',
                        'Return Item',
                        'Contact Support',
                        'FAQ'
                    ],
                    responses: {
                        greeting: 'Hello! I\'m here to help with your questions. How can I assist you today?',
                        fallback: 'I\'m not sure about that. Let me connect you with a human agent.',
                        goodbye: 'Thank you for contacting us. Have a great day!',
                        orderStatus: 'To check your order status, please provide your order number.',
                        returns: 'I can help you with returns. What item would you like to return?'
                    },
                    style: {
                        primaryColor: '#667eea',
                        secondaryColor: '#764ba2',
                        size: 'medium',
                        position: 'bottom-right',
                        theme: 'modern'
                    },
                    actions: ['email', 'leads', 'analytics'],
                    nodes: this.getDefaultFlow('customer-service')
                }
            },
            
            'lead-generation': {
                id: 'lead-generation',
                name: 'Lead Generation Bot',
                description: 'Capture and qualify potential customers',
                category: 'marketing',
                icon: '🎯',
                isPremium: false,
                config: {
                    name: 'Lead Generation Bot',
                    type: 'lead-generation',
                    icon: '🎯',
                    welcome: 'Hi there! I\'d love to learn more about your needs. What brings you here today?',
                    description: 'A lead generation bot that captures and qualifies potential customers',
                    quickActions: [
                        'Get Quote',
                        'Schedule Demo',
                        'Download Guide',
                        'Contact Sales'
                    ],
                    responses: {
                        greeting: 'Hi there! I\'d love to learn more about your needs. What brings you here today?',
                        fallback: 'That\'s interesting! Can you tell me more about your specific requirements?',
                        goodbye: 'Thanks for your time! We\'ll be in touch soon.',
                        qualification: 'Great! To provide the best solution, I need to understand your needs better.',
                        contact: 'Perfect! Let me get your contact information so we can follow up.'
                    },
                    style: {
                        primaryColor: '#10b981',
                        secondaryColor: '#059669',
                        size: 'medium',
                        position: 'bottom-right',
                        theme: 'modern'
                    },
                    actions: ['leads', 'email', 'analytics'],
                    nodes: this.getDefaultFlow('lead-generation')
                }
            },
            
            'sales': {
                id: 'sales',
                name: 'Sales Assistant Bot',
                description: 'Help customers with product information and purchases',
                category: 'sales',
                icon: '🛒',
                isPremium: false,
                config: {
                    name: 'Sales Assistant Bot',
                    type: 'sales',
                    icon: '🛒',
                    welcome: 'Welcome! I\'m here to help you find the perfect product. What are you looking for?',
                    description: 'A sales assistant bot that helps customers with product information and purchases',
                    quickActions: [
                        'Browse Products',
                        'Check Availability',
                        'Compare Options',
                        'Get Pricing'
                    ],
                    responses: {
                        greeting: 'Welcome! I\'m here to help you find the perfect product. What are you looking for?',
                        fallback: 'Let me help you find what you need. Can you be more specific?',
                        goodbye: 'Thank you for shopping with us! Feel free to reach out if you need anything else.',
                        product: 'Here are some great options that match your criteria.',
                        pricing: 'I\'d be happy to provide pricing information. Which products are you interested in?'
                    },
                    style: {
                        primaryColor: '#f59e0b',
                        secondaryColor: '#d97706',
                        size: 'medium',
                        position: 'bottom-right',
                        theme: 'modern'
                    },
                    actions: ['payments', 'email', 'analytics'],
                    nodes: this.getDefaultFlow('sales')
                }
            },
            
            'booking': {
                id: 'booking',
                name: 'Appointment Booking Bot',
                description: 'Schedule appointments and manage bookings',
                category: 'scheduling',
                icon: '📅',
                isPremium: true,
                config: {
                    name: 'Appointment Booking Bot',
                    type: 'booking',
                    icon: '📅',
                    welcome: 'Hello! I can help you schedule an appointment. When would you like to book?',
                    description: 'An appointment booking bot that manages schedules and bookings',
                    quickActions: [
                        'Book Appointment',
                        'Check Availability',
                        'Reschedule',
                        'Cancel Booking'
                    ],
                    responses: {
                        greeting: 'Hello! I can help you schedule an appointment. When would you like to book?',
                        fallback: 'I can help with scheduling. What would you like to do?',
                        goodbye: 'Your appointment is confirmed! You\'ll receive a confirmation email shortly.',
                        availability: 'Let me check available time slots for you.',
                        confirmation: 'Perfect! I\'ve scheduled your appointment.'
                    },
                    style: {
                        primaryColor: '#8b5cf6',
                        secondaryColor: '#7c3aed',
                        size: 'medium',
                        position: 'bottom-right',
                        theme: 'modern'
                    },
                    actions: ['appointments', 'email', 'analytics'],
                    nodes: this.getDefaultFlow('booking')
                }
            },
            
            'support': {
                id: 'support',
                name: 'Technical Support Bot',
                description: 'Provide technical assistance and troubleshooting',
                category: 'support',
                icon: '🔧',
                isPremium: false,
                config: {
                    name: 'Technical Support Bot',
                    type: 'support',
                    icon: '🔧',
                    welcome: 'Hi! I\'m here to help with technical issues. What problem are you experiencing?',
                    description: 'A technical support bot that helps users troubleshoot issues',
                    quickActions: [
                        'Login Issues',
                        'Bug Report',
                        'Feature Request',
                        'Live Chat'
                    ],
                    responses: {
                        greeting: 'Hi! I\'m here to help with technical issues. What problem are you experiencing?',
                        fallback: 'Let me help you troubleshoot this. Can you provide more details?',
                        goodbye: 'I hope that resolved your issue! Feel free to contact us if you need more help.',
                        troubleshoot: 'Let\'s work through this step by step.',
                        escalate: 'I\'ll connect you with a technical specialist who can help further.'
                    },
                    style: {
                        primaryColor: '#ef4444',
                        secondaryColor: '#dc2626',
                        size: 'medium',
                        position: 'bottom-right',
                        theme: 'modern'
                    },
                    actions: ['email', 'files', 'analytics'],
                    nodes: this.getDefaultFlow('support')
                }
            },
            
            'ecommerce': {
                id: 'ecommerce',
                name: 'E-commerce Bot',
                description: 'Handle online shopping and order management',
                category: 'ecommerce',
                icon: '🛍️',
                isPremium: true,
                config: {
                    name: 'E-commerce Bot',
                    type: 'ecommerce',
                    icon: '🛍️',
                    welcome: 'Welcome to our store! I can help you find products, track orders, and more.',
                    description: 'An e-commerce bot that handles shopping and order management',
                    quickActions: [
                        'Shop Now',
                        'Track Order',
                        'Size Guide',
                        'Return Policy'
                    ],
                    responses: {
                        greeting: 'Welcome to our store! I can help you find products, track orders, and more.',
                        fallback: 'I can help you with shopping, orders, or product information. What do you need?',
                        goodbye: 'Thank you for shopping with us! Your satisfaction is our priority.',
                        products: 'Here are some products you might like.',
                        orders: 'I can help you track your order. Please provide your order number.'
                    },
                    style: {
                        primaryColor: '#06b6d4',
                        secondaryColor: '#0891b2',
                        size: 'medium',
                        position: 'bottom-right',
                        theme: 'modern'
                    },
                    actions: ['payments', 'email', 'analytics', 'files'],
                    nodes: this.getDefaultFlow('ecommerce')
                }
            }
        };

        // Store templates
        Object.values(builtInTemplates).forEach(template => {
            this.templates.set(template.id, template);
        });
    }

    /**
     * Load custom templates from API
     */
    async loadCustomTemplates() {
        try {
            const customTemplates = await this.core.apiClient.getTemplates();
            customTemplates.forEach(template => {
                this.customTemplates.set(template.id, template);
            });
        } catch (error) {
            console.warn('Failed to load custom templates:', error);
        }
    }

    /**
     * Get template by ID
     */
    async getTemplate(templateId) {
        // Check built-in templates first
        if (this.templates.has(templateId)) {
            return this.templates.get(templateId);
        }

        // Check custom templates
        if (this.customTemplates.has(templateId)) {
            return this.customTemplates.get(templateId);
        }

        // Try to load from API
        try {
            const template = await this.core.apiClient.getTemplate(templateId);
            this.customTemplates.set(templateId, template);
            return template;
        } catch (error) {
            throw new Error(`Template '${templateId}' not found`);
        }
    }

    /**
     * Get all available templates
     */
    getAllTemplates() {
        const allTemplates = [];
        
        // Add built-in templates
        this.templates.forEach(template => {
            allTemplates.push(template);
        });
        
        // Add custom templates
        this.customTemplates.forEach(template => {
            allTemplates.push({ ...template, isCustom: true });
        });
        
        return allTemplates;
    }

    /**
     * Get templates by category
     */
    getTemplatesByCategory(category) {
        return this.getAllTemplates().filter(template => 
            template.category === category
        );
    }

    /**
     * Create custom template from current bot
     */
    async createCustomTemplate(name, description, category = 'custom') {
        const bot = this.core.getCurrentBot();
        
        const template = {
            name,
            description,
            category,
            icon: bot.icon,
            isPremium: false,
            isCustom: true,
            config: {
                ...bot,
                id: null, // Remove ID for template
                name: name,
                description: description
            },
            createdAt: new Date().toISOString()
        };

        try {
            const result = await this.core.apiClient.createTemplate(template);
            template.id = result.templateId;
            this.customTemplates.set(template.id, template);
            
            this.core.showNotification('Template created successfully!', 'success');
            return template;
        } catch (error) {
            this.core.showNotification('Failed to create template', 'error');
            throw error;
        }
    }

    /**
     * Get default conversation flow for template type
     */
    getDefaultFlow(type) {
        const flows = {
            'customer-service': [
                {
                    id: 'start',
                    type: 'message',
                    content: 'How can I help you today?',
                    position: { x: 100, y: 100 },
                    connections: ['menu']
                },
                {
                    id: 'menu',
                    type: 'menu',
                    content: 'Please select an option:',
                    options: ['Track Order', 'Return Item', 'Contact Support'],
                    position: { x: 300, y: 100 },
                    connections: ['order', 'return', 'support']
                }
            ],
            
            'lead-generation': [
                {
                    id: 'start',
                    type: 'message',
                    content: 'What brings you here today?',
                    position: { x: 100, y: 100 },
                    connections: ['qualify']
                },
                {
                    id: 'qualify',
                    type: 'form',
                    content: 'Tell me about your needs',
                    fields: ['name', 'email', 'company', 'requirements'],
                    position: { x: 300, y: 100 },
                    connections: ['followup']
                }
            ],
            
            'sales': [
                {
                    id: 'start',
                    type: 'message',
                    content: 'What are you looking for?',
                    position: { x: 100, y: 100 },
                    connections: ['products']
                },
                {
                    id: 'products',
                    type: 'menu',
                    content: 'Browse our categories:',
                    options: ['Electronics', 'Clothing', 'Home & Garden'],
                    position: { x: 300, y: 100 },
                    connections: ['details']
                }
            ],
            
            'booking': [
                {
                    id: 'start',
                    type: 'message',
                    content: 'When would you like to book?',
                    position: { x: 100, y: 100 },
                    connections: ['calendar']
                },
                {
                    id: 'calendar',
                    type: 'calendar',
                    content: 'Select a date and time',
                    position: { x: 300, y: 100 },
                    connections: ['confirm']
                }
            ],
            
            'support': [
                {
                    id: 'start',
                    type: 'message',
                    content: 'What issue are you experiencing?',
                    position: { x: 100, y: 100 },
                    connections: ['category']
                },
                {
                    id: 'category',
                    type: 'menu',
                    content: 'Select issue type:',
                    options: ['Login Problem', 'Bug Report', 'Feature Request'],
                    position: { x: 300, y: 100 },
                    connections: ['troubleshoot']
                }
            ],
            
            'ecommerce': [
                {
                    id: 'start',
                    type: 'message',
                    content: 'Welcome! How can I help you shop today?',
                    position: { x: 100, y: 100 },
                    connections: ['menu']
                },
                {
                    id: 'menu',
                    type: 'menu',
                    content: 'What would you like to do?',
                    options: ['Browse Products', 'Track Order', 'Get Help'],
                    position: { x: 300, y: 100 },
                    connections: ['products', 'orders', 'support']
                }
            ]
        };

        return flows[type] || flows['customer-service'];
    }

    /**
     * Apply template to current bot
     */
    async applyTemplate(templateId) {
        try {
            const template = await this.getTemplate(templateId);
            
            // Preserve current bot ID and custom settings
            const currentBot = this.core.getCurrentBot();
            const newBot = {
                ...template.config,
                id: currentBot.id, // Preserve ID if exists
            };

            this.core.setCurrentBot(newBot);
            this.core.showNotification(`Applied template: ${template.name}`, 'success');
            
            return newBot;
        } catch (error) {
            this.core.showNotification('Failed to apply template', 'error');
            throw error;
        }
    }

    /**
     * Show template selector modal
     */
    showTemplateSelector() {
        const modal = this.createTemplateModal();
        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    /**
     * Create template selector modal
     */
    createTemplateModal() {
        const modal = document.createElement('div');
        modal.className = 'modal template-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Choose a Template</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="template-categories">
                        <button class="category-btn active" data-category="all">All</button>
                        <button class="category-btn" data-category="support">Support</button>
                        <button class="category-btn" data-category="marketing">Marketing</button>
                        <button class="category-btn" data-category="sales">Sales</button>
                        <button class="category-btn" data-category="scheduling">Scheduling</button>
                        <button class="category-btn" data-category="ecommerce">E-commerce</button>
                        <button class="category-btn" data-category="custom">Custom</button>
                    </div>
                    <div class="templates-grid" id="templatesGrid">
                        ${this.renderTemplatesGrid()}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="window.botBuilder.modules.templates.createCustomTemplate()">
                        <i class="fas fa-plus"></i> Create Template
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        modal.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                modal.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterTemplates(modal, btn.dataset.category);
            });
        });

        return modal;
    }

    /**
     * Render templates grid
     */
    renderTemplatesGrid(category = 'all') {
        const templates = category === 'all' ? 
            this.getAllTemplates() : 
            this.getTemplatesByCategory(category);

        return templates.map(template => `
            <div class="template-card ${template.isPremium ? 'premium' : ''}" 
                 onclick="window.botBuilder.modules.templates.selectTemplate('${template.id}')">
                <div class="template-icon">${template.icon}</div>
                <div class="template-info">
                    <h3>${template.name}</h3>
                    <p>${template.description}</p>
                    <div class="template-meta">
                        <span class="template-category">${template.category}</span>
                        ${template.isPremium ? '<span class="premium-badge">Premium</span>' : ''}
                        ${template.isCustom ? '<span class="custom-badge">Custom</span>' : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Filter templates by category
     */
    filterTemplates(modal, category) {
        const grid = modal.querySelector('#templatesGrid');
        if (grid) {
            grid.innerHTML = this.renderTemplatesGrid(category);
        }
    }

    /**
     * Select template from modal
     */
    async selectTemplate(templateId) {
        try {
            await this.applyTemplate(templateId);
            
            // Close modal
            document.querySelector('.template-modal')?.remove();
        } catch (error) {
            console.error('Failed to select template:', error);
        }
    }

    /**
     * Update templates module
     */
    update(bot) {
        // Templates don't need to update based on bot changes
        // This module is mostly read-only
    }
}

// Export for use in other modules
window.BotBuilderTemplates = BotBuilderTemplates;
