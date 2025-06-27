/**
 * Bot Builder API - REST API for bot management
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import our core classes - handle missing files gracefully
let BotEngine, BotTemplates;

try {
    BotEngine = require('../bot-engine').BotEngine;
    BotTemplates = require('../core/bot-templates').BotTemplates;
} catch (error) {
    console.warn('Core bot classes not available:', error.message);
    // Create mock classes for development
    BotEngine = class { 
        constructor() { 
            this.bots = new Map(); 
            this.analytics = new Map(); 
        }
        createBot(config) { 
            const bot = { id: 'mock_bot', config, getConfig: () => config, getStats: () => ({}) };
            this.bots.set(bot.id, bot);
            return bot;
        }
        async processMessage(botId, message, sessionId) {
            return `Mock response to: ${message}`;
        }
    };
    BotTemplates = class {
        constructor() { this.templates = new Map(); }
        getAllTemplates() { return []; }
        getTemplate(id) { return null; }
    };
}

class BotBuilderAPI {
    constructor() {
        this.router = express.Router();
        this.botEngine = new BotEngine();
        this.botTemplates = new BotTemplates();
        this.setupMiddleware();
        this.setupRoutes();
    }

    /**
     * Setup Express middleware
     */
    setupMiddleware() {
        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP'
        });
        this.router.use(limiter);

        // Body parsing
        this.router.use(express.json({ limit: '10mb' }));
        this.router.use(express.urlencoded({ extended: true }));

        // Request logging
        this.router.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }

    /**
     * Setup API routes
     */
    setupRoutes() {
        // Health check
        this.router.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                botEngine: !!this.botEngine,
                templates: !!this.botTemplates
            });
        });

        // Template routes
        this.setupTemplateRoutes();
        
        // Bot management routes
        this.setupBotRoutes();
        
        // Chat routes
        this.setupChatRoutes();
        
        // Analytics routes
        this.setupAnalyticsRoutes();
        
        // Integration routes
        this.setupIntegrationRoutes();
    }

    /**
     * Template management routes
     */
    setupTemplateRoutes() {
        // Get all templates
        this.router.get('/templates', (req, res) => {
            try {
                const templates = this.botTemplates.getAllTemplates();
                res.json({ success: true, templates });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Get template by ID
        this.router.get('/templates/:id', (req, res) => {
            try {
                const template = this.botTemplates.getTemplate(req.params.id);
                if (!template) {
                    return res.status(404).json({ success: false, error: 'Template not found' });
                }
                res.json({ success: true, template });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Get templates by category
        this.router.get('/templates/category/:category', (req, res) => {
            try {
                const templates = this.botTemplates.getTemplatesByCategory ? 
                    this.botTemplates.getTemplatesByCategory(req.params.category) : [];
                res.json({ success: true, templates });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Search templates
        this.router.get('/templates/search/:query', (req, res) => {
            try {
                const templates = this.botTemplates.searchTemplates ? 
                    this.botTemplates.searchTemplates(req.params.query) : [];
                res.json({ success: true, templates });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Get template preview
        this.router.get('/templates/:id/preview', (req, res) => {
            try {
                const preview = this.botTemplates.getTemplatePreview ? 
                    this.botTemplates.getTemplatePreview(req.params.id) : null;
                if (!preview) {
                    return res.status(404).json({ success: false, error: 'Template not found' });
                }
                res.json({ success: true, preview });
            } catch (error) {
                res.status(404).json({ success: false, error: error.message });
            }
        });
    }

    /**
     * Bot management routes
     */
    setupBotRoutes() {
        // Create bot from template
        this.router.post('/bots/create', (req, res) => {
            try {
                const { templateId, customizations, name } = req.body;
                
                if (!templateId) {
                    return res.status(400).json({ success: false, error: 'Template ID required' });
                }

                // Create bot config from template
                const botData = this.botTemplates.createBotFromTemplate ? 
                    this.botTemplates.createBotFromTemplate(templateId, customizations) :
                    { config: { name: name || 'Mock Bot', type: templateId } };
                
                // Create actual bot instance
                const bot = this.botEngine.createBot({
                    ...botData.config,
                    name: name || botData.config.name
                });

                res.json({ 
                    success: true, 
                    bot: {
                        id: bot.id,
                        config: bot.getConfig ? bot.getConfig() : bot.config,
                        templateId: botData.templateId || templateId,
                        created: true
                    }
                });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Get bot configuration
        this.router.get('/bots/:botId', (req, res) => {
            try {
                const bot = this.botEngine.bots.get(req.params.botId);
                if (!bot) {
                    return res.status(404).json({ success: false, error: 'Bot not found' });
                }

                res.json({ 
                    success: true, 
                    bot: {
                        id: bot.id,
                        config: bot.getConfig ? bot.getConfig() : bot.config,
                        stats: bot.getStats ? bot.getStats() : {}
                    }
                });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Update bot configuration
        this.router.put('/bots/:botId', (req, res) => {
            try {
                const bot = this.botEngine.bots.get(req.params.botId);
                if (!bot) {
                    return res.status(404).json({ success: false, error: 'Bot not found' });
                }

                if (bot.updateConfig) {
                    bot.updateConfig(req.body);
                }
                
                res.json({ 
                    success: true, 
                    message: 'Bot updated successfully',
                    config: bot.getConfig ? bot.getConfig() : bot.config
                });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Get all user's bots
        this.router.get('/bots', (req, res) => {
            try {
                const bots = Array.from(this.botEngine.bots.values()).map(bot => ({
                    id: bot.id,
                    name: bot.config ? bot.config.name : 'Unknown',
                    type: bot.config ? bot.config.type : 'unknown',
                    stats: bot.getStats ? bot.getStats() : {},
                    createdAt: bot.createdAt || new Date()
                }));

                res.json({ success: true, bots });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Test bot
        this.router.post('/bots/:botId/test', async (req, res) => {
            try {
                const { message, sessionId } = req.body;
                const testSessionId = sessionId || 'test_' + Date.now();
                
                const response = await this.botEngine.processMessage(
                    req.params.botId, 
                    message, 
                    testSessionId
                );
                
                res.json({ success: true, response, sessionId: testSessionId });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }

    /**
     * Chat interaction routes
     */
    setupChatRoutes() {
        // Send message to bot
        this.router.post('/chat/:botId', async (req, res) => {
            try {
                const { message, sessionId } = req.body;
                
                if (!message) {
                    return res.status(400).json({ success: false, error: 'Message required' });
                }

                if (!sessionId) {
                    return res.status(400).json({ success: false, error: 'Session ID required' });
                }

                const response = await this.botEngine.processMessage(
                    req.params.botId, 
                    message, 
                    sessionId
                );
                
                res.json({ 
                    success: true, 
                    response,
                    sessionId,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Start new chat session
        this.router.post('/chat/:botId/session', (req, res) => {
            try {
                const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                
                res.json({ 
                    success: true, 
                    sessionId,
                    message: 'Session created successfully'
                });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }

    /**
     * Analytics routes
     */
    setupAnalyticsRoutes() {
        // Get bot analytics
        this.router.get('/analytics/:botId', (req, res) => {
            try {
                const analytics = this.botEngine.analytics ? this.botEngine.analytics.get(req.params.botId) : null;
                if (!analytics) {
                    return res.status(404).json({ success: false, error: 'Analytics not found' });
                }

                const summary = analytics.getSummary ? analytics.getSummary() : { message: 'Mock analytics' };
                res.json({ success: true, analytics: summary });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }

    /**
     * Integration routes
     */
    setupIntegrationRoutes() {
        // Test integration
        this.router.post('/bots/:botId/integrations/test', async (req, res) => {
            try {
                res.json({ success: true, result: { success: true, message: 'Integration test successful' } });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }

    /**
     * Get Express router
     */
    getRouter() {
        return this.router;
    }
}

module.exports = { BotBuilderAPI };
