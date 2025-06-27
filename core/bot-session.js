/**
 * Bot Session - Manages individual user sessions
 */

class BotSession {
    constructor(sessionId, botConfig) {
        this.id = sessionId;
        this.botConfig = botConfig;
        this.messages = [];
        this.variables = new Map();
        this.context = new Map();
        this.startTime = new Date();
        this.lastActivity = new Date();
        this.messageCount = 0;
        this.state = 'active';
        
        // Initialize session variables
        this.initializeSession();
    }

    /**
     * Initialize session with default values
     */
    initializeSession() {
        this.setVariable('session_start', this.startTime.toISOString());
        this.setVariable('bot_name', this.botConfig.name || 'Assistant');
        this.setVariable('user_name', '');
        this.setVariable('user_email', '');
        this.setVariable('conversation_stage', 'greeting');
    }

    /**
     * Add message to session
     */
    addMessage(userMessage, botResponse) {
        const messageEntry = {
            id: this.generateMessageId(),
            userMessage,
            botResponse,
            timestamp: new Date(),
            messageNumber: this.messageCount + 1
        };

        this.messages.push(messageEntry);
        this.messageCount++;
        this.lastActivity = new Date();

        // Auto-extract common information
        this.autoExtractInfo(userMessage);
    }

    /**
     * Auto-extract information from user messages
     */
    autoExtractInfo(message) {
        // Extract email
        const emailMatch = message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
        if (emailMatch && !this.getVariable('user_email')) {
            this.setVariable('user_email', emailMatch[0]);
        }

        // Extract name (simple pattern)
        const nameMatch = message.match(/(?:i'm|i am|my name is|call me)\s+([a-zA-Z]+)/i);
        if (nameMatch && !this.getVariable('user_name')) {
            this.setVariable('user_name', nameMatch[1]);
        }

        // Extract phone number
        const phoneMatch = message.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/);
        if (phoneMatch && !this.getVariable('user_phone')) {
            this.setVariable('user_phone', phoneMatch[0]);
        }
    }

    /**
     * Set session variable
     */
    setVariable(key, value) {
        this.variables.set(key, {
            value,
            setAt: new Date(),
            setBy: 'system'
        });
    }

    /**
     * Get session variable
     */
    getVariable(key) {
        const variable = this.variables.get(key);
        return variable ? variable.value : null;
    }

    /**
     * Check if variable exists
     */
    hasVariable(key) {
        return this.variables.has(key);
    }

    /**
     * Set context information
     */
    setContext(key, value) {
        this.context.set(key, value);
    }

    /**
     * Get context information
     */
    getContext(key) {
        return this.context.get(key);
    }

    /**
     * Get conversation history
     */
    getHistory(limit = 10) {
        return this.messages.slice(-limit);
    }

    /**
     * Get session summary
     */
    getSummary() {
        const duration = new Date() - this.startTime;
        const durationMinutes = Math.floor(duration / 60000);

        return {
            id: this.id,
            messageCount: this.messageCount,
            startTime: this.startTime,
            lastActivity: this.lastActivity,
            duration: durationMinutes,
            state: this.state,
            variables: Object.fromEntries(
                Array.from(this.variables.entries()).map(([key, data]) => [key, data.value])
            ),
            lastMessages: this.getHistory(5)
        };
    }

    /**
     * Export session data
     */
    export() {
        return {
            id: this.id,
            messages: this.messages,
            variables: Array.from(this.variables.entries()),
            context: Array.from(this.context.entries()),
            startTime: this.startTime,
            lastActivity: this.lastActivity,
            messageCount: this.messageCount,
            state: this.state
        };
    }

    /**
     * Close session
     */
    close() {
        this.state = 'closed';
        this.setVariable('session_end', new Date().toISOString());
    }

    /**
     * Generate unique message ID
     */
    generateMessageId() {
        return `msg_${this.id}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    }

    /**
     * Check if session is expired
     */
    isExpired(timeoutMinutes = 30) {
        const timeout = timeoutMinutes * 60 * 1000;
        return (new Date() - this.lastActivity) > timeout;
    }

    /**
     * Update conversation stage
     */
    updateStage(stage) {
        this.setVariable('conversation_stage', stage);
    }

    /**
     * Get current conversation stage
     */
    getCurrentStage() {
        return this.getVariable('conversation_stage') || 'greeting';
    }

    /**
     * Add user feedback
     */
    addFeedback(rating, comment) {
        this.setVariable('feedback_rating', rating);
        this.setVariable('feedback_comment', comment);
        this.setVariable('feedback_timestamp', new Date().toISOString());
    }

    /**
     * Check if user provided contact info
     */
    hasContactInfo() {
        return this.hasVariable('user_email') || this.hasVariable('user_phone');
    }

    /**
     * Get user profile
     */
    getUserProfile() {
        return {
            name: this.getVariable('user_name'),
            email: this.getVariable('user_email'),
            phone: this.getVariable('user_phone'),
            hasContactInfo: this.hasContactInfo()
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BotSession };
} else {
    window.BotSession = BotSession;
}
