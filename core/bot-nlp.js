/**
 * Bot NLP - Advanced Natural Language Processing for intelligent bots
 */

class BotNLP {
    constructor(config = {}) {
        this.config = config;
        this.intents = new Map();
        this.entities = new Map();
        this.keywords = new Map();
        this.context = new Map();
        this.scrapedContent = config.scrapedContent || {};
        this.businessInfo = config.businessInfo || {};
        this.conversationHistory = [];
        this.sentimentAnalyzer = new SentimentAnalyzer();
        
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

    /**
     * Process user input with advanced context understanding
     */
    async processInput(userInput, sessionId = 'default') {
        const cleanInput = this.preprocessText(userInput);
        const sentiment = this.sentimentAnalyzer.analyze(cleanInput);
        const intent = this.detectIntent(cleanInput);
        const entities = this.extractEntities(cleanInput);
        const context = this.getContext(sessionId);
        
        // Update conversation history
        this.addToHistory(sessionId, userInput, 'user');
        
        // Generate intelligent response based on scraped content and context
        const response = await this.generateResponse(intent, entities, context, sentiment);
        
        this.addToHistory(sessionId, response, 'bot');
        this.updateContext(sessionId, intent, entities);
        
        return {
            intent: intent.name,
            confidence: intent.confidence,
            entities,
            sentiment,
            response,
            suggestions: this.generateSuggestions(intent, context)
        };
    }

    /**
     * Generate intelligent response using scraped content
     */
    async generateResponse(intent, entities, context, sentiment) {
        // Check if we have specific content about the query
        const relevantContent = this.findRelevantContent(intent.query);
        
        if (relevantContent.length > 0) {
            return this.createContentBasedResponse(relevantContent, intent, sentiment);
        }
        
        // Fall back to intent-based responses
        return this.createIntentBasedResponse(intent, entities, context, sentiment);
    }

    /**
     * Find relevant content from scraped website data
     */
    findRelevantContent(query) {
        const queryWords = this.tokenize(query.toLowerCase());
        const relevantContent = [];
        
        // Search through scraped pages
        if (this.scrapedContent.pages) {
            this.scrapedContent.pages.forEach(page => {
                const pageText = (page.title + ' ' + page.content).toLowerCase();
                const score = this.calculateRelevanceScore(queryWords, pageText);
                
                if (score > 0.3) {
                    relevantContent.push({
                        ...page,
                        relevanceScore: score
                    });
                }
            });
        }
        
        // Sort by relevance
        return relevantContent.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    /**
     * Calculate relevance score between query and content
     */
    calculateRelevanceScore(queryWords, content) {
        const contentWords = this.tokenize(content);
        const commonWords = queryWords.filter(word => 
            contentWords.includes(word) && word.length > 2
        );
        
        const exactMatches = commonWords.length;
        const semanticMatches = this.findSemanticMatches(queryWords, contentWords);
        
        return (exactMatches * 2 + semanticMatches) / (queryWords.length + contentWords.length / 10);
    }

    /**
     * Find semantic matches using keyword similarity
     */
    findSemanticMatches(queryWords, contentWords) {
        const semanticGroups = {
            price: ['cost', 'pricing', 'fee', 'charge', 'rate', 'expense'],
            contact: ['phone', 'email', 'address', 'location', 'reach', 'call'],
            product: ['service', 'offering', 'solution', 'item', 'good'],
            time: ['hours', 'schedule', 'availability', 'open', 'closed'],
            help: ['support', 'assistance', 'aid', 'guidance', 'advice']
        };
        
        let matches = 0;
        queryWords.forEach(qWord => {
            Object.values(semanticGroups).forEach(group => {
                if (group.includes(qWord)) {
                    contentWords.forEach(cWord => {
                        if (group.includes(cWord)) matches++;
                    });
                }
            });
        });
        
        return matches;
    }

    /**
     * Create response based on relevant content
     */
    createContentBasedResponse(relevantContent, intent, sentiment) {
        const topContent = relevantContent[0];
        
        // Customize response based on sentiment
        let prefix = '';
        if (sentiment.score < -0.3) {
            prefix = "I understand your concern. ";
        } else if (sentiment.score > 0.3) {
            prefix = "Great question! ";
        }
        
        // Extract key information from content
        const keyInfo = this.extractKeyInformation(topContent.content);
        
        let response = prefix;
        
        if (keyInfo.length > 0) {
            response += `Based on our ${topContent.title.toLowerCase()}, ${keyInfo}`;
        } else {
            response += `According to our ${topContent.title.toLowerCase()}: ${topContent.content.substring(0, 150)}...`;
        }
        
        // Add business contact info if relevant
        if (intent.name === 'contact' && this.businessInfo.contactEmail) {
            response += ` You can reach us at ${this.businessInfo.contactEmail}`;
            if (this.businessInfo.contactPhone) {
                response += ` or call ${this.businessInfo.contactPhone}`;
            }
        }
        
        return response;
    }

    /**
     * Extract key information from content
     */
    extractKeyInformation(content) {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
        
        // Look for sentences with key indicators
        const keyIndicators = ['we offer', 'our services', 'we provide', 'available', 'includes', 'features'];
        
        for (let sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if (keyIndicators.some(indicator => lowerSentence.includes(indicator))) {
                return sentence.trim();
            }
        }
        
        // Return first substantial sentence
        return sentences[0]?.trim() || '';
    }

    /**
     * Update conversation context
     */
    updateContext(sessionId, intent, entities) {
        if (!this.context.has(sessionId)) {
            this.context.set(sessionId, {
                lastIntent: null,
                entities: new Map(),
                topics: [],
                timestamp: Date.now()
            });
        }
        
        const context = this.context.get(sessionId);
        context.lastIntent = intent.name;
        context.timestamp = Date.now();
        
        // Store entities
        entities.forEach(entity => {
            context.entities.set(entity.type, entity.value);
        });
        
        // Track conversation topics
        if (!context.topics.includes(intent.name)) {
            context.topics.push(intent.name);
        }
    }

    /**
     * Generate helpful suggestions based on context
     */
    generateSuggestions(intent, context) {
        const suggestions = [];
        
        // Context-based suggestions
        if (intent.name === 'greeting') {
            suggestions.push(
                "What services do you offer?",
                "How can I contact you?",
                "What are your business hours?"
            );
        } else if (intent.name === 'pricing') {
            suggestions.push(
                "Do you offer discounts?",
                "What payment methods do you accept?",
                "Can I get a custom quote?"
            );
        } else if (intent.name === 'information') {
            suggestions.push(
                "Tell me more about your experience",
                "What makes you different?",
                "Can you show me examples?"
            );
        }
        
        // Add business-specific suggestions based on scraped content
        if (this.scrapedContent.pages) {
            const pageTypes = this.scrapedContent.pages.map(p => p.title.toLowerCase());
            
            if (pageTypes.includes('services') || pageTypes.includes('products')) {
                suggestions.push("What services do you provide?");
            }
            if (pageTypes.includes('about')) {
                suggestions.push("Tell me about your company");
            }
            if (pageTypes.includes('portfolio') || pageTypes.includes('gallery')) {
                suggestions.push("Can I see your work?");
            }
        }
        
        return suggestions.slice(0, 3); // Limit to 3 suggestions
    }

    /**
     * Add message to conversation history
     */
    addToHistory(sessionId, message, sender) {
        if (!this.conversationHistory[sessionId]) {
            this.conversationHistory[sessionId] = [];
        }
        
        this.conversationHistory[sessionId].push({
            message,
            sender,
            timestamp: Date.now()
        });
        
        // Keep only last 20 messages per session
        if (this.conversationHistory[sessionId].length > 20) {
            this.conversationHistory[sessionId] = this.conversationHistory[sessionId].slice(-20);
        }
    }

    /**
     * Get conversation context
     */
    getContext(sessionId) {
        return this.context.get(sessionId) || {
            lastIntent: null,
            entities: new Map(),
            topics: [],
            timestamp: Date.now()
        };
    }

    /**
     * Preprocess text for analysis
     */
    preprocessText(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Tokenize text into words
     */
    tokenize(text) {
        return text.split(/\s+/).filter(word => word.length > 0);
    }

    /**
     * Simple Sentiment Analyzer
     */
    class SentimentAnalyzer {
        constructor() {
            this.positiveWords = [
                'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like',
                'awesome', 'perfect', 'outstanding', 'brilliant', 'superb', 'impressive', 'satisfied',
                'happy', 'pleased', 'delighted', 'thrilled', 'excited', 'thank', 'thanks', 'grateful'
            ];
            
            this.negativeWords = [
                'bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'problem', 'issue',
                'wrong', 'error', 'broken', 'failed', 'disappointed', 'frustrated', 'angry',
                'upset', 'confused', 'difficult', 'hard', 'impossible', 'worst', 'useless'
            ];
        }
        
        analyze(text) {
            const words = text.toLowerCase().split(/\s+/);
            let score = 0;
            let positiveCount = 0;
            let negativeCount = 0;
            
            words.forEach(word => {
                if (this.positiveWords.includes(word)) {
                    score += 1;
                    positiveCount++;
                } else if (this.negativeWords.includes(word)) {
                    score -= 1;
                    negativeCount++;
                }
            });
            
            // Normalize score
            const totalSentimentWords = positiveCount + negativeCount;
            const normalizedScore = totalSentimentWords > 0 ? score / totalSentimentWords : 0;
            
            return {
                score: normalizedScore,
                magnitude: totalSentimentWords,
                label: this.getLabel(normalizedScore)
            };
        }
        
        getLabel(score) {
            if (score > 0.3) return 'positive';
            if (score < -0.3) return 'negative';
            return 'neutral';
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BotNLP };
} else {
    window.BotNLP = BotNLP;
}
