/**
 * BotFlo.ai - Bot Builder API Client
 * Handles all API communication with the backend
 */

class BotBuilderAPI {
    constructor() {
        this.baseURL = '/api';
        this.headers = {
            'Content-Type': 'application/json'
        };
    }

    /**
     * Generic API request method
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.headers,
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ 
                    message: `HTTP ${response.status}: ${response.statusText}` 
                }));
                throw new Error(error.message || 'API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed [${endpoint}]:`, error);
            throw error;
        }
    }

    /**
     * Bot Management APIs
     */
    
    // Create a new bot
    async createBot(config) {
        return this.request('/bots', {
            method: 'POST',
            body: JSON.stringify(config)
        });
    }

    // Get bot by ID
    async getBot(botId) {
        return this.request(`/bots/${botId}`);
    }

    // Update bot configuration
    async updateBot(botId, config) {
        return this.request(`/bots/${botId}`, {
            method: 'PUT',
            body: JSON.stringify(config)
        });
    }

    // Delete bot
    async deleteBot(botId) {
        return this.request(`/bots/${botId}`, {
            method: 'DELETE'
        });
    }

    // List all bots
    async listBots() {
        return this.request('/bots');
    }

    // Deploy bot
    async deployBot(botId) {
        return this.request(`/bots/${botId}/deploy`, {
            method: 'POST'
        });
    }

    // Get bot analytics
    async getBotAnalytics(botId, timeframe = '7d') {
        return this.request(`/bots/${botId}/analytics?timeframe=${timeframe}`);
    }

    /**
     * Template Management APIs
     */
    
    // Get all templates
    async getTemplates() {
        return this.request('/templates');
    }

    // Get specific template
    async getTemplate(templateId) {
        return this.request(`/templates/${templateId}`);
    }

    // Create custom template
    async createTemplate(template) {
        return this.request('/templates', {
            method: 'POST',
            body: JSON.stringify(template)
        });
    }

    /**
     * Chat APIs
     */
    
    // Send message to bot
    async sendMessage(botId, message, sessionId = null) {
        return this.request('/chat', {
            method: 'POST',
            body: JSON.stringify({
                botId,
                message,
                sessionId
            })
        });
    }

    // Get chat history
    async getChatHistory(sessionId) {
        return this.request(`/chat/history/${sessionId}`);
    }

    /**
     * Integration APIs
     */
    
    // Get available integrations
    async getIntegrations() {
        return this.request('/integrations');
    }

    // Configure integration
    async configureIntegration(botId, integration, config) {
        return this.request(`/integrations/${integration}`, {
            method: 'POST',
            body: JSON.stringify({
                botId,
                config
            })
        });
    }

    // Test integration
    async testIntegration(botId, integration) {
        return this.request(`/integrations/${integration}/test`, {
            method: 'POST',
            body: JSON.stringify({ botId })
        });
    }

    /**
     * Utility methods
     */
    
    // Upload file
    async uploadFile(file, purpose = 'general') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('purpose', purpose);

        return this.request('/upload', {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set Content-Type for FormData
        });
    }

    // Export bot configuration
    async exportBot(botId, format = 'json') {
        return this.request(`/bots/${botId}/export?format=${format}`);
    }

    // Import bot configuration
    async importBot(configData) {
        return this.request('/bots/import', {
            method: 'POST',
            body: JSON.stringify(configData)
        });
    }

    // Validate bot configuration
    async validateBot(config) {
        return this.request('/bots/validate', {
            method: 'POST',
            body: JSON.stringify(config)
        });
    }

    // Get deployment status
    async getDeploymentStatus(botId) {
        return this.request(`/bots/${botId}/deployment`);
    }

    // Generate embed code
    async generateEmbedCode(botId, options = {}) {
        return this.request(`/bots/${botId}/embed`, {
            method: 'POST',
            body: JSON.stringify(options)
        });
    }

    /**
     * Error handling utilities
     */
    
    // Check if error is network related
    isNetworkError(error) {
        return error.message.includes('fetch') || 
               error.message.includes('Network') ||
               error.message.includes('Failed to fetch');
    }

    // Check if error is authentication related
    isAuthError(error) {
        return error.message.includes('401') || 
               error.message.includes('unauthorized');
    }

    // Check if error is rate limiting
    isRateLimitError(error) {
        return error.message.includes('429') || 
               error.message.includes('rate limit');
    }

    /**
     * Retry mechanism for failed requests
     */
    async requestWithRetry(endpoint, options = {}, maxRetries = 3) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await this.request(endpoint, options);
            } catch (error) {
                lastError = error;
                
                // Don't retry on auth errors or client errors
                if (this.isAuthError(error) || error.message.includes('4')) {
                    throw error;
                }
                
                // Wait before retry (exponential backoff)
                if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    console.log(`Retrying API request (attempt ${attempt + 1}/${maxRetries})`);
                }
            }
        }
        
        throw lastError;
    }
}

// Export for use in other modules
window.BotBuilderAPI = BotBuilderAPI;
