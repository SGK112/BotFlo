require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { OpenAI } = require('openai');
const { google } = require('googleapis');
const axios = require('axios');
const NodeCache = require('node-cache');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' })
  ],
});

// Enable Trust Proxy
app.set('trust proxy', 1);

// Cache
const cache = new NodeCache({ stdTTL: 3600 }); // 1-hour TTL

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net"
      ],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net"
      ],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"]
    }
  }
}));
app.use(compression());
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  })
);
// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes for the chatbot builder website
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chatbot-builder-landing.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chatbot-builder-landing.html'));
});

app.get('/public', (req, res) => {
  res.redirect('/');
});

app.get('/public/', (req, res) => {
  res.redirect('/');
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/features', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'features.html'));
});

app.get('/templates', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'templates.html'));
});

app.get('/pricing', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pricing.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// Builder overview and comparison page
app.get('/builders', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'builders-overview.html'));
});

app.get('/builders/visual', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'advanced-flow-builder.html'));
});

app.get('/builders/enhanced', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'enhanced-chatbot-designer.html'));
});

app.get('/builders/advanced', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'advanced-chatbot-builder.html'));
});

app.get('/builders/simple', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chatbot.html'));
});

// Demo route - this is what you want!
app.get('/demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'enhanced-chatbot-designer.html'));
});

// Direct routes for backward compatibility
app.get('/enhanced-chatbot-designer.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'enhanced-chatbot-designer.html'));
});

app.get('/chatbot-visual-builder.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chatbot-visual-builder.html'));
});

app.get('/chatbot-test.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chatbot-test.html'));
});

// Additional site pages
app.get('/integrations', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'integrations.html'));
});

app.get('/docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'docs.html'));
});

app.get('/tutorials', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tutorials.html'));
});

app.get('/blog', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'blog.html'));
});

app.get('/community', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'community.html'));
});

app.get('/support', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'support.html'));
});

// Legal pages
app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacy.html'));
});

app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'terms.html'));
});

// Authentication routes (for future implementation)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Original Surprise Granite chatbot interface
app.get('/surprise-granite', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// MongoDB Connection (only if needed for user data)
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    logger.info('MongoDB connected');
  }).catch(err => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });
} else {
  logger.info('MongoDB not configured - running without database');
}

// Define MongoDB Schema
const chatLogSchema = new mongoose.Schema({
  sessionId: String,
  clientId: String,
  clientEmail: String,
  message: String,
  response: String,
  timestamp: { type: Date, default: Date.now },
});

const ChatLog = mongoose.model('ChatLog', chatLogSchema);

// Initialize OpenAI API client (only if API key is provided)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  logger.info('OpenAI API client initialized');
} else {
  logger.info('OpenAI API key not provided - AI chat features will be disabled');
}

// Helper function to generate a formatted timestamp
function generateTimestamp() {
  return new Date().toISOString();
}

// Helper function to log API calls
function logAPICall(endpoint, params, result) {
  logger.info({
    timestamp: generateTimestamp(),
    endpoint,
    params,
    resultLength: result ? JSON.stringify(result).length : 0,
  });
}

// Import route modules and chatbot executor
const { ChatbotExecutor, ChatbotTester } = require('./public/js/chatbot-executor');

// Try to import optional route modules (they may not exist yet)
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
} catch (e) {
  console.log('Auth routes not found, skipping...');
}

try {
  const chatbotRoutes = require('./routes/chatbots');
  app.use('/api/chatbots', chatbotRoutes);
} catch (e) {
  console.log('Chatbot routes not found, skipping...');
}

try {
  const subscriptionRoutes = require('./routes/subscription');
  app.use('/api/subscription', subscriptionRoutes);
} catch (e) {
  console.log('Subscription routes not found, skipping...');
}

// Define API routes
app.get('/api/materials', async (req, res) => {
  try {
    const cachedMaterials = cache.get('materials');
    if (cachedMaterials) {
      return res.json(cachedMaterials);
    }

    const materials = await getMaterialPrices();
    
    if (materials && materials.length) {
      cache.set('materials', materials);
      res.json(materials);
    } else {
      res.status(404).json({ error: 'No materials found' });
    }
  } catch (error) {
    logger.error(`Error fetching materials: ${error.message}`);
    res.status(500).json({ error: 'Error fetching materials data' });
  }
});

app.get('/api/shopify-products', async (req, res) => {
  try {
    const query = req.query.q || '';
    const cacheKey = `products_${query}`;
    const cachedProducts = cache.get(cacheKey);
    
    if (cachedProducts) {
      return res.json(cachedProducts);
    }

    const products = await getShopifyProducts(query);
    
    if (products && products.length) {
      cache.set(cacheKey, products);
      res.json(products);
    } else {
      res.json([]);
    }
  } catch (error) {
    logger.error(`Error fetching Shopify products: ${error.message}`);
    res.status(500).json({ error: 'Error fetching product data' });
  }
});

app.post('/api/chat', async (req, res) => {
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}`;
  logger.info(`Chat API called (Request ID: ${requestId})`);

  try {
    const { message, sessionId, clientId, clientEmail, quoteState } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if OpenAI is available
    if (!openai) {
      return res.status(503).json({ 
        error: 'AI chat service is currently unavailable. Please configure OpenAI API key.',
        message: 'Thank you for your message. Our AI chat service is currently being configured. Please try again later or contact support.'
      });
    }

    // Create context for the AI
    let context = `You are the Surprise Granite Wizard AI assistant. 
    Today is ${new Date().toLocaleDateString()}.
    You help customers with countertop questions, quotes, and remodeling advice.
    Keep responses friendly, helpful, and concise.
    Use granite/stone terms and be knowledgeable about kitchen and bathroom remodeling.`;

    if (quoteState && quoteState.user && quoteState.user.name) {
      context += `\nYou're talking to ${quoteState.user.name}.`;
      
      if (quoteState.project && quoteState.project.type) {
        context += ` They're interested in ${quoteState.project.type}.`;
      }
    }

    // Get AI response from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: context },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const botReply = response.choices[0].message.content;

    // Save the chat log (only if MongoDB is connected)
    if (mongoose.connection.readyState === 1) {
      const chatLog = new ChatLog({
        sessionId,
        clientId,
        clientEmail,
        message,
        response: botReply,
      });
      
      await chatLog.save();
    }

    // Return the response
    res.json({ message: botReply });
  } catch (error) {
    logger.error(`Error in chat API: ${error.message}`);
    res.status(500).json({ error: 'Error processing your request' });
  }
});

app.post('/api/close-chat', (req, res) => {
  logger.info(`Chat session closed: ${req.body.sessionId || 'unknown'}`);
  res.status(200).send({ status: 'ok' });
});

// Enhanced Chatbot Builder APIs
app.post('/api/chatbot/execute', async (req, res) => {
  try {
    const { chatbotData, userMessage, sessionData } = req.body;
    
    if (!chatbotData || !userMessage) {
      return res.status(400).json({ error: 'Chatbot data and user message are required' });
    }

    const executor = new ChatbotExecutor(chatbotData, sessionData);
    const response = await executor.processMessage(userMessage);
    
    res.json(response);
  } catch (error) {
    logger.error(`Error executing chatbot: ${error.message}`);
    res.status(500).json({ error: 'Error executing chatbot' });
  }
});

app.post('/api/chatbot/save', async (req, res) => {
  try {
    const { name, data, userId } = req.body;
    
    if (!name || !data) {
      return res.status(400).json({ error: 'Name and data are required' });
    }

    // In a real app, save to database
    const chatbotId = `chatbot_${Date.now()}`;
    const savedChatbot = {
      id: chatbotId,
      name,
      data,
      userId: userId || 'anonymous',
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };

    // For demo purposes, save to memory/cache
    cache.set(`chatbot_${chatbotId}`, savedChatbot, 86400); // 24 hours

    res.json({ success: true, chatbotId, chatbot: savedChatbot });
  } catch (error) {
    logger.error(`Error saving chatbot: ${error.message}`);
    res.status(500).json({ error: 'Error saving chatbot' });
  }
});

app.get('/api/chatbot/:id', async (req, res) => {
  try {
    const chatbotId = req.params.id;
    const chatbot = cache.get(`chatbot_${chatbotId}`);
    
    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    res.json(chatbot);
  } catch (error) {
    logger.error(`Error loading chatbot: ${error.message}`);
    res.status(500).json({ error: 'Error loading chatbot' });
  }
});

app.post('/api/chatbot/test', async (req, res) => {
  try {
    const { chatbotData, testScenarios } = req.body;
    
    if (!chatbotData) {
      return res.status(400).json({ error: 'Chatbot data is required' });
    }

    const tester = new ChatbotTester(chatbotData);
    const results = await tester.runTests(testScenarios);
    
    res.json(results);
  } catch (error) {
    logger.error(`Error testing chatbot: ${error.message}`);
    res.status(500).json({ error: 'Error testing chatbot' });
  }
});

// Enhanced AI integration
app.post('/api/ai/generate-response', async (req, res) => {
  try {
    const { prompt, context, model, temperature } = req.body;
    
    if (!openai) {
      return res.status(503).json({ 
        error: 'AI service not available',
        message: 'OpenAI API key not configured'
      });
    }

    const response = await openai.chat.completions.create({
      model: model || "gpt-3.5-turbo",
      messages: [
        { role: "system", content: context || "You are a helpful assistant." },
        { role: "user", content: prompt }
      ],
      temperature: temperature || 0.7,
      max_tokens: 500,
    });

    res.json({ 
      response: response.choices[0].message.content,
      usage: response.usage 
    });
  } catch (error) {
    logger.error(`Error generating AI response: ${error.message}`);
    res.status(500).json({ error: 'Error generating AI response' });
  }
});

// Analytics endpoint
app.post('/api/chatbot/analytics', async (req, res) => {
  try {
    const { chatbotId, event, data } = req.body;
    
    // In a real app, save analytics to database
    const analyticsData = {
      chatbotId,
      event,
      data,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      ip: req.ip
    };

    logger.info('Chatbot analytics:', analyticsData);
    
    res.json({ success: true });
  } catch (error) {
    logger.error(`Error recording analytics: ${error.message}`);
    res.status(500).json({ error: 'Error recording analytics' });
  }
});

// Catch-all route - serve 404 or redirect to homepage
app.get('*', (req, res) => {
  res.redirect('/');
});

// Start server
app.listen(port, '0.0.0.0', () => {
  logger.info(`Server running at http://0.0.0.0:${port}`);
});
