/**
 * NodeConfigs - Configuration definitions for different node types
 */

export const NODE_CONFIGS = {
    // Interaction Nodes
    welcome: {
        name: 'Welcome Message',
        icon: '👋',
        iconClass: 'icon-interaction',
        category: 'interaction',
        description: 'Greet your visitors with a welcome message',
        config: {
            message: 'Hello! How can I help you today?',
            delay: 1000,
            typing: true
        },
        validation: {
            message: {
                required: true,
                minLength: 1,
                maxLength: 500
            },
            delay: {
                required: true,
                min: 0,
                max: 10000
            }
        },
        inputs: ['general'],
        outputs: ['general'],
        maxInputs: 1,
        maxOutputs: 1
    },

    message: {
        name: 'Bot Response',
        icon: '💬',
        iconClass: 'icon-interaction',
        category: 'interaction',
        description: 'Send a message to the user',
        config: {
            message: 'This is a bot response',
            delay: 1000,
            typing: true,
            attachments: []
        },
        validation: {
            message: {
                required: true,
                minLength: 1,
                maxLength: 1000
            }
        },
        inputs: ['general'],
        outputs: ['general'],
        maxInputs: 1,
        maxOutputs: 1
    },

    question: {
        name: 'User Input',
        icon: '❓',
        iconClass: 'icon-interaction',
        category: 'interaction',
        description: 'Collect user response',
        config: {
            question: 'What is your name?',
            inputType: 'text',
            variable: 'user_name',
            required: true,
            placeholder: 'Enter your response...',
            validation: ''
        },
        validation: {
            question: {
                required: true,
                minLength: 1,
                maxLength: 300
            },
            variable: {
                required: true,
                pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/
            }
        },
        inputs: ['general'],
        outputs: ['general'],
        maxInputs: 1,
        maxOutputs: 1
    },

    quickreply: {
        name: 'Quick Replies',
        icon: '⚡',
        iconClass: 'icon-interaction',
        category: 'interaction',
        description: 'Multiple choice buttons',
        config: {
            question: 'Choose an option:',
            options: [
                { text: 'Option 1', value: 'option1' },
                { text: 'Option 2', value: 'option2' },
                { text: 'Option 3', value: 'option3' }
            ],
            variable: 'user_choice',
            allowMultiple: false
        },
        validation: {
            question: {
                required: true,
                minLength: 1
            },
            options: {
                required: true,
                minItems: 1,
                maxItems: 10
            }
        },
        inputs: ['general'],
        outputs: ['general', 'option'],
        maxInputs: 1,
        maxOutputs: 10
    },

    // Logic Nodes
    condition: {
        name: 'Condition',
        icon: '🔀',
        iconClass: 'icon-logic',
        category: 'logic',
        description: 'Branch conversation flow based on conditions',
        config: {
            variable: 'user_input',
            operator: 'equals',
            value: 'yes',
            caseSensitive: false
        },
        validation: {
            variable: {
                required: true,
                pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/
            },
            value: {
                required: true
            }
        },
        inputs: ['general'],
        outputs: ['true', 'false'],
        maxInputs: 1,
        maxOutputs: 2
    },

    switch: {
        name: 'Switch',
        icon: '🎯',
        iconClass: 'icon-logic',
        category: 'logic',
        description: 'Route flow based on variable value',
        config: {
            variable: 'user_choice',
            cases: [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' }
            ],
            defaultCase: true
        },
        validation: {
            variable: {
                required: true,
                pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/
            }
        },
        inputs: ['general'],
        outputs: ['case', 'default'],
        maxInputs: 1,
        maxOutputs: 20
    },

    random: {
        name: 'Random Path',
        icon: '🎲',
        iconClass: 'icon-logic',
        category: 'logic',
        description: 'Randomly choose between paths',
        config: {
            paths: [
                { weight: 50, label: 'Path A' },
                { weight: 50, label: 'Path B' }
            ]
        },
        inputs: ['general'],
        outputs: ['path'],
        maxInputs: 1,
        maxOutputs: 10
    },

    // AI Nodes
    'ai-assist': {
        name: 'AI Assist',
        icon: '🤖',
        iconClass: 'icon-ai',
        category: 'ai',
        description: 'Smart AI responses using knowledge base',
        config: {
            knowledgeBase: 'default',
            confidence: 0.8,
            fallback: 'I need to connect you with a human agent.',
            context: '',
            temperature: 0.7
        },
        validation: {
            confidence: {
                required: true,
                min: 0,
                max: 1
            },
            fallback: {
                required: true,
                minLength: 1
            }
        },
        inputs: ['general'],
        outputs: ['success', 'fallback'],
        maxInputs: 1,
        maxOutputs: 2
    },

    'nlp-intent': {
        name: 'Intent Recognition',
        icon: '🧠',
        iconClass: 'icon-ai',
        category: 'ai',
        description: 'Detect user intent from message',
        config: {
            intents: [
                { name: 'greeting', examples: ['hello', 'hi', 'hey'] },
                { name: 'question', examples: ['what', 'how', 'when'] }
            ],
            confidence: 0.7,
            variable: 'detected_intent'
        },
        inputs: ['general'],
        outputs: ['intent', 'unknown'],
        maxInputs: 1,
        maxOutputs: 20
    },

    // Action Nodes
    webhook: {
        name: 'Webhook',
        icon: '🔗',
        iconClass: 'icon-action',
        category: 'action',
        description: 'Call external API',
        config: {
            url: 'https://api.example.com/webhook',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: '{}',
            timeout: 5000,
            variable: 'webhook_response'
        },
        validation: {
            url: {
                required: true,
                pattern: /^https?:\/\/.+/
            },
            timeout: {
                required: true,
                min: 1000,
                max: 30000
            }
        },
        inputs: ['general'],
        outputs: ['success', 'error'],
        maxInputs: 1,
        maxOutputs: 2
    },

    email: {
        name: 'Send Email',
        icon: '📧',
        iconClass: 'icon-action',
        category: 'action',
        description: 'Send email notification',
        config: {
            to: 'support@example.com',
            subject: 'New chatbot inquiry',
            template: 'default',
            variables: {}
        },
        validation: {
            to: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            },
            subject: {
                required: true,
                minLength: 1
            }
        },
        inputs: ['general'],
        outputs: ['success', 'error'],
        maxInputs: 1,
        maxOutputs: 2
    },

    handover: {
        name: 'Human Handover',
        icon: '👨‍💼',
        iconClass: 'icon-action',
        category: 'action',
        description: 'Transfer conversation to human agent',
        config: {
            department: 'support',
            message: 'Connecting you with an agent...',
            priority: 'normal',
            skills: []
        },
        validation: {
            department: {
                required: true
            },
            message: {
                required: true,
                minLength: 1
            }
        },
        inputs: ['general'],
        outputs: ['success', 'unavailable'],
        maxInputs: 1,
        maxOutputs: 2
    },

    // Data Nodes
    setvariable: {
        name: 'Set Variable',
        icon: '📝',
        iconClass: 'icon-data',
        category: 'data',
        description: 'Set or update a variable value',
        config: {
            variable: 'variable_name',
            value: 'variable_value',
            type: 'string'
        },
        validation: {
            variable: {
                required: true,
                pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/
            },
            value: {
                required: true
            }
        },
        inputs: ['general'],
        outputs: ['general'],
        maxInputs: 1,
        maxOutputs: 1
    },

    database: {
        name: 'Database Query',
        icon: '🗄️',
        iconClass: 'icon-data',
        category: 'data',
        description: 'Query database for information',
        config: {
            query: 'SELECT * FROM users WHERE id = {{user_id}}',
            connection: 'default',
            variable: 'query_result',
            timeout: 5000
        },
        validation: {
            query: {
                required: true,
                minLength: 1
            },
            connection: {
                required: true
            }
        },
        inputs: ['general'],
        outputs: ['success', 'error'],
        maxInputs: 1,
        maxOutputs: 2
    },

    segment: {
        name: 'User Segment',
        icon: '👥',
        iconClass: 'icon-data',
        category: 'data',
        description: 'Tag and categorize users',
        config: {
            segments: ['new_user', 'returning_user'],
            variable: 'user_segment',
            criteria: {}
        },
        inputs: ['general'],
        outputs: ['general'],
        maxInputs: 1,
        maxOutputs: 1
    },

    attribute: {
        name: 'User Attribute',
        icon: '🏷️',
        iconClass: 'icon-data',
        category: 'data',
        description: 'Collect and store user information',
        config: {
            attribute: 'email',
            value: '{{user_email}}',
            type: 'string',
            persistent: true
        },
        validation: {
            attribute: {
                required: true,
                pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/
            }
        },
        inputs: ['general'],
        outputs: ['general'],
        maxInputs: 1,
        maxOutputs: 1
    },

    // Utility Nodes
    delay: {
        name: 'Delay',
        icon: '⏱️',
        iconClass: 'icon-logic',
        category: 'utility',
        description: 'Add a delay before continuing',
        config: {
            duration: 2000,
            showTyping: true
        },
        validation: {
            duration: {
                required: true,
                min: 100,
                max: 30000
            }
        },
        inputs: ['general'],
        outputs: ['general'],
        maxInputs: 1,
        maxOutputs: 1
    },

    log: {
        name: 'Log Event',
        icon: '📋',
        iconClass: 'icon-data',
        category: 'utility',
        description: 'Log events for analytics',
        config: {
            event: 'custom_event',
            properties: {},
            level: 'info'
        },
        validation: {
            event: {
                required: true,
                pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/
            }
        },
        inputs: ['general'],
        outputs: ['general'],
        maxInputs: 1,
        maxOutputs: 1
    }
};

export const NODE_CATEGORIES = {
    interaction: {
        name: 'Interaction',
        icon: 'fas fa-comments',
        description: 'User interaction components'
    },
    logic: {
        name: 'Logic & Flow',
        icon: 'fas fa-code-branch',
        description: 'Flow control and logic'
    },
    ai: {
        name: 'AI & NLP',
        icon: 'fas fa-robot',
        description: 'AI and natural language processing'
    },
    action: {
        name: 'Actions',
        icon: 'fas fa-bolt',
        description: 'External actions and integrations'
    },
    data: {
        name: 'Data & Variables',
        icon: 'fas fa-database',
        description: 'Data storage and manipulation'
    },
    utility: {
        name: 'Utilities',
        icon: 'fas fa-tools',
        description: 'Utility and helper components'
    }
};

/**
 * Get configuration for a node type
 * @param {string} type - Node type
 * @returns {object} Node configuration
 */
export function getNodeConfig(type) {
    return NODE_CONFIGS[type] || NODE_CONFIGS.message;
}

/**
 * Get all node types for a category
 * @param {string} category - Category name
 * @returns {string[]} Array of node types
 */
export function getNodeTypesByCategory(category) {
    return Object.keys(NODE_CONFIGS).filter(
        type => NODE_CONFIGS[type].category === category
    );
}

/**
 * Get all available categories
 * @returns {string[]} Array of category names
 */
export function getCategories() {
    return Object.keys(NODE_CATEGORIES);
}

/**
 * Search nodes by name or description
 * @param {string} query - Search query
 * @returns {string[]} Array of matching node types
 */
export function searchNodes(query) {
    const lowerQuery = query.toLowerCase();
    return Object.keys(NODE_CONFIGS).filter(type => {
        const config = NODE_CONFIGS[type];
        return config.name.toLowerCase().includes(lowerQuery) ||
               config.description.toLowerCase().includes(lowerQuery) ||
               type.toLowerCase().includes(lowerQuery);
    });
}

/**
 * Validate node configuration
 * @param {string} type - Node type
 * @param {object} config - Configuration to validate
 * @returns {object} Validation result
 */
export function validateNodeConfig(type, config) {
    const nodeConfig = getNodeConfig(type);
    const errors = [];
    const warnings = [];

    if (nodeConfig.validation) {
        for (const [key, rules] of Object.entries(nodeConfig.validation)) {
            const value = config[key];

            if (rules.required && (!value || value.toString().trim() === '')) {
                errors.push(`${key} is required`);
                continue;
            }

            if (value !== undefined && value !== null) {
                if (rules.minLength && value.toString().length < rules.minLength) {
                    errors.push(`${key} must be at least ${rules.minLength} characters`);
                }

                if (rules.maxLength && value.toString().length > rules.maxLength) {
                    warnings.push(`${key} is longer than recommended ${rules.maxLength} characters`);
                }

                if (rules.pattern && !rules.pattern.test(value.toString())) {
                    errors.push(`${key} format is invalid`);
                }

                if (rules.min && parseFloat(value) < rules.min) {
                    errors.push(`${key} must be at least ${rules.min}`);
                }

                if (rules.max && parseFloat(value) > rules.max) {
                    errors.push(`${key} cannot exceed ${rules.max}`);
                }

                if (rules.minItems && Array.isArray(value) && value.length < rules.minItems) {
                    errors.push(`${key} must have at least ${rules.minItems} items`);
                }

                if (rules.maxItems && Array.isArray(value) && value.length > rules.maxItems) {
                    warnings.push(`${key} has more than recommended ${rules.maxItems} items`);
                }
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}
