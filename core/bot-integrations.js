/**
 * Bot Integrations - Handle external integrations
 */

class BotIntegrations {
    constructor(config = {}) {
        this.config = config;
        this.webhooks = [];
        this.emailConfig = null;
        this.slackConfig = null;
        this.analyticsConfig = null;
        
        this.initializeIntegrations();
    }

    /**
     * Initialize integrations from config
     */
    initializeIntegrations() {
        if (this.config.webhook) {
            this.setupWebhook(this.config.webhook);
        }

        if (this.config.email) {
            this.setupEmail(this.config.email);
        }

        if (this.config.slack) {
            this.setupSlack(this.config.slack);
        }

        if (this.config.analytics) {
            this.setupAnalytics(this.config.analytics);
        }
    }

    /**
     * Setup webhook integration
     */
    setupWebhook(webhookConfig) {
        if (webhookConfig.enabled && webhookConfig.url) {
            this.webhooks.push({
                url: webhookConfig.url,
                method: webhookConfig.method || 'POST',
                headers: webhookConfig.headers || {},
                events: webhookConfig.events || ['message', 'response'],
                retries: webhookConfig.retries || 3
            });
        }
    }

    /**
     * Setup email integration
     */
    setupEmail(emailConfig) {
        if (emailConfig.enabled) {
            this.emailConfig = {
                smtp: emailConfig.smtp,
                from: emailConfig.from,
                notifications: emailConfig.notifications || true,
                templates: emailConfig.templates || {}
            };
        }
    }

    /**
     * Setup Slack integration
     */
    setupSlack(slackConfig) {
        if (slackConfig.enabled && slackConfig.webhook) {
            this.slackConfig = {
                webhook: slackConfig.webhook,
                channel: slackConfig.channel || '#general',
                username: slackConfig.username || 'BotFlo',
                emoji: slackConfig.emoji || ':robot_face:'
            };
        }
    }

    /**
     * Setup analytics integration
     */
    setupAnalytics(analyticsConfig) {
        if (analyticsConfig.enabled) {
            this.analyticsConfig = {
                trackingId: analyticsConfig.trackingId,
                events: analyticsConfig.events || [],
                customDimensions: analyticsConfig.customDimensions || {}
            };
        }
    }

    /**
     * Check if webhooks are configured
     */
    hasWebhooks() {
        return this.webhooks.length > 0;
    }

    /**
     * Trigger webhooks for an event
     */
    async triggerWebhooks(eventData) {
        const promises = this.webhooks.map(webhook => 
            this.callWebhook(webhook, eventData)
        );

        try {
            await Promise.allSettled(promises);
        } catch (error) {
            console.error('Webhook error:', error);
        }
    }

    /**
     * Call individual webhook
     */
    async callWebhook(webhook, eventData) {
        for (let attempt = 1; attempt <= webhook.retries; attempt++) {
            try {
                const response = await fetch(webhook.url, {
                    method: webhook.method,
                    headers: {
                        'Content-Type': 'application/json',
                        ...webhook.headers
                    },
                    body: JSON.stringify({
                        ...eventData,
                        timestamp: new Date().toISOString(),
                        attempt
                    })
                });

                if (response.ok) {
                    console.log(`Webhook called successfully: ${webhook.url}`);
                    return;
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (error) {
                console.error(`Webhook attempt ${attempt} failed:`, error);
                
                if (attempt === webhook.retries) {
                    console.error(`Webhook failed after ${webhook.retries} attempts: ${webhook.url}`);
                } else {
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
            }
        }
    }

    /**
     * Send email notification
     */
    async sendEmail(to, subject, body, data = {}) {
        if (!this.emailConfig) {
            console.log('Email not configured');
            return false;
        }

        try {
            // In a real implementation, this would use nodemailer or similar
            console.log('Email sent:', {
                to,
                subject,
                body: body.substring(0, 100) + '...',
                data
            });

            return true;
        } catch (error) {
            console.error('Email error:', error);
            return false;
        }
    }

    /**
     * Send Slack notification
     */
    async sendSlackMessage(message, data = {}) {
        if (!this.slackConfig) {
            console.log('Slack not configured');
            return false;
        }

        try {
            const payload = {
                channel: this.slackConfig.channel,
                username: this.slackConfig.username,
                icon_emoji: this.slackConfig.emoji,
                text: message,
                attachments: data.attachments || []
            };

            const response = await fetch(this.slackConfig.webhook, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log('Slack message sent successfully');
                return true;
            } else {
                throw new Error(`Slack API error: ${response.status}`);
            }
        } catch (error) {
            console.error('Slack error:', error);
            return false;
        }
    }

    /**
     * Track analytics event
     */
    trackEvent(eventName, eventData = {}) {
        if (!this.analyticsConfig) {
            return;
        }

        try {
            const event = {
                name: eventName,
                data: eventData,
                timestamp: new Date().toISOString(),
                trackingId: this.analyticsConfig.trackingId
            };

            // In a real implementation, this would send to Google Analytics or similar
            console.log('Analytics event tracked:', event);

        } catch (error) {
            console.error('Analytics error:', error);
        }
    }

    /**
     * Handle conversation start event
     */
    async onConversationStart(sessionId, botId) {
        // Send webhooks
        if (this.hasWebhooks()) {
            await this.triggerWebhooks({
                event: 'conversation_start',
                sessionId,
                botId
            });
        }

        // Track analytics
        this.trackEvent('conversation_start', { sessionId, botId });

        // Send Slack notification if configured for this event
        if (this.slackConfig) {
            await this.sendSlackMessage(`🤖 New conversation started with bot ${botId}`);
        }
    }

    /**
     * Handle conversation end event
     */
    async onConversationEnd(sessionId, botId, summary) {
        // Send webhooks
        if (this.hasWebhooks()) {
            await this.triggerWebhooks({
                event: 'conversation_end',
                sessionId,
                botId,
                summary
            });
        }

        // Track analytics
        this.trackEvent('conversation_end', { 
            sessionId, 
            botId, 
            duration: summary.duration,
            messageCount: summary.messageCount
        });

        // Send email summary if configured
        if (this.emailConfig && summary.userEmail) {
            await this.sendEmail(
                summary.userEmail,
                'Conversation Summary',
                `Thank you for chatting with ${summary.botName}! Here's a summary of our conversation...`,
                summary
            );
        }
    }

    /**
     * Handle lead capture event
     */
    async onLeadCaptured(sessionId, botId, leadData) {
        // Send webhooks
        if (this.hasWebhooks()) {
            await this.triggerWebhooks({
                event: 'lead_captured',
                sessionId,
                botId,
                leadData
            });
        }

        // Track analytics
        this.trackEvent('lead_captured', { sessionId, botId, leadData });

        // Send Slack notification
        if (this.slackConfig) {
            const message = `🎯 New lead captured!\n` +
                           `Email: ${leadData.email}\n` +
                           `Name: ${leadData.name || 'Unknown'}\n` +
                           `Bot: ${botId}`;
            
            await this.sendSlackMessage(message);
        }

        // Send welcome email to lead
        if (this.emailConfig && leadData.email) {
            await this.sendEmail(
                leadData.email,
                'Welcome! Thanks for your interest',
                'Thank you for reaching out. We\'ll be in touch soon!',
                leadData
            );
        }
    }

    /**
     * Handle error event
     */
    async onError(error, context = {}) {
        // Send webhooks
        if (this.hasWebhooks()) {
            await this.triggerWebhooks({
                event: 'error',
                error: {
                    message: error.message,
                    stack: error.stack
                },
                context
            });
        }

        // Send Slack notification for errors
        if (this.slackConfig) {
            await this.sendSlackMessage(`🚨 Bot error: ${error.message}`, {
                attachments: [{
                    color: 'danger',
                    fields: [
                        {
                            title: 'Error',
                            value: error.message,
                            short: false
                        },
                        {
                            title: 'Context',
                            value: JSON.stringify(context, null, 2),
                            short: false
                        }
                    ]
                }]
            });
        }
    }

    /**
     * Update integration config
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.initializeIntegrations();
    }

    /**
     * Test integration
     */
    async testIntegration(integrationType) {
        try {
            switch (integrationType) {
                case 'webhook':
                    if (this.hasWebhooks()) {
                        await this.triggerWebhooks({
                            event: 'test',
                            message: 'This is a test webhook call',
                            timestamp: new Date().toISOString()
                        });
                        return { success: true, message: 'Webhook test sent' };
                    }
                    return { success: false, message: 'No webhooks configured' };

                case 'slack':
                    if (this.slackConfig) {
                        const result = await this.sendSlackMessage('🧪 Test message from BotFlo');
                        return { success: result, message: result ? 'Slack test sent' : 'Slack test failed' };
                    }
                    return { success: false, message: 'Slack not configured' };

                case 'email':
                    if (this.emailConfig) {
                        // Would send test email in real implementation
                        return { success: true, message: 'Email test would be sent' };
                    }
                    return { success: false, message: 'Email not configured' };

                default:
                    return { success: false, message: 'Unknown integration type' };
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * Get integration status
     */
    getStatus() {
        return {
            webhook: {
                enabled: this.hasWebhooks(),
                count: this.webhooks.length
            },
            email: {
                enabled: !!this.emailConfig,
                configured: !!this.emailConfig?.smtp
            },
            slack: {
                enabled: !!this.slackConfig,
                configured: !!this.slackConfig?.webhook
            },
            analytics: {
                enabled: !!this.analyticsConfig,
                configured: !!this.analyticsConfig?.trackingId
            }
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BotIntegrations };
} else {
    window.BotIntegrations = BotIntegrations;
}
