// BotFlo Copilot - Advanced AI Assistant for BotFlo.ai Builder
// Helps users learn, build, and troubleshoot their chatbots

class BotFloCopilot {
    constructor() {
        this.isVisible = false;
        this.messages = [];
        this.currentContext = 'general';
        this.userProgress = this.loadProgress();
        this.init();
    }

    init() {
        this.createCopilotUI();
        this.bindEvents();
        this.detectPageContext();
        this.showWelcomeMessage();
        
        // Set up periodic cleanup of conflicting widgets
        setInterval(() => {
            this.removeConflictingWidgets();
        }, 3000);
   }

    createCopilotUI() {
        // Remove any existing copilot instances
        const existingCopilot = document.getElementById('botflo-copilot');
        if (existingCopilot) {
            existingCopilot.remove();
        }
        
        // Remove any conflicting chat widgets
        const conflictingWidgets = document.querySelectorAll('#smart-copilot-widget, #smart-copilot-trigger, .chatflow-copilot, #chatflow-copilot');
        conflictingWidgets.forEach(widget => widget.remove());
        
        const copilotHTML = `
            <div id="botflo-copilot" class="botflo-copilot">
                <div class="copilot-toggle" id="copilot-toggle">
                    <div class="copilot-avatar">
                        <i class="fas fa-robot"></i>
                        <div class="copilot-pulse"></div>
                    </div>
                    <span class="copilot-label">BotFlo Assistant</span>
                </div>
                
                <div class="copilot-window" id="copilot-window">
                    <div class="copilot-header">
                        <div class="copilot-info">
                            <div class="copilot-avatar-small">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div>
                                <h4>BotFlo Copilot</h4>
                                <span class="copilot-status">Ready to help you build</span>
                            </div>
                        </div>
                        <button class="copilot-close" id="copilot-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="copilot-messages" id="copilot-messages">
                        <!-- Messages will be inserted here -->
                    </div>
                    
                    <div class="copilot-quick-actions">
                        <button class="quick-action" data-action="tutorial">📚 Tutorial</button>
                        <button class="quick-action" data-action="examples">💡 Examples</button>
                        <button class="quick-action" data-action="help">❓ Help</button>
                    </div>
                    
                    <div class="copilot-input-area">
                        <input type="text" id="copilot-input" placeholder="Ask me anything about building chatbots..." />
                        <button id="copilot-send">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', copilotHTML);
        this.addCopilotStyles();
    }

    addCopilotStyles() {
        const styles = `
            <style>
            .botflo-copilot {
                position: fixed;
                bottom: 30px;
                right: 30px;
                z-index: 99999;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }

            /* Responsive positioning to avoid conflicts */
            @media (max-width: 768px) {
                .botflo-copilot {
                    bottom: 20px;
                    right: 20px;
                }
            }

            /* Ensure copilot stays above other floating elements */
            .botflo-copilot {
                z-index: 99999 !important;
            }

            /* Defensive positioning against FAB or scroll-top buttons */
            .fab, .scroll-top, .back-to-top {
                right: 140px !important; /* Move other floating buttons away */
            }

            @media (max-width: 768px) {
                .fab, .scroll-top, .back-to-top {
                    right: 90px !important;
                }
            }

            .copilot-toggle {
                display: flex;
                align-items: center;
                gap: 12px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 14px 24px;
                border-radius: 60px;
                cursor: pointer;
                box-shadow: 0 10px 30px rgba(102, 126, 234, 0.25);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border: none;
                font-size: 14px;
                font-weight: 600;
                backdrop-filter: blur(10px);
                position: relative;
                overflow: hidden;
            }

            .copilot-toggle::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s;
            }

            .copilot-toggle:hover::before {
                left: 100%;
            }

            .copilot-toggle:hover {
                transform: translateY(-3px) scale(1.02);
                box-shadow: 0 15px 40px rgba(102, 126, 234, 0.35);
            }

            .copilot-toggle:active {
                transform: translateY(-1px) scale(0.98);
            }

            .copilot-avatar {
                position: relative;
                width: 36px;
                height: 36px;
                background: rgba(255, 255, 255, 0.15);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                border: 2px solid rgba(255, 255, 255, 0.2);
            }

            .copilot-avatar i {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #FFD700 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
                transition: all 0.3s ease;
            }

            .copilot-toggle:hover .copilot-avatar i {
                transform: scale(1.1) rotate(5deg);
                filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
            }

            .copilot-pulse {
                position: absolute;
                top: -2px;
                right: -2px;
                width: 12px;
                height: 12px;
                background: #10b981;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(1.1); }
                100% { opacity: 1; transform: scale(1); }
            }

            .copilot-window {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 400px;
                height: 520px;
                background: white;
                border-radius: 20px;
                box-shadow: 0 25px 70px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(102, 126, 234, 0.1);
                display: none;
                flex-direction: column;
                overflow: hidden;
                backdrop-filter: blur(20px);
                transform: scale(0.95) translateY(20px);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .copilot-window.visible {
                display: flex;
                transform: scale(1) translateY(0);
                opacity: 1;
                animation: slideUpBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            @keyframes slideUpBounce {
                0% { 
                    opacity: 0; 
                    transform: scale(0.8) translateY(40px); 
                }
                60% { 
                    opacity: 1; 
                    transform: scale(1.02) translateY(-5px); 
                }
                100% { 
                    opacity: 1; 
                    transform: scale(1) translateY(0); 
                }
            }

            .copilot-header {
                padding: 20px 24px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                position: relative;
                overflow: hidden;
            }

            .copilot-header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%);
                pointer-events: none;
            }

            .copilot-info {
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 1;
            }

            .copilot-avatar-small {
                width: 28px;
                height: 28px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                border: 1px solid rgba(255, 255, 255, 0.3);
            }

            .copilot-avatar-small i {
                background: linear-gradient(135deg, #FFD700 0%, #FFF 50%, #FFD700 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
            }

            .copilot-info h4 {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
            }

            .copilot-status {
                font-size: 12px;
                opacity: 0.8;
            }

            .copilot-close {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                color: white;
                cursor: pointer;
                padding: 8px;
                border-radius: 8px;
                opacity: 0.8;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                z-index: 1;
            }

            .copilot-close:hover {
                opacity: 1;
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.1);
            }

            .copilot-close:active {
                transform: scale(0.95);
            }

            .copilot-messages {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .copilot-message {
                max-width: 85%;
                padding: 12px 16px;
                border-radius: 12px;
                font-size: 14px;
                line-height: 1.4;
                animation: fadeInMessage 0.3s ease;
            }

            @keyframes fadeInMessage {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .copilot-message.bot {
                background: #f3f4f6;
                color: #374151;
                align-self: flex-start;
                border-bottom-left-radius: 4px;
            }

            .copilot-message.user {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                align-self: flex-end;
                border-bottom-right-radius: 4px;
            }

            .copilot-quick-actions {
                padding: 12px 16px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }

            .quick-action {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 20px;
                padding: 6px 12px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
                white-space: nowrap;
            }

            .quick-action:hover {
                background: #667eea;
                color: white;
                border-color: #667eea;
            }

            .copilot-input-area {
                padding: 16px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                gap: 8px;
                align-items: center;
            }

            #copilot-input {
                flex: 1;
                padding: 12px 16px;
                border: 1px solid #e5e7eb;
                border-radius: 24px;
                outline: none;
                font-size: 14px;
                transition: border-color 0.2s;
            }

            #copilot-input:focus {
                border-color: #667eea;
            }

            #copilot-send {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border: none;
                border-radius: 50%;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s;
            }

            #copilot-send:hover {
                transform: scale(1.05);
            }

            /* Mobile responsiveness for copilot */
            @media (max-width: 768px) {
                .botflo-copilot {
                    right: 10px;
                    bottom: 10px;
                }
                
                .copilot-window {
                    width: calc(100vw - 20px);
                    right: 10px;
                    bottom: 70px;
                }
                
                .copilot-toggle {
                    padding: 10px 16px;
                    gap: 10px;
                }
                
                .copilot-label {
                    display: none;
                }
            }

            @media (max-width: 768px) {
                .copilot-window {
                    width: calc(100vw - 40px);
                    right: 20px;
                    left: 20px;
                    height: 60vh;
                }
                
                .copilot-toggle {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                }
            }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    bindEvents() {
        const toggle = document.getElementById('copilot-toggle');
        const close = document.getElementById('copilot-close');
        const send = document.getElementById('copilot-send');
        const input = document.getElementById('copilot-input');
        const quickActions = document.querySelectorAll('.quick-action');

        toggle.addEventListener('click', () => this.toggleCopilot());
        close.addEventListener('click', () => this.hideCopilot());
        send.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        quickActions.forEach(action => {
            action.addEventListener('click', () => {
                this.handleQuickAction(action.dataset.action);
            });
        });
    }

    toggleCopilot() {
        const window = document.getElementById('copilot-window');
        if (this.isVisible) {
            this.hideCopilot();
        } else {
            this.showCopilot();
        }
    }

    showCopilot() {
        const window = document.getElementById('copilot-window');
        window.style.display = 'flex';
        
        // Use requestAnimationFrame for smooth animation
        requestAnimationFrame(() => {
            window.classList.add('visible');
            this.isVisible = true;
            
            // Auto-focus input after animation
            setTimeout(() => {
                const input = document.getElementById('copilot-input');
                if (input) input.focus();
            }, 200);
        });
    }

    hideCopilot() {
        const window = document.getElementById('copilot-window');
        window.classList.remove('visible');
        this.isVisible = false;
        
        // Hide after animation completes
        setTimeout(() => {
            if (!this.isVisible) {
                window.style.display = 'none';
            }
        }, 300);
    }

    detectPageContext() {
        const path = window.location.pathname;
        if (path.includes('tutorial')) {
            this.currentContext = 'tutorial';
        } else if (path.includes('demo')) {
            this.currentContext = 'demo';
        } else if (path.includes('builder')) {
            this.currentContext = 'builder';
        } else if (path.includes('pro')) {
            this.currentContext = 'pro-builder';
        } else {
            this.currentContext = 'general';
        }
    }

    setContext(contextData) {
        if (contextData && contextData.page) {
            this.currentContext = contextData.page;
        }
        if (contextData && contextData.features) {
            this.features = contextData.features;
        }
        if (contextData && contextData.userType) {
            this.userType = contextData.userType;
        }
    }

    showWelcomeMessage() {
        setTimeout(() => {
            const welcomeMessages = {
                'general': "👋 Hi! I'm your BotFlo Copilot. I'm here to help you build amazing chatbots. What would you like to create today?",
                'tutorial': "📚 Great! You're in the tutorial section. I can guide you through each step and answer any questions about building chatbots.",
                'demo': "🎮 Welcome to the demo! Try chatting and see how it works. I can explain any features you're curious about.",
                'builder': "🛠️ You're in the Easy Builder! I can help you choose templates, add components, or troubleshoot issues.",
                'pro-builder': "⚡ Welcome to the Pro Builder! I can help you with advanced features like data integration, API connections, and complex flows.",
                'marketplace': "🛒 Welcome to the BotFlo marketplace! I can help you discover chatbot templates, explain features, or guide you to the right builder for your needs."
            };

            this.addMessage(welcomeMessages[this.currentContext] || welcomeMessages.general, 'bot');
        }, 2000);
    }

    sendMessage() {
        const input = document.getElementById('copilot-input');
        const message = input.value.trim();
        
        if (!message) return;

        this.addMessage(message, 'user');
        input.value = '';

        // Simulate thinking
        setTimeout(() => {
            this.addMessage('💭 Let me think about that...', 'bot');
        }, 500);

        // Generate response
        setTimeout(() => {
            this.removeLastMessage(); // Remove "thinking" message
            const response = this.generateResponse(message);
            this.addMessage(response, 'bot');
        }, 1500);
    }

    generateResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Context-aware responses
        if (lowerMessage.includes('how') && lowerMessage.includes('start')) {
            return "🚀 Great question! To start building a chatbot:\n\n1. Choose a template or start from scratch\n2. Add conversation flows\n3. Connect your data sources\n4. Test and refine\n5. Deploy!\n\nWould you like me to guide you through any of these steps?";
        }
        
        if (lowerMessage.includes('template')) {
            return "📋 We have several templates:\n\n• 🎧 Customer Service - FAQ & Support\n• 🎯 Lead Generation - Capture & Qualify\n• 🛒 E-commerce - Shop & Buy\n• 📅 Booking - Schedule & Reserve\n• 📊 Survey - Collect Data\n\nWhich type of chatbot are you building?";
        }
        
        if (lowerMessage.includes('data') || lowerMessage.includes('csv') || lowerMessage.includes('api')) {
            return "🔗 Excellent! ChatFlow supports multiple data sources:\n\n• 🌐 Website scraping\n• 📊 CSV/Google Sheets\n• 🔌 REST APIs\n• 🧠 Knowledge base text\n\nIn the Pro Builder, you can connect these in the Data Sources panel. Would you like specific help with any of these?";
        }
        
        if (lowerMessage.includes('help') || lowerMessage.includes('stuck')) {
            return "🤝 I'm here to help! What specific issue are you facing?\n\n• Building conversation flows?\n• Connecting data sources?\n• Testing your chatbot?\n• Deployment options?\n\nJust describe what you're trying to do and I'll guide you through it!";
        }
        
        if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
            return "💰 ChatFlow offers flexible pricing:\n\n• Free tier for testing\n• Pro plans for businesses\n• Enterprise for large teams\n\nCheck out our pricing page for details. The best part? You can start building for free right now!";
        }

        // General helpful response
        const responses = [
            "That's a great question! Based on your current page, I'd suggest exploring the visual builder. Would you like me to show you how?",
            "I can help you with that! Are you looking to build a specific type of chatbot or integrate with particular data sources?",
            "Let me help you build something amazing! What's your main goal for this chatbot?",
            "Perfect! I love helping builders create chatbots. What feature would you like to learn about first?"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    handleQuickAction(action) {
        switch(action) {
            case 'tutorial':
                this.addMessage("📚 Opening tutorial guide...", 'bot');
                setTimeout(() => {
                    window.location.href = './tutorial.html';
                }, 1000);
                break;
                
            case 'examples':
                this.addMessage("💡 Here are some popular chatbot examples:\n\n• Customer support bot for SaaS\n• Lead qualification for real estate\n• Order tracking for e-commerce\n• FAQ bot for restaurants\n\nWhich interests you most?", 'bot');
                break;
                
            case 'help':
                this.addMessage("❓ I'm your ChatFlow assistant! I can help with:\n\n• Choosing the right template\n• Building conversation flows\n• Connecting data sources\n• Testing and deployment\n• Best practices\n\nWhat would you like to know?", 'bot');
                break;
        }
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('copilot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `copilot-message ${sender}`;
        messageDiv.textContent = text;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.messages.push({ text, sender, timestamp: Date.now() });
    }

    removeLastMessage() {
        const messagesContainer = document.getElementById('copilot-messages');
        const lastMessage = messagesContainer.lastElementChild;
        if (lastMessage) {
            lastMessage.remove();
            this.messages.pop();
        }
    }

    loadProgress() {
        try {
            return JSON.parse(localStorage.getItem('botflo-progress') || '{}');
        } catch {
            return {};
        }
    }

    saveProgress() {
        localStorage.setItem('botflo-progress', JSON.stringify(this.userProgress));
    }

    removeConflictingWidgets() {
        // Remove any conflicting chat widgets that might be added dynamically
        const conflictingWidgets = document.querySelectorAll('#smart-copilot-widget, #smart-copilot-trigger, .chatflow-copilot, #chatflow-copilot, .smart-copilot-trigger');
        conflictingWidgets.forEach(widget => {
            if (widget && widget.parentNode) {
                widget.remove();
            }
        });
    }
}

// Initialize BotFlo Copilot when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Prevent multiple instances
    if (window.botfloCopilot || document.getElementById('botflo-copilot')) {
        return;
    }
    
    // Small delay to ensure page is fully loaded
    setTimeout(() => {
        window.botfloCopilot = new BotFloCopilot();
    }, 1000);
});

// Export for manual initialization if needed
window.BotFloCopilot = BotFloCopilot;
