/**
 * Smart BotFlo Co-pilot Chatbot
 * Intelligent assistant that knows the entire platform and guides users
 */

class SmartBotFloCopilot {
    constructor() {
        this.currentPage = window.location.pathname;
        this.userContext = this.detectUserContext();
        this.conversationHistory = [];
        this.initializeKnowledgeBase();
        this.setupEventListeners();
    }

    initializeKnowledgeBase() {
        this.knowledge = {
            pages: {
                '/': {
                    name: 'Homepage & Marketplace',
                    purpose: 'Main landing page showcasing BotFlo capabilities and pre-built chatbot marketplace',
                    features: ['marketplace', 'hero-cta', 'feature-showcase'],
                    helpTopics: ['getting-started', 'choosing-bot-type', 'marketplace-navigation']
                },
                '/builders': {
                    name: 'Advanced Flow Builder',
                    purpose: 'Professional visual chatbot builder with drag-and-drop interface',
                    features: ['visual-editor', 'component-library', 'properties-panel', 'workspace'],
                    helpTopics: ['flow-building', 'component-usage', 'node-configuration', 'testing-flows']
                },
                '/marketplace': {
                    name: 'Bot Marketplace',
                    purpose: 'Gallery of pre-built chatbot templates for different industries',
                    features: ['template-gallery', 'filtering', 'preview', 'customization'],
                    helpTopics: ['template-selection', 'customization-options', 'deployment']
                },
                '/templates': {
                    name: 'Template Library',
                    purpose: 'Comprehensive collection of chatbot templates and components',
                    features: ['template-categories', 'search', 'preview', 'customization'],
                    helpTopics: ['template-usage', 'modification', 'best-practices']
                }
            },
            
            features: {
                'flow-builder': {
                    description: 'Visual node-based editor for creating chatbot conversation flows',
                    howToUse: 'Drag components from the library, connect them, and configure properties',
                    commonIssues: ['connection-problems', 'node-configuration', 'testing-flows']
                },
                'component-library': {
                    description: 'Collection of pre-built conversation components',
                    howToUse: 'Browse categories, drag components to workspace, configure in properties panel',
                    categories: ['interaction', 'logic', 'ai', 'action', 'data']
                },
                'properties-panel': {
                    description: 'Configuration panel for customizing component settings',
                    howToUse: 'Select a component to see its properties, modify settings as needed',
                    tips: ['save-changes', 'test-configurations', 'use-validation']
                }
            },

            tutorials: {
                'getting-started': {
                    title: 'Getting Started with BotFlo',
                    steps: [
                        'Visit the homepage to understand BotFlo capabilities',
                        'Click "Advanced Flow Builder" to access the main building tool',
                        'Explore the component library on the left',
                        'Drag your first component to the workspace',
                        'Configure it using the properties panel on the right',
                        'Test your chatbot using the preview feature'
                    ]
                },
                'first-chatbot': {
                    title: 'Building Your First Chatbot',
                    steps: [
                        'Start with a Welcome Message component',
                        'Add a Bot Response for the greeting',
                        'Connect them using the node connectors',
                        'Add conditional logic for user responses',
                        'Test the flow in the preview panel',
                        'Save and deploy your chatbot'
                    ]
                },
                'advanced-flows': {
                    title: 'Creating Advanced Conversation Flows',
                    steps: [
                        'Plan your conversation tree structure',
                        'Use Condition nodes for branching logic',
                        'Implement API calls for external data',
                        'Add variable storage for user context',
                        'Create loops for multi-step processes',
                        'Test thoroughly with different scenarios'
                    ]
                }
            },

            commonQuestions: {
                'how-to-build': {
                    question: 'How do I build a chatbot?',
                    answer: 'Click "Advanced Flow Builder" from the homepage, then drag components from the library to create your conversation flow.',
                    actions: ['open-builder', 'show-tutorial']
                },
                'component-usage': {
                    question: 'How do I use components?',
                    answer: 'Browse the component library on the left, drag components to the workspace, then configure them using the properties panel.',
                    actions: ['highlight-library', 'show-workspace']
                },
                'save-work': {
                    question: 'How do I save my work?',
                    answer: 'Your work is automatically saved as you build. You can also manually save using Ctrl+S or the save button.',
                    actions: ['show-save-options']
                },
                'export-bot': {
                    question: 'How do I export my chatbot?',
                    answer: 'Use the export function in the builder to download your chatbot code or deploy it to our hosting platform.',
                    actions: ['show-export-options']
                }
            }
        };
    }

    detectUserContext() {
        const path = window.location.pathname;
        const userAgent = navigator.userAgent;
        const isFirstVisit = !localStorage.getItem('botflo_visited');
        const timeOnPage = Date.now();
        
        return {
            currentPage: path,
            isFirstVisit,
            userAgent,
            timeOnPage,
            previousActions: this.getPreviousActions()
        };
    }

    getPreviousActions() {
        try {
            return JSON.parse(localStorage.getItem('botflo_user_actions') || '[]');
        } catch {
            return [];
        }
    }

    analyzeUserIntent(message) {
        const lowerMessage = message.toLowerCase();
        
        // Intent patterns
        const intents = {
            'getting-started': /how to start|getting started|begin|new user|first time/,
            'build-chatbot': /build|create|make|how to build|chatbot creation/,
            'use-components': /component|drag|drop|library|how to use/,
            'save-work': /save|export|download|deploy/,
            'navigation': /where|find|locate|go to|page/,
            'troubleshooting': /error|problem|issue|not working|help|broken/,
            'features': /what is|what does|feature|capability|can do/,
            'tutorial': /tutorial|guide|walkthrough|show me|learn/
        };

        for (const [intent, pattern] of Object.entries(intents)) {
            if (pattern.test(lowerMessage)) {
                return intent;
            }
        }

        return 'general';
    }

    generateSmartResponse(userMessage) {
        const intent = this.analyzeUserIntent(userMessage);
        const currentPageInfo = this.knowledge.pages[this.currentPage];
        const context = this.userContext;

        let response = {
            text: '',
            actions: [],
            quickReplies: []
        };

        switch (intent) {
            case 'getting-started':
                response = this.getGettingStartedResponse(context);
                break;
            case 'build-chatbot':
                response = this.getBuildChatbotResponse(context);
                break;
            case 'use-components':
                response = this.getComponentUsageResponse(context);
                break;
            case 'navigation':
                response = this.getNavigationResponse(userMessage, context);
                break;
            case 'features':
                response = this.getFeaturesResponse(userMessage, context);
                break;
            case 'tutorial':
                response = this.getTutorialResponse(context);
                break;
            default:
                response = this.getContextualResponse(userMessage, context);
        }

        // Add page-specific context
        if (currentPageInfo) {
            response.pageContext = `You're currently on the ${currentPageInfo.name}. `;
        }

        return response;
    }

    getGettingStartedResponse(context) {
        if (context.isFirstVisit) {
            return {
                text: `Welcome to BotFlo! 🎉 I'm your AI assistant. I can see this is your first visit. Let me give you a quick overview:

📍 You're on our homepage which showcases our platform capabilities
🎨 Click "Advanced Flow Builder" to start building chatbots visually
🛍️ Browse the marketplace for pre-built templates
📚 I can guide you through any feature - just ask!

Would you like me to show you around or help you build your first chatbot?`,
                actions: ['highlight-cta', 'show-features'],
                quickReplies: ['Show me the builder', 'Tour the platform', 'Browse templates', 'Build first chatbot']
            };
        } else {
            return {
                text: `Welcome back! 👋 How can I help you today? I can assist with:

🎨 Building chatbots with the flow builder
🔧 Using specific components or features
🛍️ Finding the right template
📖 Learning advanced techniques

What would you like to work on?`,
                quickReplies: ['Open flow builder', 'Component help', 'Find templates', 'Advanced tips']
            };
        }
    }

    getBuildChatbotResponse(context) {
        const currentPage = context.currentPage;
        
        if (currentPage === '/builders') {
            return {
                text: `Perfect! You're already in the Advanced Flow Builder. Here's how to get started:

1️⃣ **Component Library** (left panel): Drag components like "Welcome Message" or "Bot Response"
2️⃣ **Workspace** (center): Drop components here and connect them
3️⃣ **Properties Panel** (right): Configure each component's settings

Try dragging a "Welcome Message" component to the workspace to start!`,
                actions: ['highlight-component-library', 'highlight-workspace'],
                quickReplies: ['Show component library', 'Explain connections', 'Help with properties', 'Start tutorial']
            };
        } else {
            return {
                text: `To build a chatbot, you'll need to use our Advanced Flow Builder. Let me take you there!

The Flow Builder features:
🎨 Visual drag-and-drop interface
🧩 Component library with pre-built elements
⚙️ Properties panel for customization
🔗 Node connections for conversation flow

Ready to start building?`,
                actions: ['navigate-to-builder'],
                quickReplies: ['Yes, open builder', 'Tell me more first', 'Show example', 'Browse templates instead']
            };
        }
    }

    getComponentUsageResponse(context) {
        return {
            text: `Great question! Here's how to use components effectively:

**Component Library** (left panel):
📂 **Categories**: Interaction, Logic, AI, Actions, Data
🎯 **Usage**: Drag any component to the workspace
🔍 **Search**: Find specific components quickly

**Common Components**:
💬 **Welcome Message**: Start conversations
🤖 **Bot Response**: Reply to users  
❓ **Condition**: Branch conversations
🔗 **API Call**: Connect external services

**Tips**:
- Start with Welcome Message + Bot Response
- Connect components using the connection points
- Configure each component in the properties panel

Need help with a specific component type?`,
            quickReplies: ['Interaction components', 'Logic components', 'AI components', 'Connection help']
        };
    }

    getNavigationResponse(message, context) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('builder') || lowerMessage.includes('build')) {
            return {
                text: `The **Advanced Flow Builder** is our main chatbot creation tool. You can access it by:

🎨 Clicking "Advanced Flow Builder" on the homepage
🔗 Going directly to /builders
📱 Using the navigation menu

This is where you'll design your chatbot using visual components!`,
                actions: ['navigate-to-builder'],
                quickReplies: ['Open builder now', 'What can I build?', 'Show me features']
            };
        }
        
        if (lowerMessage.includes('marketplace') || lowerMessage.includes('template')) {
            return {
                text: `The **Marketplace** contains pre-built chatbot templates:

🛍️ Restaurant bots, support bots, booking systems
🎯 Industry-specific solutions
⚡ Quick deployment options
🔧 Customizable templates

Perfect if you want to start with a proven solution!`,
                actions: ['navigate-to-marketplace'],
                quickReplies: ['Browse marketplace', 'See templates', 'Custom vs template?']
            };
        }

        return {
            text: `Here are the main sections of BotFlo:

🏠 **Homepage**: Overview and marketplace
🎨 **Flow Builder** (/builders): Main building tool
🛍️ **Marketplace**: Pre-built templates  
📚 **Templates**: Template library
✨ **Features**: Platform capabilities

Where would you like to go?`,
            quickReplies: ['Flow builder', 'Marketplace', 'Templates', 'Features']
        };
    }

    getFeaturesResponse(message, context) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('flow') || lowerMessage.includes('visual')) {
            return {
                text: `The **Visual Flow Builder** is our flagship feature:

🎨 **Drag & Drop**: Intuitive component placement
🔗 **Node Connections**: Visual conversation mapping
⚙️ **Properties Panel**: Detailed component configuration
🧩 **Component Library**: 50+ pre-built elements
🔄 **Real-time Testing**: Test as you build
💾 **Auto-save**: Never lose your work

It's like visual programming for chatbots!`,
                quickReplies: ['Try flow builder', 'See components', 'Watch demo']
            };
        }

        return {
            text: `BotFlo's key features include:

🎨 **Visual Flow Builder**: Drag-and-drop chatbot creation
🧩 **Component Library**: Pre-built conversation elements
🛍️ **Marketplace**: Ready-to-use templates
🤖 **AI Integration**: Smart, natural conversations
📱 **Multi-platform**: Works everywhere
⚡ **No-code**: Build without programming

Which feature interests you most?`,
            quickReplies: ['Visual builder', 'Components', 'AI features', 'Templates']
        };
    }

    getTutorialResponse(context) {
        return {
            text: `I'd love to guide you through BotFlo! Choose your learning path:

👶 **Beginner**: New to chatbots? Start here
🎨 **Builder Tutorial**: Learn the flow builder
🧩 **Component Guide**: Master components
🚀 **Advanced**: Complex flows and integrations

I can also give you a **live guided tour** of any feature!

What would you like to learn?`,
            quickReplies: ['Beginner tutorial', 'Builder guide', 'Component tutorial', 'Live tour']
        };
    }

    getContextualResponse(message, context) {
        const currentPageInfo = this.knowledge.pages[context.currentPage];
        
        if (currentPageInfo) {
            return {
                text: `I'm here to help! You're currently on the **${currentPageInfo.name}**.

${currentPageInfo.purpose}

I can help you with:
${currentPageInfo.helpTopics.map(topic => `• ${topic.replace('-', ' ')}`).join('\n')}

What specific question do you have?`,
                quickReplies: ['Page features', 'How to use this', 'Go somewhere else', 'General help']
            };
        }

        return {
            text: `I'm your BotFlo assistant! I can help you with:

🎨 **Building chatbots** with our visual flow builder
🧩 **Using components** and features
🛍️ **Finding templates** in our marketplace
📖 **Learning** platform capabilities
🔧 **Troubleshooting** any issues

What would you like help with?`,
            quickReplies: ['Build chatbot', 'Learn features', 'Browse templates', 'Get support']
        };
    }

    // Action handlers
    executeAction(action) {
        switch (action) {
            case 'navigate-to-builder':
                if (window.location.pathname !== '/builders') {
                    window.location.href = '/builders';
                }
                break;
            case 'navigate-to-marketplace':
                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                    setTimeout(() => {
                        document.querySelector('#bots')?.scrollIntoView({ behavior: 'smooth' });
                    }, 500);
                }
                break;
            case 'highlight-component-library':
                this.highlightElement('#component-library', 'This is the component library - drag components from here!');
                break;
            case 'highlight-workspace':
                this.highlightElement('#main-workspace', 'This is your workspace - drop components here to build flows!');
                break;
            case 'highlight-cta':
                this.highlightElement('a[href="/builders"]', 'Click here to start building!');
                break;
        }
    }

    highlightElement(selector, message) {
        const element = document.querySelector(selector);
        if (element) {
            element.style.outline = '3px solid #667eea';
            element.style.outlineOffset = '2px';
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Show tooltip
            this.showTooltip(element, message);
            
            // Remove highlight after 5 seconds
            setTimeout(() => {
                element.style.outline = '';
                element.style.outlineOffset = '';
                this.hideTooltip();
            }, 5000);
        }
    }

    showTooltip(element, message) {
        const tooltip = document.createElement('div');
        tooltip.id = 'botflo-tooltip';
        tooltip.innerHTML = message;
        tooltip.style.cssText = `
            position: absolute;
            background: #667eea;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            max-width: 250px;
        `;
        
        const rect = element.getBoundingClientRect();
        tooltip.style.top = (rect.top - 40) + 'px';
        tooltip.style.left = rect.left + 'px';
        
        document.body.appendChild(tooltip);
    }

    hideTooltip() {
        const tooltip = document.getElementById('botflo-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    setupEventListeners() {
        // Track user actions for better context
        window.addEventListener('beforeunload', () => {
            this.saveUserSession();
        });

        // Update context when page changes
        window.addEventListener('popstate', () => {
            this.currentPage = window.location.pathname;
            this.userContext = this.detectUserContext();
        });
    }

    saveUserSession() {
        const actions = this.getPreviousActions();
        actions.push({
            page: this.currentPage,
            timestamp: Date.now(),
            conversations: this.conversationHistory.length
        });
        
        localStorage.setItem('botflo_user_actions', JSON.stringify(actions.slice(-10))); // Keep last 10
        localStorage.setItem('botflo_visited', 'true');
    }

    // Add methods for UI integration
    getContextualWelcome() {
        const context = this.userContext;
        const currentPageInfo = this.knowledge.pages[context.currentPage];
        
        if (context.isFirstVisit) {
            return {
                message: `👋 Welcome to BotFlo! I'm your AI co-pilot. I can see this is your first visit. I'm here to help you navigate and build amazing chatbots. What would you like to explore first?`,
                actions: [
                    { label: 'Start Building', action: 'open-builder' },
                    { label: 'Take Tour', action: 'start-tour' },
                    { label: 'Browse Templates', action: 'open-marketplace' }
                ]
            };
        } else if (currentPageInfo) {
            return {
                message: `Welcome back! 🚀 You're on the ${currentPageInfo.name}. How can I help you today?`,
                actions: [
                    { label: 'Need Help Here', action: 'contextual-help' },
                    { label: 'Open Builder', action: 'open-builder' },
                    { label: 'Quick Tips', action: 'show-tips' }
                ]
            };
        } else {
            return {
                message: `Hi! I'm your BotFlo co-pilot. I can help you navigate the platform, build chatbots, and answer any questions you have. What can I do for you?`,
                actions: [
                    { label: 'Get Started', action: 'getting-started' },
                    { label: 'Open Builder', action: 'open-builder' },
                    { label: 'Show Features', action: 'show-features' }
                ]
            };
        }
    }

    getContextualHelp() {
        const currentPageInfo = this.knowledge.pages[this.currentPage];
        
        if (currentPageInfo) {
            const helpTopics = currentPageInfo.helpTopics.map(topic => ({
                label: topic.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                action: `help-${topic}`
            }));

            return {
                message: `I can help you with ${currentPageInfo.name}:\n\n${currentPageInfo.purpose}\n\nWhat specific area would you like help with?`,
                actions: helpTopics.slice(0, 3) // Limit to 3 actions
            };
        }

        return {
            message: `I can help you with:\n• Building chatbots with our flow builder\n• Using components and templates\n• Navigating the platform\n• Understanding features\n\nWhat would you like to know?`,
            actions: [
                { label: 'Flow Builder Help', action: 'help-flow-building' },
                { label: 'Component Guide', action: 'help-component-usage' },
                { label: 'Platform Tour', action: 'start-tour' }
            ]
        };
    }

    processMessage(userMessage) {
        // Store conversation
        this.conversationHistory.push({
            message: userMessage,
            timestamp: Date.now(),
            page: this.currentPage
        });

        const response = this.generateSmartResponse(userMessage);
        
        // Convert response to UI format
        return {
            message: response.text || response.pageContext + response.text || 'I understand you need help. Let me assist you with that!',
            actions: this.convertToUIActions(response.actions || [], response.quickReplies || [])
        };
    }

    convertToUIActions(actions, quickReplies) {
        const uiActions = [];

        // Convert actions to UI format
        actions.forEach(action => {
            switch (action) {
                case 'navigate-to-builder':
                    uiActions.push({ label: 'Open Builder', action: 'open-builder' });
                    break;
                case 'navigate-to-marketplace':
                    uiActions.push({ label: 'View Marketplace', action: 'open-marketplace' });
                    break;
                case 'highlight-component-library':
                    uiActions.push({ label: 'Show Component Library', action: 'highlight-library' });
                    break;
                case 'highlight-workspace':
                    uiActions.push({ label: 'Show Workspace', action: 'show-workspace' });
                    break;
                case 'start-tour':
                    uiActions.push({ label: 'Start Tour', action: 'start-tour' });
                    break;
            }
        });

        // Convert quick replies to actions
        quickReplies.slice(0, 3).forEach(reply => {
            uiActions.push({ 
                label: reply, 
                action: `quick-${reply.toLowerCase().replace(/\s+/g, '-')}`
            });
        });

        return uiActions.slice(0, 3); // Limit to 3 actions for UI
    }

    startInteractiveTour() {
        const currentPage = this.currentPage;
        
        if (currentPage === '/builders') {
            this.tourFlowBuilder();
        } else {
            // Navigate to builder and start tour
            setTimeout(() => {
                window.location.href = '/builders';
            }, 1000);
        }
    }

    tourFlowBuilder() {
        const steps = [
            {
                element: '.component-library',
                message: 'This is the Component Library. Drag components from here to build your chatbot flow.',
                position: 'right'
            },
            {
                element: '.flow-workspace',
                message: 'This is your Workspace. Drop components here and connect them to create conversation flows.',
                position: 'left'
            },
            {
                element: '.properties-panel',
                message: 'The Properties Panel lets you configure each component\'s settings and behavior.',
                position: 'left'
            }
        ];

        this.runTourSteps(steps, 0);
    }

    runTourSteps(steps, currentStep) {
        if (currentStep >= steps.length) {
            this.hideTooltip();
            return;
        }

        const step = steps[currentStep];
        const element = document.querySelector(step.element);
        
        if (element) {
            this.highlightElement(step.element, step.message);
            
            // Auto-advance after 4 seconds
            setTimeout(() => {
                this.runTourSteps(steps, currentStep + 1);
            }, 4000);
        } else {
            // Skip if element not found
            this.runTourSteps(steps, currentStep + 1);
        }
    }
}

// Initialize the smart copilot
window.SmartBotFloCopilot = SmartBotFloCopilot;
