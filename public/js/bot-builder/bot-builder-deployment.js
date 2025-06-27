/**
 * BotFlo.ai - Bot Builder Deployment Module
 * Handles bot deployment and distribution
 */

class BotBuilderDeployment {
    constructor(core) {
        this.core = core;
        this.deploymentStatus = 'draft';
        this.deploymentHistory = [];
    }

    /**
     * Initialize deployment module
     */
    async initialize() {
        this.loadDeploymentPanel();
        
        console.log('🚀 Bot Builder Deployment initialized');
    }

    /**
     * Load deployment panel
     */
    loadDeploymentPanel() {
        const deploymentTab = document.getElementById('deployment-tab');
        if (!deploymentTab) return;

        const bot = this.core.getCurrentBot();
        const deployment = bot.deployment || {};

        deploymentTab.innerHTML = `
            <div class="deployment-container">
                <div class="deployment-status">
                    <h3>Deployment Status</h3>
                    <div class="status-card ${deployment.status || 'draft'}">
                        <div class="status-indicator">
                            <i class="fas fa-${this.getStatusIcon(deployment.status)}"></i>
                        </div>
                        <div class="status-info">
                            <div class="status-title">${this.getStatusTitle(deployment.status)}</div>
                            <div class="status-description">${this.getStatusDescription(deployment.status)}</div>
                            ${deployment.lastDeployed ? `<div class="status-date">Last deployed: ${new Date(deployment.lastDeployed).toLocaleString()}</div>` : ''}
                        </div>
                    </div>
                </div>

                <div class="deployment-actions">
                    <div class="action-group">
                        <h4>Deploy Bot</h4>
                        <p>Make your bot available to users</p>
                        <div class="deployment-buttons">
                            <button class="btn btn-primary" 
                                    onclick="window.botBuilder.modules.deployment.deployBot()"
                                    ${!bot.id ? 'disabled' : ''}>
                                <i class="fas fa-rocket"></i> 
                                ${deployment.status === 'deployed' ? 'Redeploy' : 'Deploy Now'}
                            </button>
                            <button class="btn btn-secondary" 
                                    onclick="window.botBuilder.modules.deployment.testBot()">
                                <i class="fas fa-vial"></i> Test Bot
                            </button>
                            ${deployment.status === 'deployed' ? `
                                <button class="btn btn-danger" 
                                        onclick="window.botBuilder.modules.deployment.undeployBot()">
                                    <i class="fas fa-stop"></i> Undeploy
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>

                ${deployment.url ? this.renderDeploymentDetails(deployment) : ''}
                
                <div class="embed-options">
                    <h4>Embed Options</h4>
                    <p>Add your bot to websites and applications</p>
                    
                    <div class="embed-tabs">
                        <button class="embed-tab active" onclick="window.botBuilder.modules.deployment.switchEmbedTab('website')">
                            Website
                        </button>
                        <button class="embed-tab" onclick="window.botBuilder.modules.deployment.switchEmbedTab('iframe')">
                            iFrame
                        </button>
                        <button class="embed-tab" onclick="window.botBuilder.modules.deployment.switchEmbedTab('api')">
                            API
                        </button>
                        <button class="embed-tab" onclick="window.botBuilder.modules.deployment.switchEmbedTab('sdk')">
                            SDK
                        </button>
                    </div>
                    
                    <div class="embed-content" id="embedContent">
                        ${this.renderEmbedContent('website', bot)}
                    </div>
                </div>

                <div class="deployment-settings">
                    <h4>Deployment Settings</h4>
                    <div class="settings-grid">
                        <div class="setting-item">
                            <label class="checkbox-label">
                                <input type="checkbox" 
                                       ${deployment.allowTestMode ? 'checked' : ''} 
                                       onchange="window.botBuilder.modules.deployment.updateSetting('allowTestMode', this.checked)">
                                <span>Allow Test Mode</span>
                            </label>
                            <p class="setting-description">Enable testing without affecting production data</p>
                        </div>
                        
                        <div class="setting-item">
                            <label class="checkbox-label">
                                <input type="checkbox" 
                                       ${deployment.requireAuth ? 'checked' : ''} 
                                       onchange="window.botBuilder.modules.deployment.updateSetting('requireAuth', this.checked)">
                                <span>Require Authentication</span>
                            </label>
                            <p class="setting-description">Users must authenticate before using the bot</p>
                        </div>
                        
                        <div class="setting-item">
                            <label class="checkbox-label">
                                <input type="checkbox" 
                                       ${deployment.rateLimiting ? 'checked' : ''} 
                                       onchange="window.botBuilder.modules.deployment.updateSetting('rateLimiting', this.checked)">
                                <span>Enable Rate Limiting</span>
                            </label>
                            <p class="setting-description">Limit the number of requests per user</p>
                        </div>
                    </div>
                </div>

                <div class="deployment-history">
                    <h4>Deployment History</h4>
                    <div class="history-list" id="deploymentHistory">
                        ${this.renderDeploymentHistory()}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render deployment details
     */
    renderDeploymentDetails(deployment) {
        return `
            <div class="deployment-details">
                <h4>Live Bot Details</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Bot URL:</label>
                        <div class="url-display">
                            <input type="text" class="form-input" value="${deployment.url}" readonly>
                            <button class="btn btn-secondary btn-small" onclick="window.botBuilder.modules.deployment.copyToClipboard('${deployment.url}')">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="btn btn-secondary btn-small" onclick="window.open('${deployment.url}', '_blank')">
                                <i class="fas fa-external-link-alt"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="detail-item">
                        <label>API Endpoint:</label>
                        <div class="url-display">
                            <input type="text" class="form-input" value="${deployment.apiEndpoint || ''}" readonly>
                            <button class="btn btn-secondary btn-small" onclick="window.botBuilder.modules.deployment.copyToClipboard('${deployment.apiEndpoint || ''}')">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="detail-item">
                        <label>Bot ID:</label>
                        <div class="url-display">
                            <input type="text" class="form-input" value="${this.core.getCurrentBot().id || ''}" readonly>
                            <button class="btn btn-secondary btn-small" onclick="window.botBuilder.modules.deployment.copyToClipboard('${this.core.getCurrentBot().id || ''}')">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render embed content for different types
     */
    renderEmbedContent(type, bot) {
        const botId = bot.id || 'your-bot-id';
        const deploymentUrl = bot.deployment?.url || 'https://your-bot-url.com';

        switch (type) {
            case 'website':
                return `
                    <div class="embed-section">
                        <p>Add this script to your website to embed the chatbot:</p>
                        <div class="code-block">
                            <code>&lt;script src="https://cdn.botflo.ai/widget.js"&gt;&lt;/script&gt;
&lt;script&gt;
  BotFlo.init({
    botId: '${botId}',
    position: '${bot.style?.position || 'bottom-right'}',
    primaryColor: '${bot.style?.primaryColor || '#667eea'}',
    size: '${bot.style?.size || 'medium'}'
  });
&lt;/script&gt;</code>
                            <button class="copy-btn" onclick="window.botBuilder.modules.deployment.copyCode(this.previousElementSibling.textContent)">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                    </div>
                `;

            case 'iframe':
                return `
                    <div class="embed-section">
                        <p>Embed as an iframe:</p>
                        <div class="code-block">
                            <code>&lt;iframe 
  src="${deploymentUrl}?embed=true" 
  width="400" 
  height="600" 
  frameborder="0"
  style="border-radius: 10px;"&gt;
&lt;/iframe&gt;</code>
                            <button class="copy-btn" onclick="window.botBuilder.modules.deployment.copyCode(this.previousElementSibling.textContent)">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                    </div>
                `;

            case 'api':
                return `
                    <div class="embed-section">
                        <p>Use the REST API to integrate with your application:</p>
                        <div class="api-examples">
                            <h5>Send Message</h5>
                            <div class="code-block">
                                <code>POST /api/chat
Content-Type: application/json

{
  "botId": "${botId}",
  "message": "Hello",
  "sessionId": "user-session-123"
}</code>
                                <button class="copy-btn" onclick="window.botBuilder.modules.deployment.copyCode(this.previousElementSibling.textContent)">
                                    <i class="fas fa-copy"></i> Copy
                                </button>
                            </div>
                            
                            <h5>Get Bot Info</h5>
                            <div class="code-block">
                                <code>GET /api/bots/${botId}</code>
                                <button class="copy-btn" onclick="window.botBuilder.modules.deployment.copyCode(this.previousElementSibling.textContent)">
                                    <i class="fas fa-copy"></i> Copy
                                </button>
                            </div>
                        </div>
                    </div>
                `;

            case 'sdk':
                return `
                    <div class="embed-section">
                        <p>Use our SDKs for popular frameworks:</p>
                        <div class="sdk-tabs">
                            <button class="sdk-tab active" onclick="window.botBuilder.modules.deployment.switchSDK('javascript')">JavaScript</button>
                            <button class="sdk-tab" onclick="window.botBuilder.modules.deployment.switchSDK('react')">React</button>
                            <button class="sdk-tab" onclick="window.botBuilder.modules.deployment.switchSDK('python')">Python</button>
                        </div>
                        <div class="sdk-content" id="sdkContent">
                            ${this.renderSDKContent('javascript', botId)}
                        </div>
                    </div>
                `;

            default:
                return '';
        }
    }

    /**
     * Render SDK content
     */
    renderSDKContent(sdk, botId) {
        switch (sdk) {
            case 'javascript':
                return `
                    <div class="code-block">
                        <code>// Install: npm install @botflo/sdk
import { BotFlo } from '@botflo/sdk';

const bot = new BotFlo('${botId}');

// Send message
const response = await bot.sendMessage('Hello!');
console.log(response.message);</code>
                        <button class="copy-btn" onclick="window.botBuilder.modules.deployment.copyCode(this.previousElementSibling.textContent)">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                `;

            case 'react':
                return `
                    <div class="code-block">
                        <code>// Install: npm install @botflo/react
import { BotFloWidget } from '@botflo/react';

function App() {
  return (
    &lt;div&gt;
      &lt;BotFloWidget 
        botId="${botId}"
        position="bottom-right"
        primaryColor="#667eea"
      /&gt;
    &lt;/div&gt;
  );
}</code>
                        <button class="copy-btn" onclick="window.botBuilder.modules.deployment.copyCode(this.previousElementSibling.textContent)">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                `;

            case 'python':
                return `
                    <div class="code-block">
                        <code># Install: pip install botflo-sdk
from botflo import BotFlo

bot = BotFlo('${botId}')

# Send message
response = bot.send_message('Hello!')
print(response.message)</code>
                        <button class="copy-btn" onclick="window.botBuilder.modules.deployment.copyCode(this.previousElementSibling.textContent)">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                `;

            default:
                return '';
        }
    }

    /**
     * Render deployment history
     */
    renderDeploymentHistory() {
        if (this.deploymentHistory.length === 0) {
            return '<p class="no-history">No deployment history yet</p>';
        }

        return this.deploymentHistory.map(entry => `
            <div class="history-item">
                <div class="history-icon">
                    <i class="fas fa-${entry.type === 'deploy' ? 'rocket' : 'stop'}"></i>
                </div>
                <div class="history-info">
                    <div class="history-title">${entry.title}</div>
                    <div class="history-date">${new Date(entry.timestamp).toLocaleString()}</div>
                    ${entry.description ? `<div class="history-description">${entry.description}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    /**
     * Deploy bot
     */
    async deployBot() {
        try {
            this.core.showNotification('Deploying bot...', 'info');
            
            const result = await this.core.deployBot();
            
            // Add to deployment history
            this.addToHistory('deploy', 'Bot Deployed', 'Bot successfully deployed and available to users');
            
            // Reload deployment panel
            this.loadDeploymentPanel();
            
        } catch (error) {
            console.error('Deployment failed:', error);
            this.core.showNotification('Deployment failed: ' + error.message, 'error');
        }
    }

    /**
     * Test bot
     */
    async testBot() {
        try {
            const bot = this.core.getCurrentBot();
            
            // Validate bot configuration
            const validation = await this.validateBot(bot);
            
            if (validation.isValid) {
                this.core.showNotification('Bot configuration is valid!', 'success');
                
                // Open test modal
                this.showTestModal();
            } else {
                this.core.showNotification('Bot has validation errors: ' + validation.errors.join(', '), 'error');
            }
        } catch (error) {
            console.error('Test failed:', error);
            this.core.showNotification('Test failed: ' + error.message, 'error');
        }
    }

    /**
     * Undeploy bot
     */
    async undeployBot() {
        if (confirm('Are you sure you want to undeploy this bot? It will no longer be accessible to users.')) {
            try {
                this.core.showNotification('Undeploying bot...', 'info');
                
                // Call API to undeploy
                await this.core.apiClient.request(`/bots/${this.core.getCurrentBot().id}/undeploy`, {
                    method: 'POST'
                });
                
                // Update bot status
                this.core.updateBotProperty('deployment.status', 'draft');
                
                // Add to deployment history
                this.addToHistory('undeploy', 'Bot Undeployed', 'Bot removed from production');
                
                // Reload panel
                this.loadDeploymentPanel();
                
                this.core.showNotification('Bot undeployed successfully', 'success');
                
            } catch (error) {
                console.error('Undeploy failed:', error);
                this.core.showNotification('Undeploy failed: ' + error.message, 'error');
            }
        }
    }

    /**
     * Validate bot configuration
     */
    async validateBot(bot) {
        const errors = [];

        // Check required fields
        if (!bot.name || bot.name.trim() === '') {
            errors.push('Bot name is required');
        }

        if (!bot.welcome || bot.welcome.trim() === '') {
            errors.push('Welcome message is required');
        }

        // Check conversation flow
        if (!bot.nodes || bot.nodes.length === 0) {
            errors.push('Bot must have at least one conversation node');
        }

        // Check for orphaned nodes (nodes with no connections)
        if (bot.nodes && bot.nodes.length > 1) {
            const connectedNodes = new Set();
            (bot.edges || []).forEach(edge => {
                connectedNodes.add(edge.from);
                connectedNodes.add(edge.to);
            });

            const orphanedNodes = bot.nodes.filter(node => !connectedNodes.has(node.id));
            if (orphanedNodes.length > 1) { // Allow one start node
                errors.push(`${orphanedNodes.length - 1} nodes are not connected to the conversation flow`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Show test modal
     */
    showTestModal() {
        const modal = document.createElement('div');
        modal.className = 'modal test-modal active';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Test Bot</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="test-chat-container">
                        <div class="test-messages" id="testMessages"></div>
                        <div class="test-input">
                            <input type="text" id="testInput" placeholder="Type a message..." onkeypress="if(event.key==='Enter') window.botBuilder.modules.deployment.sendTestMessage()">
                            <button onclick="window.botBuilder.modules.deployment.sendTestMessage()">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Initialize test chat
        this.initTestChat();
    }

    /**
     * Initialize test chat
     */
    initTestChat() {
        const messagesEl = document.getElementById('testMessages');
        const bot = this.core.getCurrentBot();
        
        if (messagesEl) {
            messagesEl.innerHTML = `
                <div class="test-message bot">
                    ${bot.welcome}
                </div>
            `;
        }
    }

    /**
     * Send test message
     */
    async sendTestMessage() {
        const input = document.getElementById('testInput');
        const messagesEl = document.getElementById('testMessages');
        
        if (!input || !messagesEl || !input.value.trim()) return;

        const message = input.value.trim();
        input.value = '';

        // Add user message
        const userMsgEl = document.createElement('div');
        userMsgEl.className = 'test-message user';
        userMsgEl.textContent = message;
        messagesEl.appendChild(userMsgEl);

        // Scroll to bottom
        messagesEl.scrollTop = messagesEl.scrollHeight;

        // Simulate bot response (or use real API if available)
        setTimeout(() => {
            const botMsgEl = document.createElement('div');
            botMsgEl.className = 'test-message bot';
            botMsgEl.textContent = this.generateTestResponse(message);
            messagesEl.appendChild(botMsgEl);
            messagesEl.scrollTop = messagesEl.scrollHeight;
        }, 1000);
    }

    /**
     * Generate test response
     */
    generateTestResponse(message) {
        const bot = this.core.getCurrentBot();
        const lowerMessage = message.toLowerCase();

        // Simple test responses
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return bot.responses?.greeting || bot.welcome;
        }

        if (lowerMessage.includes('help')) {
            return 'I can help you with: ' + (bot.quickActions || []).join(', ');
        }

        return bot.responses?.fallback || "I'm in test mode. This is a simulated response.";
    }

    /**
     * Switch embed tab
     */
    switchEmbedTab(type) {
        // Update tab buttons
        document.querySelectorAll('.embed-tab').forEach(tab => {
            tab.classList.toggle('active', tab.textContent.toLowerCase() === type);
        });

        // Update content
        const embedContent = document.getElementById('embedContent');
        if (embedContent) {
            embedContent.innerHTML = this.renderEmbedContent(type, this.core.getCurrentBot());
        }
    }

    /**
     * Switch SDK tab
     */
    switchSDK(sdk) {
        // Update tab buttons
        document.querySelectorAll('.sdk-tab').forEach(tab => {
            tab.classList.toggle('active', tab.textContent.toLowerCase() === sdk);
        });

        // Update content
        const sdkContent = document.getElementById('sdkContent');
        if (sdkContent) {
            const botId = this.core.getCurrentBot().id || 'your-bot-id';
            sdkContent.innerHTML = this.renderSDKContent(sdk, botId);
        }
    }

    /**
     * Update deployment setting
     */
    updateSetting(key, value) {
        this.core.updateBotProperty(`deployment.${key}`, value);
    }

    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.core.showNotification('Copied to clipboard!', 'success');
        } catch (error) {
            console.error('Failed to copy:', error);
            this.core.showNotification('Failed to copy to clipboard', 'error');
        }
    }

    /**
     * Copy code to clipboard
     */
    async copyCode(code) {
        // Clean up the code (remove extra whitespace, etc.)
        const cleanCode = code.replace(/^\s+/gm, '').trim();
        await this.copyToClipboard(cleanCode);
    }

    /**
     * Add entry to deployment history
     */
    addToHistory(type, title, description = '') {
        this.deploymentHistory.unshift({
            type,
            title,
            description,
            timestamp: new Date().toISOString()
        });

        // Keep only last 10 entries
        if (this.deploymentHistory.length > 10) {
            this.deploymentHistory = this.deploymentHistory.slice(0, 10);
        }
    }

    /**
     * Helper methods for status display
     */
    getStatusIcon(status) {
        const icons = {
            draft: 'edit',
            deploying: 'spinner fa-spin',
            deployed: 'check-circle',
            failed: 'exclamation-triangle',
            undeploying: 'spinner fa-spin'
        };
        return icons[status] || 'question-circle';
    }

    getStatusTitle(status) {
        const titles = {
            draft: 'Draft',
            deploying: 'Deploying...',
            deployed: 'Live',
            failed: 'Deployment Failed',
            undeploying: 'Undeploying...'
        };
        return titles[status] || 'Unknown';
    }

    getStatusDescription(status) {
        const descriptions = {
            draft: 'Bot is in development mode',
            deploying: 'Bot is being deployed to production',
            deployed: 'Bot is live and available to users',
            failed: 'Deployment failed - check logs for details',
            undeploying: 'Bot is being removed from production'
        };
        return descriptions[status] || 'Status unknown';
    }

    /**
     * Update deployment module with new bot data
     */
    update(bot) {
        // Reload deployment panel if we're currently on the deployment tab
        const deploymentTab = document.getElementById('deployment-tab');
        if (deploymentTab && deploymentTab.classList.contains('active')) {
            this.loadDeploymentPanel();
        }
    }
}

// Export for use in other modules
window.BotBuilderDeployment = BotBuilderDeployment;
