/**
 * Bot Templates - Pre-built bot configurations for different industries
 */

class BotTemplates {
    constructor() {
        this.templates = new Map();
        this.loadDefaultTemplates();
    }

    /**
     * Load default bot templates
     */
    loadDefaultTemplates() {
        // Restaurant Bot Template
        this.templates.set('restaurant', {
            id: 'restaurant',
            name: 'Restaurant Bot',
            description: 'Perfect for restaurants, cafes, and food services',
            category: 'Food & Beverage',
            icon: '🍕',
            config: {
                name: 'RestaurantBot',
                welcome: 'Welcome to our restaurant! 🍽️ How can I help you today?',
                quickActions: ['View Menu', 'Make Reservation', 'Order Delivery', 'Contact Us'],
                responses: {
                    menu: 'Here\'s our delicious menu! 🍕 Pizza from $12, 🍝 Pasta from $8, 🥗 Salads from $6. What sounds good?',
                    reservation: 'I\'d love to help you book a table! 📅 What date and time work for you? How many people?',
                    order: 'Great! Let\'s get your order started. 🚚 Would you like pickup or delivery? What\'s your location?',
                    contact: 'You can reach us at (555) 123-4567 or visit us at 123 Main St. We\'re open 11am-10pm daily! 📞'
                },
                flow: {
                    nodes: [
                        {
                            id: 'welcome',
                            type: 'message',
                            content: 'Welcome to our restaurant! How can I help you?',
                            triggers: ['start', 'hello', 'hi']
                        },
                        {
                            id: 'menu_request',
                            type: 'message',
                            content: 'Here\'s our menu: Pizza ($12), Pasta ($8), Salads ($6). What would you like?',
                            triggers: ['menu', 'food', 'eat']
                        },
                        {
                            id: 'reservation',
                            type: 'question',
                            content: 'I\'ll help you make a reservation. What date and time?',
                            triggers: ['reservation', 'book', 'table'],
                            questionType: 'datetime'
                        },
                        {
                            id: 'collect_contact',
                            type: 'action',
                            content: 'Perfect! Can I get your phone number to confirm the reservation?',
                            action: 'collect_phone'
                        }
                    ]
                },
                integrations: {
                    webhook: {
                        enabled: true,
                        url: 'https://api.restaurant.com/orders',
                        events: ['order_placed', 'reservation_made']
                    }
                }
            }
        });

        // Support Bot Template
        this.templates.set('support', {
            id: 'support',
            name: 'Customer Support Bot',
            description: 'Handle customer inquiries and support tickets',
            category: 'Customer Service',
            icon: '🎧',
            config: {
                name: 'SupportBot',
                welcome: 'Hi there! 👋 I\'m here to help with any questions or issues you might have.',
                quickActions: ['Get Help', 'Check Status', 'Report Issue', 'Live Agent'],
                responses: {
                    help: 'I can help with account issues, billing questions, technical problems, and more! 🛠️ What do you need assistance with?',
                    status: 'Let me check that for you... ✅ All systems are operational. Is there a specific service you\'re asking about?',
                    issue: 'Sorry to hear you\'re having trouble! 🔧 Can you describe the issue you\'re experiencing?',
                    agent: 'I\'ll connect you with a live agent right away! 👨‍💼 Average wait time is currently 2 minutes.'
                },
                flow: {
                    nodes: [
                        {
                            id: 'welcome',
                            type: 'message',
                            content: 'How can I help you today?',
                            triggers: ['start', 'help', 'support']
                        },
                        {
                            id: 'issue_category',
                            type: 'question',
                            content: 'What type of issue are you experiencing? (Technical, Billing, Account, Other)',
                            triggers: ['issue', 'problem', 'error'],
                            questionType: 'category'
                        },
                        {
                            id: 'escalate',
                            type: 'action',
                            content: 'Let me escalate this to our support team. Can I get your email?',
                            action: 'collect_email'
                        }
                    ]
                },
                integrations: {
                    slack: {
                        enabled: true,
                        webhook: 'https://hooks.slack.com/services/...',
                        channel: '#support'
                    }
                }
            }
        });

        // Real Estate Bot Template
        this.templates.set('realestate', {
            id: 'realestate',
            name: 'Real Estate Bot',
            description: 'Help clients find properties and schedule viewings',
            category: 'Real Estate',
            icon: '🏠',
            config: {
                name: 'PropertyBot',
                welcome: 'Welcome to your real estate assistant! 🏡 Looking to buy, sell, or just browse properties?',
                quickActions: ['Search Homes', 'Schedule Tour', 'Get Valuation', 'Contact Agent'],
                responses: {
                    search: 'Perfect! 🔍 What\'s your ideal location and budget range? I can show you the best properties available.',
                    tour: 'I\'d love to schedule a tour for you! 🚶‍♀️ Which property interests you, and when works best?',
                    valuation: 'I can help estimate your property value! 💰 What\'s the address you\'d like me to analyze?',
                    agent: 'Let me connect you with one of our expert agents! 👨‍💼 They\'ll be in touch within 24 hours.'
                },
                flow: {
                    nodes: [
                        {
                            id: 'welcome',
                            type: 'message',
                            content: 'Are you looking to buy, sell, or rent?',
                            triggers: ['start', 'hello']
                        },
                        {
                            id: 'property_search',
                            type: 'question',
                            content: 'What\'s your budget range and preferred location?',
                            triggers: ['buy', 'search', 'find'],
                            questionType: 'criteria'
                        },
                        {
                            id: 'schedule_viewing',
                            type: 'action',
                            content: 'Great! Let me schedule a viewing. What\'s your contact info?',
                            action: 'schedule_meeting'
                        }
                    ]
                }
            }
        });

        // E-commerce Bot Template
        this.templates.set('ecommerce', {
            id: 'ecommerce',
            name: 'E-commerce Bot',
            description: 'Help customers shop and track orders',
            category: 'E-commerce',
            icon: '🛒',
            config: {
                name: 'ShopBot',
                welcome: 'Welcome to our store! 🛍️ How can I help you find what you\'re looking for?',
                quickActions: ['Browse Products', 'Track Order', 'Return Policy', 'Customer Service'],
                responses: {
                    products: 'Great! 🛍️ What type of product are you looking for? I can show you our latest arrivals and deals!',
                    track: 'I can help you track your order! 📦 Please provide your order number or email address.',
                    return: 'Our return policy allows 30-day returns for unused items. Do you need to start a return?',
                    service: 'I\'m here to help! What can I assist you with today? Order issues, product questions, or something else?'
                },
                flow: {
                    nodes: [
                        {
                            id: 'welcome',
                            type: 'message',
                            content: 'What can I help you find today?',
                            triggers: ['start', 'shop', 'buy']
                        },
                        {
                            id: 'product_category',
                            type: 'question',
                            content: 'What category interests you? (Electronics, Clothing, Home, Sports)',
                            triggers: ['browse', 'products', 'find'],
                            questionType: 'category'
                        },
                        {
                            id: 'order_tracking',
                            type: 'action',
                            content: 'Please provide your order number and I\'ll track it for you.',
                            triggers: ['track', 'order', 'shipping'],
                            action: 'track_order'
                        }
                    ]
                }
            }
        });

        // Healthcare Bot Template
        this.templates.set('healthcare', {
            id: 'healthcare',
            name: 'Healthcare Assistant',
            description: 'Help patients with appointments and basic health info',
            category: 'Healthcare',
            icon: '🏥',
            config: {
                name: 'HealthBot',
                welcome: 'Hello! I\'m your healthcare assistant. 🏥 How can I help you today?',
                quickActions: ['Book Appointment', 'Health Info', 'Emergency', 'Contact Doctor'],
                responses: {
                    appointment: 'I\'ll help you book an appointment! 📅 What type of appointment do you need and when?',
                    health: 'I can provide general health information. What would you like to know about? 🩺',
                    emergency: '🚨 For medical emergencies, please call 911 immediately or go to your nearest emergency room.',
                    doctor: 'I can connect you with your doctor\'s office. What\'s the reason for your call? 👨‍⚕️'
                },
                flow: {
                    nodes: [
                        {
                            id: 'welcome',
                            type: 'message',
                            content: 'How can I assist with your healthcare needs?',
                            triggers: ['start', 'health', 'medical']
                        },
                        {
                            id: 'appointment_type',
                            type: 'question',
                            content: 'What type of appointment? (General, Specialist, Follow-up)',
                            triggers: ['appointment', 'book', 'schedule'],
                            questionType: 'appointment_type'
                        },
                        {
                            id: 'emergency_check',
                            type: 'condition',
                            content: 'Is this a medical emergency?',
                            triggers: ['emergency', 'urgent', 'pain'],
                            condition: {
                                type: 'emergency_keywords',
                                keywords: ['emergency', 'urgent', 'severe', 'chest pain']
                            },
                            trueResponse: '🚨 Please call 911 or go to the ER immediately!',
                            falseResponse: 'Let me help you find the right care.'
                        }
                    ]
                }
            }
        });

        // Lead Generation Bot Template
        this.templates.set('leadgen', {
            id: 'leadgen',
            name: 'Lead Generation Bot',
            description: 'Capture and qualify leads for sales teams',
            category: 'Sales & Marketing',
            icon: '🎯',
            config: {
                name: 'LeadBot',
                welcome: 'Hi! 👋 I\'d love to learn more about your business needs. How can I help you today?',
                quickActions: ['Get Quote', 'Learn More', 'Schedule Demo', 'Contact Sales'],
                responses: {
                    quote: 'I\'ll help you get a custom quote! 💼 Can you tell me about your business and what you\'re looking for?',
                    learn: 'Great! 📖 What specific area would you like to know more about? Our services, pricing, or success stories?',
                    demo: 'Perfect! 🎥 I\'d love to show you our platform. What\'s the best time for a 15-minute demo?',
                    sales: 'Connecting you with our sales team! 📞 They\'ll reach out within 24 hours. Can I get your contact info?'
                },
                flow: {
                    nodes: [
                        {
                            id: 'welcome',
                            type: 'message',
                            content: 'What brings you here today?',
                            triggers: ['start', 'interested']
                        },
                        {
                            id: 'qualify_lead',
                            type: 'question',
                            content: 'What\'s your company size? (1-10, 11-50, 51-200, 200+)',
                            triggers: ['quote', 'pricing', 'business'],
                            questionType: 'company_size'
                        },
                        {
                            id: 'collect_contact',
                            type: 'action',
                            content: 'Perfect! Let me get your contact info so we can follow up.',
                            action: 'collect_email'
                        },
                        {
                            id: 'schedule_followup',
                            type: 'action',
                            content: 'When would be a good time for our team to call you?',
                            action: 'schedule_meeting'
                        }
                    ]
                },
                integrations: {
                    webhook: {
                        enabled: true,
                        url: 'https://api.crm.com/leads',
                        events: ['lead_captured', 'demo_scheduled']
                    },
                    email: {
                        enabled: true,
                        templates: {
                            welcome: 'Thanks for your interest! We\'ll be in touch soon.',
                            followup: 'Following up on your inquiry...'
                        }
                    }
                }
            }
        });

        console.log(`📋 Loaded ${this.templates.size} bot templates`);
    }

    /**
     * Get all available templates
     */
    getAllTemplates() {
        return Array.from(this.templates.values());
    }

    /**
     * Get template by ID
     */
    getTemplate(templateId) {
        return this.templates.get(templateId);
    }

    /**
     * Get templates by category
     */
    getTemplatesByCategory(category) {
        return Array.from(this.templates.values())
            .filter(template => template.category === category);
    }

    /**
     * Get all categories
     */
    getCategories() {
        const categories = new Set();
        this.templates.forEach(template => {
            categories.add(template.category);
        });
        return Array.from(categories);
    }

    /**
     * Create bot from template
     */
    createBotFromTemplate(templateId, customizations = {}) {
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`Template ${templateId} not found`);
        }

        // Deep clone template config
        const botConfig = JSON.parse(JSON.stringify(template.config));
        
        // Apply customizations
        if (customizations.name) {
            botConfig.name = customizations.name;
        }
        
        if (customizations.welcome) {
            botConfig.welcome = customizations.welcome;
        }
        
        if (customizations.style) {
            botConfig.style = { ...botConfig.style, ...customizations.style };
        }
        
        if (customizations.integrations) {
            botConfig.integrations = { 
                ...botConfig.integrations, 
                ...customizations.integrations 
            };
        }

        return {
            templateId,
            templateName: template.name,
            config: botConfig,
            createdAt: new Date(),
            customized: Object.keys(customizations).length > 0
        };
    }

    /**
     * Add custom template
     */
    addTemplate(template) {
        if (!template.id || !template.name || !template.config) {
            throw new Error('Template must have id, name, and config');
        }

        this.templates.set(template.id, {
            ...template,
            isCustom: true,
            createdAt: new Date()
        });
    }

    /**
     * Update existing template
     */
    updateTemplate(templateId, updates) {
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`Template ${templateId} not found`);
        }

        const updatedTemplate = { ...template, ...updates };
        this.templates.set(templateId, updatedTemplate);
        
        return updatedTemplate;
    }

    /**
     * Delete template
     */
    deleteTemplate(templateId) {
        if (!this.templates.has(templateId)) {
            throw new Error(`Template ${templateId} not found`);
        }

        const template = this.templates.get(templateId);
        if (!template.isCustom) {
            throw new Error('Cannot delete built-in templates');
        }

        this.templates.delete(templateId);
    }

    /**
     * Search templates
     */
    searchTemplates(query) {
        const lowerQuery = query.toLowerCase();
        
        return Array.from(this.templates.values()).filter(template => {
            return template.name.toLowerCase().includes(lowerQuery) ||
                   template.description.toLowerCase().includes(lowerQuery) ||
                   template.category.toLowerCase().includes(lowerQuery);
        });
    }

    /**
     * Get template preview
     */
    getTemplatePreview(templateId) {
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`Template ${templateId} not found`);
        }

        return {
            id: template.id,
            name: template.name,
            description: template.description,
            category: template.category,
            icon: template.icon,
            welcome: template.config.welcome,
            quickActions: template.config.quickActions,
            features: this.extractFeatures(template.config),
            integrations: Object.keys(template.config.integrations || {}),
            complexity: this.calculateComplexity(template.config)
        };
    }

    /**
     * Extract key features from template config
     */
    extractFeatures(config) {
        const features = [];
        
        if (config.flow && config.flow.nodes) {
            features.push(`${config.flow.nodes.length} conversation flows`);
        }
        
        if (config.quickActions) {
            features.push(`${config.quickActions.length} quick actions`);
        }
        
        if (config.integrations) {
            const integrationCount = Object.keys(config.integrations).length;
            features.push(`${integrationCount} integrations`);
        }
        
        if (config.responses) {
            const responseCount = Object.keys(config.responses).length;
            features.push(`${responseCount} pre-built responses`);
        }

        return features;
    }

    /**
     * Calculate template complexity
     */
    calculateComplexity(config) {
        let score = 0;
        
        // Base complexity
        score += 1;
        
        // Flow complexity
        if (config.flow && config.flow.nodes) {
            score += config.flow.nodes.length * 0.5;
        }
        
        // Integration complexity
        if (config.integrations) {
            score += Object.keys(config.integrations).length * 0.3;
        }
        
        // Response complexity
        if (config.responses) {
            score += Object.keys(config.responses).length * 0.1;
        }

        if (score <= 2) return 'Simple';
        if (score <= 4) return 'Moderate';
        return 'Advanced';
    }

    /**
     * Export templates
     */
    exportTemplates() {
        return {
            templates: Array.from(this.templates.values()),
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    /**
     * Import templates
     */
    importTemplates(data) {
        if (!data.templates || !Array.isArray(data.templates)) {
            throw new Error('Invalid template data format');
        }

        data.templates.forEach(template => {
            this.addTemplate(template);
        });

        return data.templates.length;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BotTemplates };
} else {
    window.BotTemplates = BotTemplates;
}
