/**
 * Bot Instance - Individual bot functionality
 */

class BotInstance {
    constructor(id, config) {
        this.id = id;
        this.config = config;
        this.state = 'active';
        this.sessions = new Map();
        this.conversationFlow = new ConversationFlow(config.flow || {});
        this.nlp = new BotNLP(config.nlp || {});
        this.integrations = new BotIntegrations(config.integrations || {});
        
        this.createdAt = new Date();
        this.lastActive = new Date();
        
        console.log(`🤖 Bot ${this.id} created: ${config.name || 'Unnamed Bot'}`);
    }

    /**
     * Process incoming message
     */
    async processMessage(message, sessionId) {
        this.lastActive = new Date();
        
        // Get or create session
        let session = this.sessions.get(sessionId);
        if (!session) {
            session = new BotSession(sessionId, this.config);
            this.sessions.set(sessionId, session);
        }

        // Process message through NLP
        const intent = await this.nlp.analyzeIntent(message);
        const entities = await this.nlp.extractEntities(message);

        // Generate response through conversation flow
        const response = await this.conversationFlow.generateResponse({
            message,
            intent,
            entities,
            session,
            config: this.config
        });

        // Update session state
        session.addMessage(message, response);

        // Handle integrations (webhooks, etc.)
        if (this.integrations.hasWebhooks()) {
            this.integrations.triggerWebhooks({
                botId: this.id,
                message,
                response,
                sessionId,
                intent,
                entities
            });
        }

        return response;
    }

    /**
     * Get bot configuration
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Update bot configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.conversationFlow.updateFlow(newConfig.flow || {});
        this.nlp.updateConfig(newConfig.nlp || {});
        this.integrations.updateConfig(newConfig.integrations || {});
    }

    /**
     * Get bot stats
     */
    getStats() {
        return {
            id: this.id,
            name: this.config.name,
            state: this.state,
            activeSessions: this.sessions.size,
            createdAt: this.createdAt,
            lastActive: this.lastActive,
            totalMessages: Array.from(this.sessions.values())
                .reduce((total, session) => total + session.messageCount, 0)
        };
    }

    /**
     * Export bot for deployment
     */
    export() {
        return {
            id: this.id,
            config: this.config,
            flow: this.conversationFlow.export(),
            createdAt: this.createdAt,
            version: '1.0.0'
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BotInstance };
} else {
    window.BotInstance = BotInstance;
}
