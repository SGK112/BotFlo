// Simple API server for BotFlo
const express = require('express');
const path = require('path');
const cors = require('cors');
const WebsiteChatbotScraper = require('./chatbot_com_scraper.js');

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'BotFlo API server is running',
        timestamp: new Date().toISOString()
    });
});

// Website scraping API endpoint
app.post('/api/scrape-website', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL is required'
            });
        }

        console.log(`🌐 Scraping website: ${url}`);
        
        const scraper = new WebsiteChatbotScraper();
        const result = await scraper.scrapeWebsiteForChatbot(url);
        
        if (result.success) {
            console.log(`✅ Successfully scraped ${url}`);
            console.log(`📊 Found ${result.trainingData.length} training examples`);
            
            res.json({
                success: true,
                url: result.url,
                chatbotData: result.chatbotData,
                trainingData: result.trainingData,
                timestamp: result.timestamp
            });
        } else {
            console.log(`❌ Failed to scrape ${url}: ${result.error}`);
            res.status(500).json({
                success: false,
                error: result.error || 'Scraping failed'
            });
        }
        
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Chatbot training API endpoint
app.post('/api/train-chatbot', async (req, res) => {
    try {
        const { name, trainingData, config } = req.body;
        
        // Simulate training process
        console.log(`🚀 Training chatbot: ${name}`);
        console.log(`📚 Training with ${trainingData.length} examples`);
        
        // Simulate training delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const chatbotId = 'bot_' + Math.random().toString(36).substr(2, 9);
        
        res.json({
            success: true,
            chatbotId,
            name,
            status: 'trained',
            trainingStats: {
                examples: trainingData.length,
                accuracy: 0.85 + Math.random() * 0.1, // Random accuracy between 85-95%
                trainingTime: '2.3s'
            },
            deploymentUrl: `/chat/${chatbotId}`
        });
        
    } catch (error) {
        console.error('Training Error:', error);
        res.status(500).json({
            success: false,
            error: 'Training failed'
        });
    }
});

// Chatbot deployment API endpoint
app.post('/api/deploy-chatbot', async (req, res) => {
    try {
        const { chatbotId, name, settings } = req.body;
        
        console.log(`🚀 Deploying chatbot: ${name} (${chatbotId})`);
        
        // Simulate deployment
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const deploymentUrl = `https://${chatbotId}.botflo.ai`;
        
        res.json({
            success: true,
            chatbotId,
            deploymentUrl,
            embedCode: `<script src="${deploymentUrl}/widget.js"></script>`,
            status: 'deployed',
            deploymentTime: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Deployment Error:', error);
        res.status(500).json({
            success: false,
            error: 'Deployment failed'
        });
    }
});

// Serve static files after API routes
app.use(express.static('public'));

// Catch all for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 BotFlo server running on port ${PORT}`);
    console.log(`📱 Visit: http://localhost:${PORT}`);
    console.log(`🤖 Builder: http://localhost:${PORT}/bot-builder.html`);
    console.log(`💳 Payment: http://localhost:${PORT}/payment.html`);
    console.log(`🛒 Marketplace: http://localhost:${PORT}/marketplace-unified.html`);
});

module.exports = app;
