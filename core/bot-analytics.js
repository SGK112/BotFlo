/**
 * Bot Analytics - Track and analyze bot performance
 */

class BotAnalytics {
    constructor(botId) {
        this.botId = botId;
        this.sessions = new Map();
        this.metrics = {
            totalConversations: 0,
            totalMessages: 0,
            avgSessionLength: 0,
            avgMessagesPerSession: 0,
            userSatisfactionSum: 0,
            userSatisfactionCount: 0,
            bounceRate: 0,
            completionRate: 0,
            responseTime: 0,
            popularIntents: new Map(),
            popularQuestions: new Map(),
            errorCount: 0,
            leadsCaptured: 0
        };
        this.events = [];
        this.startTime = new Date();
    }

    /**
     * Record a new interaction
     */
    recordInteraction(userMessage, botResponse, sessionId) {
        const timestamp = new Date();
        
        // Record event
        this.events.push({
            type: 'interaction',
            sessionId,
            userMessage,
            botResponse,
            timestamp,
            responseLength: botResponse.length,
            messageLength: userMessage.length
        });

        // Update metrics
        this.updateMetrics(sessionId, userMessage, botResponse);
        
        // Track session
        this.trackSession(sessionId, timestamp);
    }

    /**
     * Update analytics metrics
     */
    updateMetrics(sessionId, userMessage, botResponse) {
        this.metrics.totalMessages++;
        
        // Track popular questions
        const question = userMessage.toLowerCase().trim();
        if (question.endsWith('?')) {
            const count = this.metrics.popularQuestions.get(question) || 0;
            this.metrics.popularQuestions.set(question, count + 1);
        }

        // Update response time (simulate)
        const responseTime = botResponse.length * 10 + Math.random() * 100;
        this.metrics.responseTime = (this.metrics.responseTime + responseTime) / 2;
    }

    /**
     * Track session analytics
     */
    trackSession(sessionId, timestamp) {
        if (!this.sessions.has(sessionId)) {
            this.sessions.set(sessionId, {
                id: sessionId,
                startTime: timestamp,
                lastActivity: timestamp,
                messageCount: 0,
                completed: false,
                bounced: false,
                leadCaptured: false,
                satisfaction: null
            });
            this.metrics.totalConversations++;
        }

        const session = this.sessions.get(sessionId);
        session.lastActivity = timestamp;
        session.messageCount++;
    }

    /**
     * Record session completion
     */
    recordSessionCompletion(sessionId, completed = true) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.completed = completed;
            
            // Update completion rate
            const completedSessions = Array.from(this.sessions.values())
                .filter(s => s.completed).length;
            this.metrics.completionRate = completedSessions / this.sessions.size;
        }
    }

    /**
     * Record user satisfaction
     */
    recordSatisfaction(sessionId, rating) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.satisfaction = rating;
            this.metrics.userSatisfactionSum += rating;
            this.metrics.userSatisfactionCount++;
        }
    }

    /**
     * Record lead capture
     */
    recordLeadCapture(sessionId, leadData) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.leadCaptured = true;
            session.leadData = leadData;
            this.metrics.leadsCaptured++;
        }

        this.events.push({
            type: 'lead_captured',
            sessionId,
            leadData,
            timestamp: new Date()
        });
    }

    /**
     * Record intent detection
     */
    recordIntent(sessionId, intent, confidence) {
        this.events.push({
            type: 'intent_detected',
            sessionId,
            intent,
            confidence,
            timestamp: new Date()
        });

        // Update popular intents
        const count = this.metrics.popularIntents.get(intent) || 0;
        this.metrics.popularIntents.set(intent, count + 1);
    }

    /**
     * Record error
     */
    recordError(sessionId, error, context = {}) {
        this.metrics.errorCount++;
        
        this.events.push({
            type: 'error',
            sessionId,
            error: {
                message: error.message,
                stack: error.stack
            },
            context,
            timestamp: new Date()
        });
    }

    /**
     * Calculate real-time metrics
     */
    calculateMetrics() {
        const sessions = Array.from(this.sessions.values());
        const now = new Date();

        // Average session length
        const sessionLengths = sessions.map(session => {
            const duration = session.lastActivity - session.startTime;
            return duration / 1000 / 60; // Convert to minutes
        });
        
        this.metrics.avgSessionLength = sessionLengths.length > 0 
            ? sessionLengths.reduce((sum, length) => sum + length, 0) / sessionLengths.length 
            : 0;

        // Average messages per session
        const messageCounts = sessions.map(session => session.messageCount);
        this.metrics.avgMessagesPerSession = messageCounts.length > 0
            ? messageCounts.reduce((sum, count) => sum + count, 0) / messageCounts.length
            : 0;

        // Bounce rate (sessions with only 1 message)
        const bouncedSessions = sessions.filter(session => session.messageCount <= 1).length;
        this.metrics.bounceRate = sessions.length > 0 ? bouncedSessions / sessions.length : 0;

        // User satisfaction average
        const satisfactionAvg = this.metrics.userSatisfactionCount > 0
            ? this.metrics.userSatisfactionSum / this.metrics.userSatisfactionCount
            : 0;

        return {
            ...this.metrics,
            userSatisfactionAvg: satisfactionAvg,
            activeSessions: sessions.filter(session => {
                const timeSinceLastActivity = now - session.lastActivity;
                return timeSinceLastActivity < 30 * 60 * 1000; // 30 minutes
            }).length,
            totalSessions: sessions.length,
            conversionRate: sessions.length > 0 ? this.metrics.leadsCaptured / sessions.length : 0,
            errorRate: this.metrics.totalMessages > 0 ? this.metrics.errorCount / this.metrics.totalMessages : 0
        };
    }

    /**
     * Get top intents
     */
    getTopIntents(limit = 10) {
        return Array.from(this.metrics.popularIntents.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([intent, count]) => ({ intent, count }));
    }

    /**
     * Get top questions
     */
    getTopQuestions(limit = 10) {
        return Array.from(this.metrics.popularQuestions.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([question, count]) => ({ question, count }));
    }

    /**
     * Get session details
     */
    getSessionDetails(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return null;

        const sessionEvents = this.events.filter(event => event.sessionId === sessionId);
        
        return {
            ...session,
            duration: (session.lastActivity - session.startTime) / 1000 / 60, // minutes
            events: sessionEvents,
            interactions: sessionEvents.filter(event => event.type === 'interaction')
        };
    }

    /**
     * Get analytics summary
     */
    getSummary() {
        const metrics = this.calculateMetrics();
        
        return {
            botId: this.botId,
            period: {
                start: this.startTime,
                end: new Date()
            },
            overview: {
                totalConversations: metrics.totalConversations,
                totalMessages: metrics.totalMessages,
                activeSessions: metrics.activeSessions,
                leadsCaptured: metrics.leadsCaptured
            },
            performance: {
                avgSessionLength: Math.round(metrics.avgSessionLength * 100) / 100,
                avgMessagesPerSession: Math.round(metrics.avgMessagesPerSession * 100) / 100,
                bounceRate: Math.round(metrics.bounceRate * 100),
                completionRate: Math.round(metrics.completionRate * 100),
                conversionRate: Math.round(metrics.conversionRate * 100),
                userSatisfaction: Math.round(metrics.userSatisfactionAvg * 100) / 100,
                avgResponseTime: Math.round(metrics.responseTime),
                errorRate: Math.round(metrics.errorRate * 100)
            },
            insights: {
                topIntents: this.getTopIntents(5),
                topQuestions: this.getTopQuestions(5),
                peakHours: this.getPeakHours(),
                userBehavior: this.getUserBehaviorInsights()
            }
        };
    }

    /**
     * Get peak hours analysis
     */
    getPeakHours() {
        const hourCounts = new Array(24).fill(0);
        
        this.events.forEach(event => {
            const hour = event.timestamp.getHours();
            hourCounts[hour]++;
        });

        const maxCount = Math.max(...hourCounts);
        const peakHour = hourCounts.indexOf(maxCount);

        return {
            peakHour,
            peakCount: maxCount,
            distribution: hourCounts.map((count, hour) => ({ hour, count }))
        };
    }

    /**
     * Get user behavior insights
     */
    getUserBehaviorInsights() {
        const sessions = Array.from(this.sessions.values());
        
        const quickExits = sessions.filter(s => s.messageCount <= 2).length;
        const engagedUsers = sessions.filter(s => s.messageCount >= 5).length;
        const returningUsers = sessions.filter(s => s.messageCount >= 10).length;

        return {
            quickExitRate: sessions.length > 0 ? quickExits / sessions.length : 0,
            engagementRate: sessions.length > 0 ? engagedUsers / sessions.length : 0,
            retentionRate: sessions.length > 0 ? returningUsers / sessions.length : 0,
            avgWordsPerMessage: this.calculateAvgWordsPerMessage()
        };
    }

    /**
     * Calculate average words per message
     */
    calculateAvgWordsPerMessage() {
        const interactions = this.events.filter(event => event.type === 'interaction');
        if (interactions.length === 0) return 0;

        const totalWords = interactions.reduce((sum, interaction) => {
            const wordCount = interaction.userMessage.split(/\s+/).length;
            return sum + wordCount;
        }, 0);

        return totalWords / interactions.length;
    }

    /**
     * Export analytics data
     */
    export() {
        return {
            botId: this.botId,
            summary: this.getSummary(),
            sessions: Array.from(this.sessions.values()),
            events: this.events,
            metrics: this.calculateMetrics(),
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Get real-time stats
     */
    getRealTimeStats() {
        const now = new Date();
        const oneHourAgo = new Date(now - 60 * 60 * 1000);
        const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

        const recentEvents = this.events.filter(event => event.timestamp > oneHourAgo);
        const todayEvents = this.events.filter(event => event.timestamp > oneDayAgo);

        return {
            lastHour: {
                interactions: recentEvents.filter(e => e.type === 'interaction').length,
                newSessions: recentEvents.filter(e => e.type === 'session_start').length,
                errors: recentEvents.filter(e => e.type === 'error').length
            },
            today: {
                interactions: todayEvents.filter(e => e.type === 'interaction').length,
                newSessions: todayEvents.filter(e => e.type === 'session_start').length,
                leadsCapture: todayEvents.filter(e => e.type === 'lead_captured').length
            },
            current: {
                activeSessions: this.calculateMetrics().activeSessions,
                totalSessions: this.sessions.size,
                avgResponseTime: Math.round(this.metrics.responseTime)
            }
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BotAnalytics };
} else {
    window.BotAnalytics = BotAnalytics;
}
