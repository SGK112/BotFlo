/**
 * Bot NLP - Natural Language Processing for bots
 */

class BotNLP {
    constructor(config = {}) {
        this.config = config;
        this.intents = new Map();
        this.entities = new Map();
        this.keywords = new Map();
        
        this.initializeNLP();
    }

    /**
     * Initialize NLP with default intents and entities
     */
    initializeNLP() {
        this.loadDefaultIntents();
        this.loadDefaultEntities();
        this.loadKeywords();
    }

    /**
     * Load default intents
     */
    loadDefaultIntents() {
        const defaultIntents = [
            {
                name: 'greeting',
                examples: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'howdy'],
                response: 'greeting'
            },
            {
                name: 'help',
                examples: ['help', 'support', 'assistance', 'can you help', 'i need help'],
                response: 'help'
            },
            {
                name: 'information',
                examples: ['info', 'information', 'tell me about', 'what is', 'explain'],
                response: 'information'
            },
            {
                name: 'contact',
                examples: ['contact', 'reach out', 'get in touch', 'phone number', 'email'],
                response: 'contact'
            },
            {
                name: 'pricing',
                examples: ['price', 'cost', 'how much', 'pricing', 'fees', 'rates'],
                response: 'pricing'
            },
            {
                name: 'booking',
                examples: ['book', 'schedule', 'appointment', 'reservation', 'reserve'],
                response: 'booking'
            },
            {
                name: 'complaint',
                examples: ['problem', 'issue', 'complaint', 'wrong', 'error', 'not working'],
                response: 'complaint'
            },
            {
                name: 'goodbye',
                examples: ['bye', 'goodbye', 'see you', 'farewell', 'exit', 'quit'],
                response: 'goodbye'
            }
        ];

        defaultIntents.forEach(intent => {
            this.intents.set(intent.name, intent);
        });
    }

    /**
     * Load default entities
     */
    loadDefaultEntities() {
        const defaultEntities = [
            {
                name: 'email',
                pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
                type: 'contact'
            },
            {
                name: 'phone',
                pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
                type: 'contact'
            },
            {
                name: 'name',
                pattern: /(?:my name is|i'm|i am|call me)\s+([a-zA-Z\s]+)/gi,
                type: 'personal'
            },
            {
                name: 'date',
                pattern: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,
                type: 'temporal'
            },
            {
                name: 'time',
                pattern: /\b\d{1,2}:\d{2}(?:\s*(?:AM|PM))?\b/gi,
                type: 'temporal'
            },
            {
                name: 'money',
                pattern: /\$\d+(?:\.\d{2})?/g,
                type: 'financial'
            }
        ];

        defaultEntities.forEach(entity => {
            this.entities.set(entity.name, entity);
        });
    }

    /**
     * Load keywords for better matching
     */
    loadKeywords() {
        const keywordGroups = {
            positive: ['yes', 'yeah', 'sure', 'okay', 'ok', 'good', 'great', 'awesome', 'perfect'],
            negative: ['no', 'nope', 'not', 'never', 'bad', 'terrible', 'awful', 'horrible'],
            urgent: ['urgent', 'asap', 'immediately', 'right now', 'emergency', 'quickly'],
            polite: ['please', 'thank you', 'thanks', 'appreciate', 'grateful']
        };

        Object.entries(keywordGroups).forEach(([group, words]) => {
            this.keywords.set(group, words);
        });
    }

    /**
     * Analyze intent from message
     */
    async analyzeIntent(message) {
        const lowerMessage = message.toLowerCase();
        let bestMatch = null;
        let highestScore = 0;

        // Check each intent
        for (const [intentName, intent] of this.intents) {
            const score = this.calculateIntentScore(lowerMessage, intent.examples);
            
            if (score > highestScore) {
                highestScore = score;
                bestMatch = intentName;
            }
        }

        // Return intent if confidence is high enough
        if (highestScore > 0.5) {
            return {
                intent: bestMatch,
                confidence: highestScore,
                timestamp: new Date()
            };
        }

        return {
            intent: 'unknown',
            confidence: 0,
            timestamp: new Date()
        };
    }

    /**
     * Calculate intent matching score
     */
    calculateIntentScore(message, examples) {
        let totalScore = 0;
        let matches = 0;

        examples.forEach(example => {
            if (message.includes(example.toLowerCase())) {
                matches++;
                // Higher score for exact matches
                if (message === example.toLowerCase()) {
                    totalScore += 1.0;
                } else {
                    totalScore += 0.7;
                }
            }
        });

        // Return average score
        return matches > 0 ? totalScore / examples.length : 0;
    }

    /**
     * Extract entities from message
     */
    async extractEntities(message) {
        const foundEntities = [];

        for (const [entityName, entity] of this.entities) {
            const matches = Array.from(message.matchAll(entity.pattern));
            
            matches.forEach(match => {
                foundEntities.push({
                    type: entityName,
                    value: match[1] || match[0],
                    start: match.index,
                    end: match.index + match[0].length,
                    confidence: 0.9
                });
            });
        }

        return foundEntities;
    }

    /**
     * Analyze sentiment of message
     */
    analyzeSentiment(message) {
        const lowerMessage = message.toLowerCase();
        let positiveScore = 0;
        let negativeScore = 0;

        // Check positive keywords
        const positiveWords = this.keywords.get('positive') || [];
        positiveWords.forEach(word => {
            if (lowerMessage.includes(word)) {
                positiveScore++;
            }
        });

        // Check negative keywords
        const negativeWords = this.keywords.get('negative') || [];
        negativeWords.forEach(word => {
            if (lowerMessage.includes(word)) {
                negativeScore++;
            }
        });

        // Calculate sentiment
        const totalWords = positiveScore + negativeScore;
        if (totalWords === 0) {
            return { sentiment: 'neutral', confidence: 0.5 };
        }

        const positiveRatio = positiveScore / totalWords;
        
        if (positiveRatio > 0.6) {
            return { sentiment: 'positive', confidence: positiveRatio };
        } else if (positiveRatio < 0.4) {
            return { sentiment: 'negative', confidence: 1 - positiveRatio };
        } else {
            return { sentiment: 'neutral', confidence: 0.5 };
        }
    }

    /**
     * Check for urgency indicators
     */
    checkUrgency(message) {
        const lowerMessage = message.toLowerCase();
        const urgentWords = this.keywords.get('urgent') || [];
        
        const urgentCount = urgentWords.reduce((count, word) => {
            return lowerMessage.includes(word) ? count + 1 : count;
        }, 0);

        return {
            isUrgent: urgentCount > 0,
            urgencyLevel: Math.min(urgentCount / urgentWords.length, 1),
            urgentKeywords: urgentWords.filter(word => lowerMessage.includes(word))
        };
    }

    /**
     * Extract questions from message
     */
    extractQuestions(message) {
        const questionWords = ['what', 'when', 'where', 'who', 'why', 'how', 'which', 'can', 'will', 'is', 'are', 'do', 'does'];
        const sentences = message.split(/[.!?]+/);
        const questions = [];

        sentences.forEach(sentence => {
            const trimmed = sentence.trim().toLowerCase();
            const startsWithQuestion = questionWords.some(word => trimmed.startsWith(word));
            const endsWithQuestion = sentence.trim().endsWith('?');
            
            if (startsWithQuestion || endsWithQuestion) {
                questions.push(sentence.trim());
            }
        });

        return questions;
    }

    /**
     * Update NLP configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Reload if custom intents provided
        if (newConfig.customIntents) {
            newConfig.customIntents.forEach(intent => {
                this.intents.set(intent.name, intent);
            });
        }

        // Reload if custom entities provided
        if (newConfig.customEntities) {
            newConfig.customEntities.forEach(entity => {
                this.entities.set(entity.name, entity);
            });
        }
    }

    /**
     * Get available intents
     */
    getIntents() {
        return Array.from(this.intents.keys());
    }

    /**
     * Get available entities
     */
    getEntities() {
        return Array.from(this.entities.keys());
    }

    /**
     * Process message with full NLP analysis
     */
    async processMessage(message) {
        const [intent, entities, sentiment, urgency, questions] = await Promise.all([
            this.analyzeIntent(message),
            this.extractEntities(message),
            this.analyzeSentiment(message),
            this.checkUrgency(message),
            this.extractQuestions(message)
        ]);

        return {
            message,
            intent,
            entities,
            sentiment,
            urgency,
            questions,
            timestamp: new Date(),
            wordCount: message.split(/\s+/).length
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BotNLP };
} else {
    window.BotNLP = BotNLP;
}
