/**
 * BotFlo.ai - Bot Builder Preview Module
 * Handles live preview of the bot being built
 */

class BotBuilderPreview {
    constructor(core) {
        this.core = core;
        this.isOpen = true;
        this.currentSession = null;
        this.messages = [];
        this.typingTimeout = null;
    }

    /**
     * Initialize preview module
     */
    async initialize() {
        this.setupPreviewWindow();
        this.setupChatInterface();
        this.setupPreviewControls();
        
        console.log('👁️ Bot Builder Preview initialized');
    }

    /**
     * Set up preview window
     */
    setupPreviewWindow() {
        const previewContainer = document.getElementById('botPreview');
        if (!previewContainer) return;

        // Create preview structure if not exists
        if (!previewContainer.querySelector('.preview-header')) {
            previewContainer.innerHTML = `
                <div class="preview-header">
                    <div class="preview-bot-info">
                        <div class="preview-bot-icon" id="previewIcon">🤖</div>
                        <div class="preview-bot-name" id="previewBotName">My Chatbot</div>
                    </div>
                    <div class="preview-controls">
                        <button class="preview-btn" onclick="window.botBuilder.modules.preview.resetChat()" title="Reset Chat">
                            <i class="fas fa-redo"></i>
                        </button>
                        <button class="preview-btn" onclick="window.botBuilder.modules.preview.toggle()" title="Toggle Preview">
                            <i class="fas fa-minus"></i>
                        </button>
                    </div>
                </div>
                <div class="preview-content">
                    <div class="preview-messages" id="previewMessages">
                        <!-- Messages will be rendered here -->
                    </div>
                    <div class="preview-typing" id="previewTyping" style="display: none;">
                        <div class="typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                    <div class="preview-input">
                        <input type="text" 
                               id="previewInput" 
                               placeholder="Type a message..." 
                               onkeypress="if(event.key==='Enter') window.botBuilder.modules.preview.sendMessage()">
                        <button onclick="window.botBuilder.modules.preview.sendMessage()">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Set up chat interface functionality
     */
    setupChatInterface() {
        const input = document.getElementById('previewInput');
        if (input) {
            // Auto-resize input
            input.addEventListener('input', (e) => {
                e.target.style.height = 'auto';
                e.target.style.height = (e.target.scrollHeight) + 'px';
            });

            // Handle Enter key
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
    }

    /**
     * Set up preview controls
     */
    setupPreviewControls() {
        // Add quick actions to preview
        this.renderQuickActions();
    }

    /**
     * Send message in preview
     */
    async sendMessage() {
        const input = document.getElementById('previewInput');
        if (!input || !input.value.trim()) return;

        const message = input.value.trim();
        input.value = '';
        input.style.height = 'auto';

        // Add user message
        this.addMessage(message, 'user');

        // Show typing indicator
        this.showTyping();

        try {
            // Get bot response
            const response = await this.getBotResponse(message);
            
            // Hide typing and add bot response
            this.hideTyping();
            this.addMessage(response.message, 'bot');

            // Handle any actions in the response
            if (response.actions) {
                this.handleResponseActions(response.actions);
            }

        } catch (error) {
            console.error('Preview chat error:', error);
            this.hideTyping();
            this.addMessage('Sorry, something went wrong. Please try again.', 'bot', 'error');
        }
    }

    /**
     * Get bot response (simulate or use API)
     */
    async getBotResponse(message) {
        const bot = this.core.getCurrentBot();
        
        // If bot has an ID, use the real API
        if (bot.id) {
            try {
                return await this.core.apiClient.sendMessage(bot.id, message, this.currentSession);
            } catch (error) {
                console.warn('API chat failed, using mock response:', error);
            }
        }

        // Fallback to simulated response
        return this.simulateBotResponse(message, bot);
    }

    /**
     * Simulate bot response for preview
     */
    simulateBotResponse(message, bot) {
        const lowerMessage = message.toLowerCase();

        // Check for quick actions
        for (const action of bot.quickActions || []) {
            if (lowerMessage.includes(action.toLowerCase())) {
                return {
                    message: `You selected: ${action}. How can I help you with that?`,
                    actions: ['show_quick_actions']
                };
            }
        }

        // Simple keyword responses
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return { message: bot.responses?.greeting || bot.welcome };
        }
        
        if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
            return { message: bot.responses?.goodbye || 'Goodbye! Have a great day!' };
        }
        
        if (lowerMessage.includes('help')) {
            return { 
                message: 'I can help you with: ' + (bot.quickActions || []).join(', '),
                actions: ['show_quick_actions']
            };
        }

        // Default fallback
        return { 
            message: bot.responses?.fallback || "I'm not sure how to respond to that. Can you try rephrasing?"
        };
    }

    /**
     * Add message to chat
     */
    addMessage(text, sender, type = 'normal') {
        const messagesContainer = document.getElementById('previewMessages');
        if (!messagesContainer) return;

        const messageEl = document.createElement('div');
        messageEl.className = `preview-message ${sender} ${type}`;
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageEl.innerHTML = `
            <div class="message-content">${this.formatMessage(text)}</div>
            <div class="message-time">${timestamp}</div>
        `;

        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Store message
        this.messages.push({
            text,
            sender,
            type,
            timestamp: new Date()
        });

        // Animate in
        setTimeout(() => {
            messageEl.classList.add('message-show');
        }, 10);
    }

    /**
     * Format message text (handle markdown, links, etc.)
     */
    formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    }

    /**
     * Show typing indicator
     */
    showTyping() {
        const typingEl = document.getElementById('previewTyping');
        if (typingEl) {
            typingEl.style.display = 'block';
            
            // Scroll to show typing
            const messagesContainer = document.getElementById('previewMessages');
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }
    }

    /**
     * Hide typing indicator
     */
    hideTyping() {
        const typingEl = document.getElementById('previewTyping');
        if (typingEl) {
            typingEl.style.display = 'none';
        }
    }

    /**
     * Handle response actions
     */
    handleResponseActions(actions) {
        actions.forEach(action => {
            switch (action) {
                case 'show_quick_actions':
                    this.renderQuickActions();
                    break;
                default:
                    console.log('Unknown action:', action);
            }
        });
    }

    /**
     * Render quick actions
     */
    renderQuickActions() {
        const bot = this.core.getCurrentBot();
        const messagesContainer = document.getElementById('previewMessages');
        if (!messagesContainer || !bot.quickActions?.length) return;

        const quickActionsEl = document.createElement('div');
        quickActionsEl.className = 'preview-quick-actions';
        quickActionsEl.innerHTML = `
            <div class="quick-actions-title">Quick Actions:</div>
            <div class="quick-actions-buttons">
                ${bot.quickActions.map(action => `
                    <button class="quick-action-btn" onclick="window.botBuilder.modules.preview.selectQuickAction('${action}')">
                        ${action}
                    </button>
                `).join('')}
            </div>
        `;

        messagesContainer.appendChild(quickActionsEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Select quick action
     */
    selectQuickAction(action) {
        const input = document.getElementById('previewInput');
        if (input) {
            input.value = action;
            this.sendMessage();
        }
    }

    /**
     * Reset chat
     */
    resetChat() {
        const messagesContainer = document.getElementById('previewMessages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }

        this.messages = [];
        this.currentSession = null;

        // Add welcome message
        const bot = this.core.getCurrentBot();
        this.addMessage(bot.welcome, 'bot');
        
        // Show quick actions if available
        if (bot.quickActions?.length) {
            setTimeout(() => {
                this.renderQuickActions();
            }, 500);
        }
    }

    /**
     * Toggle preview visibility
     */
    toggle() {
        const previewContainer = document.getElementById('botPreview');
        const toggleBtn = document.getElementById('togglePreview');
        
        if (previewContainer) {
            this.isOpen = !this.isOpen;
            previewContainer.classList.toggle('collapsed', !this.isOpen);
            
            if (toggleBtn) {
                const icon = toggleBtn.querySelector('i');
                if (icon) {
                    icon.className = this.isOpen ? 'fas fa-eye-slash' : 'fas fa-eye';
                }
                toggleBtn.title = this.isOpen ? 'Hide Preview' : 'Show Preview';
            }

            // Update main content layout
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.classList.toggle('preview-hidden', !this.isOpen);
            }
        }
    }

    /**
     * Update preview with new bot data
     */
    update(bot) {
        // Update bot info
        const nameEl = document.getElementById('previewBotName');
        if (nameEl) {
            nameEl.textContent = bot.name;
        }

        const iconEl = document.getElementById('previewIcon');
        if (iconEl) {
            iconEl.textContent = bot.icon;
        }

        // Update styling
        this.updatePreviewStyling(bot);

        // Reset chat to show new configuration
        this.resetChat();
    }

    /**
     * Update preview styling
     */
    updatePreviewStyling(bot) {
        const previewContainer = document.getElementById('botPreview');
        if (!previewContainer || !bot.style) return;

        // Apply primary color
        if (bot.style.primaryColor) {
            previewContainer.style.setProperty('--primary-color', bot.style.primaryColor);
        }

        // Apply theme
        if (bot.style.theme) {
            previewContainer.className = `bot-preview theme-${bot.style.theme}`;
        }

        // Apply size
        if (bot.style.size) {
            previewContainer.classList.remove('size-small', 'size-medium', 'size-large');
            previewContainer.classList.add(`size-${bot.style.size}`);
        }
    }

    /**
     * Export chat history
     */
    exportChatHistory() {
        const data = {
            botName: this.core.getCurrentBot().name,
            messages: this.messages,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-history-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    /**
     * Get current chat state
     */
    getChatState() {
        return {
            messages: this.messages,
            session: this.currentSession,
            isOpen: this.isOpen
        };
    }
}

// Export for use in other modules
window.BotBuilderPreview = BotBuilderPreview;
