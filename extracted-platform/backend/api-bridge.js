/**
 * API Bridge for BotFlo.ai Enhanced Platform Integration
 * 
 * This module provides communication between the legacy Node.js application
 * and the enhanced Flask application, enabling seamless data sharing and
 * functionality integration.
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');

class APIBridge {
    constructor(config = {}) {
        this.config = {
            nodePort: config.nodePort || 3000,
            flaskPort: config.flaskPort || 5001,
            bridgePort: config.bridgePort || 3001,
            nodeBaseURL: config.nodeBaseURL || `http://localhost:${config.nodePort || 3000}`,
            flaskBaseURL: config.flaskBaseURL || `http://localhost:${config.flaskPort || 5001}`,
            ...config
        };
        
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        
        // Logging middleware
        this.app.use((req, res, next) => {
            console.log(`[API Bridge] ${req.method} ${req.path} - ${new Date().toISOString()}`);
            next();
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                services: {
                    node: this.config.nodeBaseURL,
                    flask: this.config.flaskBaseURL
                }
            });
        });

        // Forward requests to Node.js legacy application
        this.app.use('/api/legacy/*', this.forwardToNode.bind(this));
        
        // Forward requests to Flask enhanced application
        this.app.use('/api/enhanced/*', this.forwardToFlask.bind(this));
        
        // User data synchronization
        this.app.post('/api/sync/users', this.syncUsers.bind(this));
        
        // Template synchronization
        this.app.post('/api/sync/templates', this.syncTemplates.bind(this));
        
        // Payment processing bridge
        this.app.post('/api/bridge/payment', this.bridgePayment.bind(this));
        
        // Authentication bridge
        this.app.post('/api/bridge/auth', this.bridgeAuth.bind(this));
    }

    async forwardToNode(req, res) {
        try {
            const path = req.path.replace('/api/legacy', '');
            const url = `${this.config.nodeBaseURL}/api${path}`;
            
            const response = await axios({
                method: req.method,
                url: url,
                data: req.body,
                headers: {
                    ...req.headers,
                    host: undefined // Remove host header to avoid conflicts
                },
                params: req.query
            });
            
            res.status(response.status).json(response.data);
        } catch (error) {
            console.error('[API Bridge] Error forwarding to Node.js:', error.message);
            res.status(error.response?.status || 500).json({
                error: 'Failed to forward request to legacy application',
                details: error.message
            });
        }
    }

    async forwardToFlask(req, res) {
        try {
            const path = req.path.replace('/api/enhanced', '');
            const url = `${this.config.flaskBaseURL}/api${path}`;
            
            const response = await axios({
                method: req.method,
                url: url,
                data: req.body,
                headers: {
                    ...req.headers,
                    host: undefined // Remove host header to avoid conflicts
                },
                params: req.query
            });
            
            res.status(response.status).json(response.data);
        } catch (error) {
            console.error('[API Bridge] Error forwarding to Flask:', error.message);
            res.status(error.response?.status || 500).json({
                error: 'Failed to forward request to enhanced application',
                details: error.message
            });
        }
    }

    async syncUsers(req, res) {
        try {
            // Get users from Node.js application
            const nodeUsers = await axios.get(`${this.config.nodeBaseURL}/api/users`);
            
            // Send users to Flask application for synchronization
            const syncResult = await axios.post(`${this.config.flaskBaseURL}/api/sync/users`, {
                users: nodeUsers.data
            });
            
            res.json({
                success: true,
                synchronized: syncResult.data.count,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('[API Bridge] Error syncing users:', error.message);
            res.status(500).json({
                error: 'Failed to synchronize users',
                details: error.message
            });
        }
    }

    async syncTemplates(req, res) {
        try {
            // Get templates from Node.js application
            const nodeTemplates = await axios.get(`${this.config.nodeBaseURL}/api/templates`);
            
            // Send templates to Flask application for synchronization
            const syncResult = await axios.post(`${this.config.flaskBaseURL}/api/sync/templates`, {
                templates: nodeTemplates.data
            });
            
            res.json({
                success: true,
                synchronized: syncResult.data.count,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('[API Bridge] Error syncing templates:', error.message);
            res.status(500).json({
                error: 'Failed to synchronize templates',
                details: error.message
            });
        }
    }

    async bridgePayment(req, res) {
        try {
            const { amount, currency, source, metadata } = req.body;
            
            // Process payment through legacy Stripe integration
            const paymentResult = await axios.post(`${this.config.nodeBaseURL}/api/payments/process`, {
                amount,
                currency,
                source,
                metadata: {
                    ...metadata,
                    source: 'enhanced-platform'
                }
            });
            
            // Record payment in enhanced platform
            await axios.post(`${this.config.flaskBaseURL}/api/payments/record`, {
                paymentId: paymentResult.data.id,
                amount,
                currency,
                status: paymentResult.data.status,
                metadata
            });
            
            res.json(paymentResult.data);
        } catch (error) {
            console.error('[API Bridge] Error processing payment:', error.message);
            res.status(500).json({
                error: 'Failed to process payment',
                details: error.message
            });
        }
    }

    async bridgeAuth(req, res) {
        try {
            const { token, action } = req.body;
            
            // Validate token with legacy authentication system
            const authResult = await axios.post(`${this.config.nodeBaseURL}/api/auth/validate`, {
                token
            });
            
            if (authResult.data.valid) {
                // Create or update user session in enhanced platform
                const sessionResult = await axios.post(`${this.config.flaskBaseURL}/api/auth/session`, {
                    userId: authResult.data.userId,
                    userData: authResult.data.user,
                    action
                });
                
                res.json({
                    success: true,
                    user: authResult.data.user,
                    enhancedSession: sessionResult.data.sessionId
                });
            } else {
                res.status(401).json({
                    error: 'Invalid authentication token'
                });
            }
        } catch (error) {
            console.error('[API Bridge] Error bridging authentication:', error.message);
            res.status(500).json({
                error: 'Failed to bridge authentication',
                details: error.message
            });
        }
    }

    async checkServices() {
        const services = {
            node: false,
            flask: false
        };
        
        try {
            await axios.get(`${this.config.nodeBaseURL}/health`, { timeout: 5000 });
            services.node = true;
        } catch (error) {
            console.warn('[API Bridge] Node.js service not available');
        }
        
        try {
            await axios.get(`${this.config.flaskBaseURL}/api/health`, { timeout: 5000 });
            services.flask = true;
        } catch (error) {
            console.warn('[API Bridge] Flask service not available');
        }
        
        return services;
    }

    start() {
        this.app.listen(this.config.bridgePort, () => {
            console.log(`[API Bridge] Started on port ${this.config.bridgePort}`);
            console.log(`[API Bridge] Node.js service: ${this.config.nodeBaseURL}`);
            console.log(`[API Bridge] Flask service: ${this.config.flaskBaseURL}`);
            
            // Check service availability
            this.checkServices().then(services => {
                console.log('[API Bridge] Service status:', services);
            });
        });
    }
}

// Export for use as module
module.exports = APIBridge;

// Start bridge if run directly
if (require.main === module) {
    const config = {
        nodePort: process.env.NODE_PORT || 3000,
        flaskPort: process.env.FLASK_PORT || 5001,
        bridgePort: process.env.BRIDGE_PORT || 3001
    };
    
    const bridge = new APIBridge(config);
    bridge.start();
}

