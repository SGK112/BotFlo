/**
 * Conversation Flow Engine - Handles bot conversation logic
 */

class ConversationFlow {
    constructor(flowConfig = {}) {
        this.nodes = new Map();
        this.connections = new Map();
        this.variables = new Map();
        this.fallbackMessage = flowConfig.fallbackMessage || "I didn't understand that. Can you please rephrase?";
        
        this.loadFlow(flowConfig);
    }

    /**
     * Load conversation flow from configuration
     */
    loadFlow(flowConfig) {
        // Load nodes
        if (flowConfig.nodes) {
            flowConfig.nodes.forEach(node => {
                this.nodes.set(node.id, node);
            });
        }

        // Load connections
        if (flowConfig.connections) {
            flowConfig.connections.forEach(connection => {
                if (!this.connections.has(connection.from)) {
                    this.connections.set(connection.from, []);
                }
                this.connections.get(connection.from).push(connection);
            });
        }

        // Set default flow if none provided
        if (this.nodes.size === 0) {
            this.createDefaultFlow();
        }
    }

    /**
     * Create a default conversation flow
     */
    createDefaultFlow() {
        const welcomeNode = {
            id: 'welcome',
            type: 'message',
            content: 'Hello! How can I help you today?',
            triggers: ['start', 'hello', 'hi']
        };

        const helpNode = {
            id: 'help',
            type: 'message',
            content: 'I can help you with various questions. What would you like to know?',
            triggers: ['help', 'support', 'assistance']
        };

        this.nodes.set('welcome', welcomeNode);
        this.nodes.set('help', helpNode);
    }

    /**
     * Generate response based on intent and context
     */
    async generateResponse(context) {
        const { message, intent, entities, session, config } = context;

        try {
            // Check if this is the start of conversation
            if (session.messageCount === 0) {
                return this.getWelcomeMessage(config);
            }

            // Find matching node based on intent
            const matchingNode = this.findMatchingNode(intent, message);
            
            if (matchingNode) {
                return await this.processNode(matchingNode, context);
            }

            // Check for quick actions
            if (config.quickActions) {
                const quickResponse = this.checkQuickActions(message, config.quickActions, config.responses);
                if (quickResponse) {
                    return quickResponse;
                }
            }

            // Use NLP to find response
            const nlpResponse = await this.generateNLPResponse(message, config);
            if (nlpResponse) {
                return nlpResponse;
            }

            // Fallback response
            return this.fallbackMessage;

        } catch (error) {
            console.error('Error generating response:', error);
            return "I'm experiencing some technical difficulties. Please try again.";
        }
    }

    /**
     * Get welcome message
     */
    getWelcomeMessage(config) {
        return config.welcome || this.nodes.get('welcome')?.content || 'Hello! How can I help you?';
    }

    /**
     * Find node that matches the intent or message
     */
    findMatchingNode(intent, message) {
        const lowerMessage = message.toLowerCase();
        
        for (const [nodeId, node] of this.nodes) {
            if (node.triggers) {
                for (const trigger of node.triggers) {
                    if (lowerMessage.includes(trigger.toLowerCase()) || 
                        intent === trigger) {
                        return node;
                    }
                }
            }
        }
        
        return null;
    }

    /**
     * Process a specific node
     */
    async processNode(node, context) {
        switch (node.type) {
            case 'message':
                return this.processMessageNode(node, context);
            
            case 'question':
                return this.processQuestionNode(node, context);
            
            case 'action':
                return await this.processActionNode(node, context);
            
            case 'condition':
                return this.processConditionNode(node, context);
            
            case 'webhook':
                return await this.processWebhookNode(node, context);
            
            default:
                return node.content || 'Processing...';
        }
    }

    /**
     * Process message node
     */
    processMessageNode(node, context) {
        let content = node.content;
        
        // Replace variables
        content = this.replaceVariables(content, context);
        
        return content;
    }

    /**
     * Process question node
     */
    processQuestionNode(node, context) {
        const { session } = context;
        
        // Store that we're expecting an answer
        session.setVariable('expecting_answer_for', node.id);
        session.setVariable('question_type', node.questionType);
        
        return node.content;
    }

    /**
     * Process action node
     */
    async processActionNode(node, context) {
        try {
            switch (node.action) {
                case 'collect_email':
                    return this.collectEmail(context);
                
                case 'schedule_meeting':
                    return this.scheduleMeeting(context);
                
                case 'transfer_human':
                    return this.transferToHuman(context);
                
                default:
                    return node.content || 'Action completed.';
            }
        } catch (error) {
            console.error('Error processing action:', error);
            return 'Unable to complete that action right now.';
        }
    }

    /**
     * Process condition node
     */
    processConditionNode(node, context) {
        const { session, entities } = context;
        
        // Evaluate condition
        const conditionMet = this.evaluateCondition(node.condition, session, entities);
        
        if (conditionMet) {
            return node.trueResponse || 'Condition met.';
        } else {
            return node.falseResponse || 'Condition not met.';
        }
    }

    /**
     * Process webhook node
     */
    async processWebhookNode(node, context) {
        try {
            const webhookData = {
                message: context.message,
                intent: context.intent,
                entities: context.entities,
                sessionId: context.session.id,
                timestamp: new Date().toISOString()
            };

            // This would call actual webhook
            console.log('Webhook called:', node.webhookUrl, webhookData);
            
            return node.content || 'Information sent successfully.';
        } catch (error) {
            console.error('Webhook error:', error);
            return 'Unable to process request at this time.';
        }
    }

    /**
     * Check quick actions for response
     */
    checkQuickActions(message, quickActions, responses) {
        const lowerMessage = message.toLowerCase();
        
        for (const action of quickActions) {
            const actionKey = action.toLowerCase().replace(/\s+/g, '');
            if (lowerMessage.includes(action.toLowerCase())) {
                return responses[actionKey] || responses[action.toLowerCase()] || `Here's information about ${action}`;
            }
        }
        
        return null;
    }

    /**
     * Generate NLP-based response
     */
    async generateNLPResponse(message, config) {
        // Simple keyword matching for now
        // In production, this would use actual NLP/AI
        
        const responses = config.responses || {};
        const lowerMessage = message.toLowerCase();
        
        for (const [key, response] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }
        
        return null;
    }

    /**
     * Replace variables in text
     */
    replaceVariables(text, context) {
        return text.replace(/\{(\w+)\}/g, (match, variable) => {
            return context.session.getVariable(variable) || match;
        });
    }

    /**
     * Evaluate condition
     */
    evaluateCondition(condition, session, entities) {
        // Simple condition evaluation
        // In production, this would be more sophisticated
        
        if (condition.type === 'has_variable') {
            return session.hasVariable(condition.variable);
        }
        
        if (condition.type === 'entity_present') {
            return entities.some(entity => entity.type === condition.entityType);
        }
        
        return false;
    }

    /**
     * Update flow configuration
     */
    updateFlow(newFlowConfig) {
        this.nodes.clear();
        this.connections.clear();
        this.loadFlow(newFlowConfig);
    }

    /**
     * Export flow configuration
     */
    export() {
        return {
            nodes: Array.from(this.nodes.values()),
            connections: Array.from(this.connections.values()).flat(),
            variables: Array.from(this.variables.entries()),
            fallbackMessage: this.fallbackMessage
        };
    }

    /**
     * Collect email action
     */
    collectEmail(context) {
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
        const email = context.message.match(emailRegex);
        
        if (email) {
            context.session.setVariable('user_email', email[0]);
            return `Great! I've saved your email: ${email[0]}`;
        } else {
            return 'Please provide a valid email address.';
        }
    }

    /**
     * Schedule meeting action
     */
    scheduleMeeting(context) {
        // This would integrate with calendar APIs
        return 'I\'ll help you schedule a meeting. What time works best for you?';
    }

    /**
     * Transfer to human action
     */
    transferToHuman(context) {
        context.session.setVariable('transfer_requested', true);
        return 'I\'m connecting you with a human agent. Please wait a moment...';
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ConversationFlow };
} else {
    window.ConversationFlow = ConversationFlow;
}
