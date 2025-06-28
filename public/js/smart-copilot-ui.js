/**
 * Smart BotFlo Co-pilot UI Components
 * Chat widget interface for the smart copilot
 */

class SmartCopilotUI {
    constructor(copilot) {
        this.copilot = copilot;
        this.isOpen = false;
        this.isMinimized = false;
        this.createChatWidget();
        this.setupEventListeners();
        this.showWelcomeMessage();
    }

    createChatWidget() {
        // Create the main chat widget container
        this.widget = document.createElement('div');
        this.widget.id = 'smart-copilot-widget';
        this.widget.innerHTML = `
            <div class="copilot-header">
                <div class="copilot-avatar">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="copilot-title">
                    <h4>BotFlo Co-pilot</h4>
                    <span class="copilot-status">Online</span>
                </div>
                <div class="copilot-controls">
                    <button class="minimize-btn" title="Minimize">−</button>
                    <button class="close-btn" title="Close">×</button>
                </div>
            </div>
            <div class="copilot-messages" id="copilot-messages">
                <!-- Messages will be added here -->
            </div>
            <div class="copilot-input-area">
                <div class="input-container">
                    <input type="text" id="copilot-input" placeholder="Ask me anything about BotFlo..." />
                    <button id="copilot-send" title="Send">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="m22 2-7 20-4-9-9-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div class="quick-actions">
                    <button class="quick-action" data-action="help">Help</button>
                    <button class="quick-action" data-action="tour">Take Tour</button>
                    <button class="quick-action" data-action="builder">Open Builder</button>
                </div>
            </div>
        `;

        // Create the floating trigger button
        this.trigger = document.createElement('div');
        this.trigger.id = 'smart-copilot-trigger';
        this.trigger.innerHTML = `
            <div class="trigger-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <div class="trigger-pulse"></div>
        `;

        // Add styles
        this.addStyles();

        // Append to body
        document.body.appendChild(this.widget);
        document.body.appendChild(this.trigger);

        // Initially hidden
        this.widget.style.display = 'none';
    }

    addStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            #smart-copilot-trigger {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 10000;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
                transition: all 0.3s ease;
                position: relative;
            }

            #smart-copilot-trigger:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
            }

            .trigger-pulse {
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                opacity: 0.3;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { transform: scale(1); opacity: 0.3; }
                50% { transform: scale(1.1); opacity: 0.1; }
                100% { transform: scale(1); opacity: 0.3; }
            }

            #smart-copilot-widget {
                position: fixed;
                bottom: 90px;
                right: 20px;
                width: 380px;
                height: 500px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                z-index: 10001;
                display: flex;
                flex-direction: column;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                overflow: hidden;
                transition: all 0.3s ease;
            }

            #smart-copilot-widget.minimized {
                height: 60px;
            }

            .copilot-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 20px;
                display: flex;
                align-items: center;
                gap: 12px;
                border-radius: 12px 12px 0 0;
            }

            .copilot-avatar {
                width: 32px;
                height: 32px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .copilot-title {
                flex: 1;
            }

            .copilot-title h4 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }

            .copilot-status {
                font-size: 12px;
                opacity: 0.8;
            }

            .copilot-controls {
                display: flex;
                gap: 8px;
            }

            .copilot-controls button {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                width: 24px;
                height: 24px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.8;
                transition: all 0.2s;
            }

            .copilot-controls button:hover {
                background: rgba(255, 255, 255, 0.2);
                opacity: 1;
            }

            .copilot-messages {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                background: #f8f9fa;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .message {
                max-width: 85%;
                padding: 12px 16px;
                border-radius: 18px;
                font-size: 14px;
                line-height: 1.4;
                animation: messageSlideIn 0.3s ease;
            }

            @keyframes messageSlideIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .message.bot {
                background: white;
                border: 1px solid #e9ecef;
                align-self: flex-start;
                border-radius: 18px 18px 18px 4px;
            }

            .message.user {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                align-self: flex-end;
                border-radius: 18px 18px 4px 18px;
            }

            .message-actions {
                margin-top: 8px;
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
            }

            .message-action {
                background: #667eea;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 12px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .message-action:hover {
                background: #5a6fd8;
                transform: translateY(-1px);
            }

            .copilot-input-area {
                padding: 20px;
                background: white;
                border-top: 1px solid #e9ecef;
            }

            .input-container {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
            }

            #copilot-input {
                flex: 1;
                padding: 12px 16px;
                border: 1px solid #e9ecef;
                border-radius: 25px;
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
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                border-radius: 50%;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            #copilot-send:hover {
                transform: scale(1.05);
            }

            .quick-actions {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }

            .quick-action {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
                color: #495057;
            }

            .quick-action:hover {
                background: #e9ecef;
                border-color: #667eea;
                color: #667eea;
            }

            .typing-indicator {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 12px 16px;
                background: white;
                border: 1px solid #e9ecef;
                border-radius: 18px 18px 18px 4px;
                align-self: flex-start;
                max-width: 85%;
            }

            .typing-dot {
                width: 6px;
                height: 6px;
                background: #667eea;
                border-radius: 50%;
                animation: typingBounce 1.4s infinite ease-in-out both;
            }

            .typing-dot:nth-child(1) { animation-delay: -0.32s; }
            .typing-dot:nth-child(2) { animation-delay: -0.16s; }

            @keyframes typingBounce {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }

            @media (max-width: 480px) {
                #smart-copilot-widget {
                    width: calc(100vw - 20px);
                    right: 10px;
                    left: 10px;
                    bottom: 80px;
                }
                
                #smart-copilot-trigger {
                    right: 15px;
                    bottom: 15px;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    setupEventListeners() {
        // Trigger button click
        this.trigger.addEventListener('click', () => {
            this.toggleWidget();
        });

        // Close button
        this.widget.querySelector('.close-btn').addEventListener('click', () => {
            this.closeWidget();
        });

        // Minimize button
        this.widget.querySelector('.minimize-btn').addEventListener('click', () => {
            this.toggleMinimize();
        });

        // Send message
        const sendBtn = this.widget.querySelector('#copilot-send');
        const input = this.widget.querySelector('#copilot-input');

        sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Quick actions
        this.widget.querySelectorAll('.quick-action').forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleQuickAction(btn.dataset.action);
            });
        });
    }

    toggleWidget() {
        if (this.isOpen) {
            this.closeWidget();
        } else {
            this.openWidget();
        }
    }

    openWidget() {
        this.widget.style.display = 'flex';
        this.isOpen = true;
        this.trigger.style.transform = 'scale(0.9)';
        
        // Focus input
        setTimeout(() => {
            this.widget.querySelector('#copilot-input').focus();
        }, 300);
    }

    closeWidget() {
        this.widget.style.display = 'none';
        this.isOpen = false;
        this.isMinimized = false;
        this.widget.classList.remove('minimized');
        this.trigger.style.transform = 'scale(1)';
    }

    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        this.widget.classList.toggle('minimized', this.isMinimized);
    }

    showWelcomeMessage() {
        setTimeout(() => {
            const contextMessage = this.copilot.getContextualWelcome();
            this.addMessage(contextMessage.message, 'bot', contextMessage.actions);
        }, 1000);
    }

    sendMessage() {
        const input = this.widget.querySelector('#copilot-input');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        // Process with copilot
        setTimeout(() => {
            const response = this.copilot.processMessage(message);
            this.hideTypingIndicator();
            this.addMessage(response.message, 'bot', response.actions);
        }, 1000 + Math.random() * 1000); // Simulate processing time
    }

    addMessage(text, sender, actions = []) {
        const messagesContainer = this.widget.querySelector('#copilot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;

        if (actions && actions.length > 0) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            
            actions.forEach(action => {
                const actionBtn = document.createElement('button');
                actionBtn.className = 'message-action';
                actionBtn.textContent = action.label;
                actionBtn.addEventListener('click', () => {
                    this.executeAction(action.action);
                });
                actionsDiv.appendChild(actionBtn);
            });
            
            messageDiv.appendChild(actionsDiv);
        }

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const messagesContainer = this.widget.querySelector('#copilot-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = this.widget.querySelector('#typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    handleQuickAction(action) {
        switch (action) {
            case 'help':
                this.addMessage('What would you like help with?', 'user');
                this.showTypingIndicator();
                setTimeout(() => {
                    this.hideTypingIndicator();
                    const helpResponse = this.copilot.getContextualHelp();
                    this.addMessage(helpResponse.message, 'bot', helpResponse.actions);
                }, 1000);
                break;
            
            case 'tour':
                this.addMessage('Start guided tour', 'user');
                this.executeAction('start-tour');
                break;
                
            case 'builder':
                this.addMessage('Open builder', 'user');
                this.executeAction('open-builder');
                break;
        }
    }

    executeAction(actionType) {
        switch (actionType) {
            case 'open-builder':
                window.location.href = '/builders';
                break;
                
            case 'open-marketplace':
                window.location.href = '/marketplace';
                break;
                
            case 'start-tour':
                this.copilot.startInteractiveTour();
                this.addMessage('Starting guided tour...', 'bot');
                break;
                
            case 'highlight-library':
                this.copilot.highlightElement('.component-library');
                break;
                
            case 'show-workspace':
                this.copilot.highlightElement('.flow-workspace');
                break;
                
            case 'show-properties':
                this.copilot.highlightElement('.properties-panel');
                break;
                
            default:
                console.log('Unknown action:', actionType);
        }
    }
}

// Export for use
window.SmartCopilotUI = SmartCopilotUI;
