/**
 * BotFlo.ai - Real Bot Engine
 * Core engine for generating and managing functional chatbots
 */

// Import core classes (Node.js style imports)
let BotInstance, BotSession, ConversationFlow, BotNLP, BotIntegrations, BotAnalytics;

if (typeof require !== 'undefined') {
    // Node.js environment
    ({ BotInstance } = require('./core/bot-instance'));
    ({ BotSession } = require('./core/bot-session'));
    ({ ConversationFlow } = require('./core/conversation-flow'));
    ({ BotNLP } = require('./core/bot-nlp'));
    ({ BotIntegrations } = require('./core/bot-integrations'));
    ({ BotAnalytics } = require('./core/bot-analytics'));
}

class BotEngine {
    constructor() {
        this.bots = new Map(); // Active bot instances
        this.templates = new Map(); // Bot templates
        this.analytics = new Map(); // Bot analytics
        this.conversations = new Map(); // Active conversations
        
        this.initializeTemplates();
    }

    /**
     * Initialize built-in bot templates
     */
    initializeTemplates() {
        console.log('🤖 Bot Engine initialized');
        console.log(`📊 Active bots: ${this.bots.size}`);
        console.log(`📋 Templates: ${this.templates.size}`);
    }

    /**
     * Create a new bot instance from template
     */
    createBot(config) {
        const botId = this.generateBotId();
        
        // Create bot instance with all core classes
        const bot = new (BotInstance || window.BotInstance)(botId, config);
        
        this.bots.set(botId, bot);
        this.analytics.set(botId, new (BotAnalytics || window.BotAnalytics)(botId));
        
        console.log(`✅ Created bot: ${botId} (${config.name})`);
        return bot;
    }

    /**
     * Process incoming message for a bot
     */
    async processMessage(botId, message, sessionId) {
        const bot = this.bots.get(botId);
        if (!bot) {
            throw new Error(`Bot ${botId} not found`);
        }

        const response = await bot.processMessage(message, sessionId);
        this.trackAnalytics(botId, message, response, sessionId);
        return response;
    }

    /**
     * Generate unique bot ID
     */
    generateBotId() {
        return 'bot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Track analytics for bot interactions
     */
    trackAnalytics(botId, message, response, sessionId) {
        const analytics = this.analytics.get(botId);
        if (analytics) {
            analytics.recordInteraction(message, response, sessionId);
        }
    }

    /**
     * Get bot by ID
     */
    getBot(botId) {
        return this.bots.get(botId);
    }

    /**
     * Get all bots
     */
    getAllBots() {
        return Array.from(this.bots.values());
    }

    /**
     * Delete bot
     */
    deleteBot(botId) {
        this.bots.delete(botId);
        this.analytics.delete(botId);
        console.log(`🗑️ Deleted bot: ${botId}`);
    }

    /**
     * Get engine stats
     */
    getStats() {
        return {
            totalBots: this.bots.size,
            activeBots: Array.from(this.bots.values()).filter(bot => bot.state === 'active').length,
            totalSessions: Array.from(this.bots.values()).reduce((total, bot) => total + bot.sessions.size, 0),
            uptime: process.uptime ? Math.floor(process.uptime()) : 0
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        BotEngine,
        BotInstance,
        BotSession,
        ConversationFlow,
        BotNLP,
        BotIntegrations,
        BotAnalytics
    };
} else {
    window.BotEngine = BotEngine;
}
