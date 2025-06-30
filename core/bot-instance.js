/**
 * Bot Instance - Advanced Individual bot functionality with smart NLP
 */

class BotInstance {
    constructor(id, config) {
        this.id = id;
        this.config = config;
        this.state = 'active';
        this.sessions = new Map();
        this.conversationFlow = new ConversationFlow(config.flow || {});
        
        // Initialize advanced NLP with web-scraped content and business info
        this.nlp = new BotNLP({
            scrapedContent: config.scrapedContent || {},
            businessInfo: config.businessInfo || {},
            customIntents: config.customIntents || [],
            ...config.nlp
        });
        
        this.integrations = new BotIntegrations(config.integrations || {});
        this.analytics = new BotAnalytics(id);
        
        this.createdAt = new Date();
        this.lastActive = new Date();
        this.totalConversations = 0;
        this.revenue = 0;
        
        console.log(`🤖 Bot ${this.id} created: ${config.name || 'Unnamed Bot'} with advanced NLP`);
    }

    /**
     * Process incoming message with advanced NLP and context understanding
     */
    async processMessage(message, sessionId) {
        this.lastActive = new Date();
        
        // Get or create session
        let session = this.sessions.get(sessionId);
        if (!session) {
            session = new BotSession(sessionId, this.config);
            this.sessions.set(sessionId, session);
            this.totalConversations++;
        }

        try {
            // Process with advanced NLP system
            const nlpResult = await this.nlp.processInput(message, sessionId);
            
            // Generate response through conversation flow with NLP insights
            const response = await this.conversationFlow.generateResponse({
                message,
                intent: nlpResult.intent,
                entities: nlpResult.entities,
                sentiment: nlpResult.sentiment,
                suggestions: nlpResult.suggestions,
                session,
                config: this.config,
                nlpResponse: nlpResult.response
            });

            // Update session state with enhanced data
            session.addMessage(message, response, {
                intent: nlpResult.intent,
                sentiment: nlpResult.sentiment,
                confidence: nlpResult.confidence
            });

            // Track analytics
            this.analytics.trackInteraction({
                sessionId,
                intent: nlpResult.intent,
                sentiment: nlpResult.sentiment,
                messageLength: message.length,
                responseTime: Date.now() - this.lastActive.getTime()
            });

            // Handle integrations (webhooks, lead capture, etc.)
            if (nlpResult.intent === 'contact' || nlpResult.intent === 'pricing') {
                await this.handleLeadCapture(session, nlpResult);
            }

            return {
                response: nlpResult.response,
                suggestions: nlpResult.suggestions,
                intent: nlpResult.intent,
                sentiment: nlpResult.sentiment,
                sessionId
            };

        } catch (error) {
            console.error(`Bot ${this.id} processing error:`, error);
            
            // Fallback response
            return {
                response: "I'm having trouble processing that right now. Please try again or contact us directly.",
                suggestions: ["Try asking differently", "Contact support", "Visit our website"],
                intent: 'error',
                sentiment: { label: 'neutral', score: 0 },
                sessionId
            };
        }
    }

    /**
     * Handle lead capture for revenue generation
     */
    async handleLeadCapture(session, nlpResult) {
        if (this.config.leadCapture && this.config.leadCapture.enabled) {
            const leadData = {
                sessionId: session.id,
                intent: nlpResult.intent,
                timestamp: new Date(),
                conversation: session.getRecentMessages(5),
                sentiment: nlpResult.sentiment,
                source: 'chatbot',
                botId: this.id
            };

            // Send to CRM or webhook
            if (this.config.leadCapture.webhook) {
                await this.integrations.sendWebhook(this.config.leadCapture.webhook, leadData);
            }

            // Update revenue tracking
            if (nlpResult.intent === 'pricing' && nlpResult.sentiment.label === 'positive') {
                this.revenue += this.config.leadValue || 10; // Default $10 per qualified lead
            }
        }
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

/**
 * Simple Bot Analytics for tracking interactions
 */
class BotAnalytics {
    constructor(botId) {
        this.botId = botId;
        this.interactions = [];
        this.metrics = {
            totalInteractions: 0,
            averageResponseTime: 0,
            sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
            topIntents: new Map(),
            dailyStats: new Map()
        };
    }

    trackInteraction(data) {
        this.interactions.push({
            ...data,
            timestamp: new Date()
        });

        // Update metrics
        this.metrics.totalInteractions++;
        
        // Update sentiment breakdown
        if (data.sentiment && data.sentiment.label) {
            this.metrics.sentimentBreakdown[data.sentiment.label]++;
        }

        // Track intent frequency
        if (data.intent) {
            const count = this.metrics.topIntents.get(data.intent) || 0;
            this.metrics.topIntents.set(data.intent, count + 1);
        }

        // Keep only last 1000 interactions to prevent memory issues
        if (this.interactions.length > 1000) {
            this.interactions = this.interactions.slice(-1000);
        }
    }

    getMetrics() {
        return { ...this.metrics };
    }

    getDailyStats(date = new Date()) {
        const dateKey = date.toISOString().split('T')[0];
        return this.metrics.dailyStats.get(dateKey) || {
            interactions: 0,
            uniqueSessions: 0,
            averageSentiment: 0
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BotInstance };
} else {
    window.BotInstance = BotInstance;
}
