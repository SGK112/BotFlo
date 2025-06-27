// Load environment variables (gracefully handle missing .env file)
try {
  require('dotenv').config();
} catch (error) {
  console.log('No .env file found, using environment variables from system');
}
const express = require('express');
const cors = require('cors');
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
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Logger (initialize early)
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'botflo-app' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Add Stripe for payments
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_demo_key');

// Check if Stripe is properly configured
const isStripeConfigured = process.env.STRIPE_SECRET_KEY && 
  (process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') || process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) &&
  process.env.STRIPE_SECRET_KEY.length > 30;

// Log Stripe configuration status
if (isStripeConfigured) {
  logger.info('✅ Stripe payment system configured');
} else {
  logger.warn('⚠️ Stripe not configured properly - using demo mode for payments');
}

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
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  })
);
// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Bot Builder API
try {
  const { BotBuilderAPI } = require('./api/bot-builder-api');
  const botBuilderAPI = new BotBuilderAPI();
  
  // Mount the bot builder API routes
  app.use('/api', botBuilderAPI.getRouter());
  
  logger.info('🤖 Bot Builder API initialized');
} catch (error) {
  logger.warn('⚠️ Bot Builder API not available:', error.message);
}

// Set up file upload middleware
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|csv|xlsx|xls|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and spreadsheets are allowed'));
    }
  }
});

// Routes for the chatbot builder website

// ============================================================================
// SIMPLIFIED ROUTING FOR MODERN NAVIGATION
// ============================================================================

// Favicon
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favicon.svg'));
});

app.get('/favicon.svg', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favicon.svg'));
});

// Root route - Main landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'botflo-marketplace.html'));
});

// ============================================================================
// MAIN NAVIGATION ROUTES (Only 3-4 core routes)
// ============================================================================

// 1. BUILD BOT - Main builder hub
app.get('/builders', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'builders-overview-new.html'));
});

// Builder sub-routes
app.get('/builders/visual', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'visual-bot-builder-enhanced.html'));
});

app.get('/builders/enhanced', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'enhanced-chatbot-designer.html'));
});

app.get('/builders/simple', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'easy-chatbot-builder.html'));
});

// Pro builder route (as mentioned in the URL)
app.get('/builders/chatbot-builder-pro.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chatbot-builder-pro.html'));
});

app.get('/builders/pro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chatbot-builder-pro.html'));
});

// Demo route - direct to enhanced builder
app.get('/demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'enhanced-chatbot-designer.html'));
});

// 2. MARKETPLACE - Pre-built chatbots
app.get('/marketplace', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'marketplace.html'));
});

// 3. PRICING - Core business page
app.get('/pricing', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pricing.html'));
});

// ============================================================================
// REDIRECTS - Simplify navigation by redirecting secondary pages
// ============================================================================

// Home aliases
app.get('/home', (req, res) => res.redirect('/'));
app.get('/index', (req, res) => res.redirect('/'));

// Redirect secondary pages to main navigation or homepage sections
app.get('/about', (req, res) => res.redirect('/#about'));
app.get('/features', (req, res) => res.redirect('/#features'));
app.get('/templates', (req, res) => res.redirect('/marketplace'));
app.get('/contact', (req, res) => res.redirect('/#contact'));

// Support & docs redirect to homepage or builders
app.get('/docs', (req, res) => res.redirect('/builders'));
app.get('/tutorial', (req, res) => res.redirect('/builders'));
app.get('/tutorials', (req, res) => res.redirect('/builders'));
app.get('/support', (req, res) => res.redirect('/#support'));
app.get('/blog', (req, res) => res.redirect('/#blog'));
app.get('/community', (req, res) => res.redirect('/#community'));

// Integrations redirect to builders (where integrations are handled)
app.get('/integrations', (req, res) => res.redirect('/builders'));

// ============================================================================
// LEGAL & AUTH PAGES (Keep but don't feature in main nav)
// ============================================================================

app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacy.html'));
});

app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'terms.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// ============================================================================
// LEGACY COMPATIBILITY (For existing links)
// ============================================================================

// Direct HTML file access (for backward compatibility)
app.get('/enhanced-chatbot-designer.html', (req, res) => res.redirect('/demo'));
app.get('/chatbot-visual-builder.html', (req, res) => res.redirect('/builders/visual'));
app.get('/chatbot-test.html', (req, res) => res.redirect('/demo'));
app.get('/old-builder', (req, res) => res.redirect('/builders'));

// Legacy routes
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

// Initialize OpenAI API client
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  logger.info('OpenAI client initialized');
} else {
  logger.warn('OpenAI API key not provided - chat functionality will be limited');
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

// Helper function to get material prices from MongoDB or mock data
async function getMaterialPrices() {
  try {
    // If MongoDB is connected, try to fetch from there
    if (mongoose.connection.readyState === 1) {
      // If you have a Materials model, use it here
      // For now, return mock data
      logger.info('Returning mock material prices');
    }
    
    // Return mock material data for demo purposes
    return [
      {
        id: 1,
        material: 'Granite',
        colorName: 'Absolute Black',
        vendorName: 'Stone Supplier A',
        costSqFt: 45.50,
        thickness: '3cm',
        size: '3m x 1.5m',
        priceGroup: 'Group 1',
        availableSqFt: 150
      },
      {
        id: 2,
        material: 'Quartz',
        colorName: 'Calacatta Gold',
        vendorName: 'Stone Supplier B',
        costSqFt: 65.00,
        thickness: '2cm',
        size: '3m x 1.4m',
        priceGroup: 'Group 2',
        availableSqFt: 200
      },
      {
        id: 3,
        material: 'Marble',
        colorName: 'Carrara White',
        vendorName: 'Stone Supplier C',
        costSqFt: 55.75,
        thickness: '3cm',
        size: '2.8m x 1.6m',
        priceGroup: 'Group 1',
        availableSqFt: 120
      }
    ];
  } catch (error) {
    logger.error(`Error in getMaterialPrices: ${error.message}`);
    return [];
  }
}

// Helper function to get Shopify products or mock data
async function getShopifyProducts(query = '') {
  try {
    // For demo purposes, return mock product data
    // In production, this would connect to Shopify API
    logger.info(`Fetching products for query: ${query}`);
    
    const mockProducts = [
      {
        id: 1,
        title: 'Premium Granite Slab',
        description: 'High-quality granite slab perfect for kitchen countertops',
        price: 45.50,
        image: '/images/granite-sample.jpg',
        category: 'Granite'
      },
      {
        id: 2,
        title: 'Quartz Countertop Material',
        description: 'Engineered quartz with consistent patterns and durability',
        price: 65.00,
        image: '/images/quartz-sample.jpg',
        category: 'Quartz'
      },
      {
        id: 3,
        title: 'Natural Marble Slab',
        description: 'Beautiful natural marble with unique veining patterns',
        price: 55.75,
        image: '/images/marble-sample.jpg',
        category: 'Marble'
      }
    ];
    
    // Filter products based on query if provided
    if (query) {
      const filteredProducts = mockProducts.filter(product => 
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      );
      return filteredProducts;
    }
    
    return mockProducts;
  } catch (error) {
    logger.error(`Error in getShopifyProducts: ${error.message}`);
    return [];
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'ChatFlo Chatbot Builder',
    version: '2.0.0',
    environment: {
      node: process.version,
      platform: process.platform,
      uptime: process.uptime()
    },
    services: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured'
    }
  };
  
  res.json(health);
});

// API Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    marketplace: 'active',
    payments: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured',
    database: 'optional',
    bots_available: ['restaurant', 'support', 'realestate'],
    last_updated: '2025-06-26'
  });
});

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

    // Check if OpenAI API key is configured
    if (!openai) {
      logger.error('OpenAI client not initialized');
      return res.status(500).json({ 
        error: 'AI service not configured. Please check server configuration.' 
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

    // Save the chat log if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      try {
        const chatLog = new ChatLog({
          sessionId,
          clientId,
          clientEmail,
          message,
          response: botReply,
        });
        
        await chatLog.save();
        logger.info('Chat log saved to database');
      } catch (dbError) {
        logger.error(`Failed to save chat log: ${dbError.message}`);
        // Continue execution - don't fail the API call because of DB issues
      }
    } else {
      logger.info('MongoDB not connected - chat log not saved');
    }

    // Return the response
    res.json({ message: botReply });
  } catch (error) {
    logger.error(`Error in chat API: ${error.message}`);
    
    // Handle specific OpenAI API errors
    if (error.code === 'invalid_api_key') {
      return res.status(500).json({ error: 'AI service authentication failed' });
    } else if (error.code === 'rate_limit_exceeded') {
      return res.status(429).json({ error: 'Service temporarily unavailable. Please try again later.' });
    }
    
    res.status(500).json({ error: 'Error processing your request' });
  }
});

app.post('/api/close-chat', (req, res) => {
  logger.info(`Chat session closed: ${req.body.sessionId || 'unknown'}`);
  res.status(200).send({ status: 'ok' });
});

// Bot marketplace endpoints
app.post('/api/bot/upload/:botType', upload.single('file'), async (req, res) => {
  try {
    const { botType } = req.params;
    const file = req.file;
    const { botId, dataType } = req.body;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    logger.info(`File uploaded for bot ${botType}: ${file.filename}`);
    
    // Process different file types
    let processedData = {};
    
    if (file.mimetype === 'application/pdf') {
      // For now, just store file path - can add PDF text extraction later
      processedData = {
        type: 'pdf',
        filename: file.filename,
        originalName: file.originalname,
        path: file.path
      };
    } else if (file.mimetype.startsWith('image/')) {
      processedData = {
        type: 'image',
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        url: `/uploads/${file.filename}`
      };
    } else if (file.mimetype.includes('sheet') || file.mimetype.includes('csv')) {
      processedData = {
        type: 'spreadsheet',
        filename: file.filename,
        originalName: file.originalname,
        path: file.path
      };
    }
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: processedData
    });
    
  } catch (error) {
    logger.error(`File upload error: ${error.message}`);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Generate bot code for purchase
app.post('/api/bot/generate-code', (req, res) => {
  try {
    const { botType, customization, uploadedFiles } = req.body;
    
    // Generate protected bot code
    const botCode = generateBotCode(botType, customization, uploadedFiles);
    
    res.json({
      success: true,
      code: botCode,
      filename: `${botType}-bot-${Date.now()}.html`
    });
    
  } catch (error) {
    logger.error(`Code generation error: ${error.message}`);
    res.status(500).json({ error: 'Code generation failed' });
  }
});

// Payment endpoint - create a Stripe Checkout session
app.post('/api/payment/create-checkout-session', async (req, res) => {
  try {
    const { lineItems } = req.body;
    
    // Validate request
    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({ error: 'Invalid line items' });
    }
    
    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.description,
            images: item.images ? [item.images] : [],
          },
          unit_amount: item.price * 100, // Convert to cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get('host')}/cancel`,
    });
    
    res.json({ id: session.id });
  } catch (error) {
    logger.error(`Payment error: ${error.message}`);
    res.status(500).json({ error: 'Payment processing error' });
  }
});

// Webhook endpoint for Stripe events
app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;

  try {
    // Verify the webhook signature
    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);

    logger.info(`Received Stripe event: ${event.type}`);
  } catch (err) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      logger.info(`Checkout session completed: ${session.id}`);
      
      // TODO: Fulfill the order, e.g. send email, update database, etc.
      
      break;
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      logger.info(`PaymentIntent was successful! ID: ${paymentIntent.id}`);
      
      // TODO: Handle successful payment, e.g. grant access, send confirmation, etc.
      
      break;
    // ... handle other event types as needed
    default:
      logger.warn(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

function generateBotCode(botType, customization, uploadedFiles = []) {
  const apiKey = process.env.BOTFLO_API_KEY || 'demo-key';
  
  // Enhanced bot configuration with mobile-first design
  const botConfigs = {
    restaurant: {
      name: 'Restaurant Bot',
      welcomeMessage: customization.welcomeMessage || '🍕 Welcome to our restaurant! How can I help you today?',
      features: ['menu', 'orders', 'reservations'],
      icon: '🍕'
    },
    support: {
      name: 'Customer Support Bot',
      welcomeMessage: customization.welcomeMessage || '👋 Hi! I\'m here to help with any questions.',
      features: ['faq', 'tickets', 'escalation'],
      icon: '🎧'
    },
    appointment: {
      name: 'Appointment Scheduler',
      welcomeMessage: customization.welcomeMessage || '📅 I can help you book an appointment!',
      features: ['booking', 'calendar', 'reminders'],
      icon: '📅'
    },
    realestate: {
      name: 'Real Estate Bot',
      welcomeMessage: customization.welcomeMessage || '🏠 Looking for your dream home? I can help!',
      features: ['search', 'tours', 'leads'],
      icon: '🏠'
    }
  };
  
  const config = botConfigs[botType] || botConfigs.support;
  const primaryColor = customization.primaryColor || '#667eea';
  const botName = customization.botName || config.name;
  const animationStyle = customization.animationStyle || 'slideUp';
  const botSize = customization.botSize || 350;
  
  // Generate quick actions
  const quickActionsMap = {
    restaurant: ['View Menu', 'Make Reservation', 'Order Online', 'Our Hours'],
    support: ['Contact Support', 'Check Status', 'FAQ', 'Live Agent'],
    realestate: ['Search Properties', 'Schedule Tour', 'Get Estimate', 'Contact Agent']
  };
  
  const quickActions = quickActionsMap[botType] || quickActionsMap.support;
  const quickActionsHtml = quickActions.map(action => 
    `<div class="quick-action" onclick="sendQuickAction('${action}')">${action}</div>`
  ).join('');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${botName}</title>
    <style>
        :root {
            --primary: ${primaryColor};
            --primary-dark: ${primaryColor}dd;
            --secondary: #764ba2;
            --accent: #f093fb;
            --success: #10b981;
            --warning: #f59e0b;
            --error: #ef4444;
            --gray-50: #f9fafb;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-300: #d1d5db;
            --gray-400: #9ca3af;
            --gray-500: #6b7280;
            --gray-600: #4b5563;
            --gray-700: #374151;
            --gray-800: #1f2937;
            --gray-900: #111827;
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
            --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        }

        /* Mobile-First Animations */
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes bounce {
            0%, 20%, 60%, 100% {
                transform: translateY(0);
            }
            40% {
                transform: translateY(-10px);
            }
            80% {
                transform: translateY(-5px);
            }
        }

        .botflo-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: ${Math.min(botSize, 400)}px;
            height: ${Math.min(botSize * 1.6, 600)}px;
            background: white;
            border-radius: 1.5rem;
            box-shadow: var(--shadow-xl);
            display: flex;
            flex-direction: column;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            z-index: 10000;
            border: 1px solid var(--gray-200);
            animation: ${animationStyle} 0.8s ease-out;
            overflow: hidden;
        }

        .botflo-widget.minimized {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            cursor: pointer;
        }

        .botflo-header {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            color: white;
            padding: 1rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            position: relative;
        }

        .botflo-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            backdrop-filter: blur(10px);
        }

        .botflo-info {
            flex: 1;
        }

        .botflo-name {
            font-weight: 600;
            font-size: 1rem;
            margin-bottom: 0.25rem;
        }

        .botflo-status {
            font-size: 0.75rem;
            opacity: 0.9;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }

        .status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #10b981;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .botflo-controls {
            display: flex;
            gap: 0.5rem;
        }

        .control-btn {
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.875rem;
            transition: all 0.2s;
            backdrop-filter: blur(10px);
        }

        .control-btn:hover {
            background: rgba(255,255,255,0.3);
            transform: scale(1.1);
        }

        .botflo-messages {
            flex: 1;
            padding: 1rem;
            background: var(--gray-50);
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .message {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
            animation: slideInRight 0.3s ease-out;
        }

        .message.bot {
            flex-direction: row;
        }

        .message.user {
            flex-direction: row-reverse;
        }

        .message-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: var(--primary);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.875rem;
            flex-shrink: 0;
        }

        .message.user .message-avatar {
            background: var(--gray-400);
        }

        .message-bubble {
            background: white;
            padding: 0.75rem 1rem;
            border-radius: 1.25rem;
            max-width: 80%;
            box-shadow: var(--shadow-sm);
            position: relative;
            border: 1px solid var(--gray-200);
        }

        .message.bot .message-bubble {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
        }

        .message-time {
            font-size: 0.625rem;
            opacity: 0.7;
            margin-top: 0.25rem;
            text-align: center;
        }

        .botflo-input {
            padding: 1rem;
            background: white;
            display: flex;
            gap: 0.75rem;
            align-items: center;
            border-top: 1px solid var(--gray-200);
        }

        .input-field {
            flex: 1;
            padding: 0.75rem 1rem;
            border: 2px solid var(--gray-200);
            border-radius: 1.5rem;
            outline: none;
            font-size: 0.875rem;
            transition: border-color 0.2s;
            background: var(--gray-50);
        }

        .input-field:focus {
            border-color: var(--primary);
            background: white;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .send-btn {
            width: 40px;
            height: 40px;
            border: none;
            border-radius: 50%;
            background: var(--primary);
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            box-shadow: var(--shadow-md);
        }

        .send-btn:hover {
            background: var(--primary-dark);
            transform: scale(1.05);
            box-shadow: var(--shadow-lg);
        }

        .send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
            .botflo-widget {
                width: calc(100vw - 2rem);
                height: calc(100vh - 4rem);
                bottom: 1rem;
                right: 1rem;
                left: 1rem;
                max-width: 400px;
                margin: 0 auto;
            }

            .botflo-widget.minimized {
                width: 60px;
                height: 60px;
                right: 1rem;
                left: auto;
            }
        }

        /* Loading animation */
        .typing-indicator {
            display: flex;
            gap: 0.25rem;
            align-items: center;
            padding: 0.75rem 1rem;
        }

        .typing-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--gray-400);
            animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typing {
            0%, 80%, 100% {
                transform: scale(0.8);
                opacity: 0.5;
            }
            40% {
                transform: scale(1);
                opacity: 1;
            }
        }

        /* Quick actions */
        .quick-actions {
            display: flex;
            gap: 0.5rem;
            padding: 0 1rem 1rem;
            flex-wrap: wrap;
        }

        .quick-action {
            padding: 0.5rem 0.75rem;
            background: white;
            border: 1px solid var(--gray-300);
            border-radius: 1rem;
            font-size: 0.75rem;
            cursor: pointer;
            transition: all 0.2s;
            color: var(--gray-700);
        }

        .quick-action:hover {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
            transform: translateY(-1px);
        }
    </style>
</head>
<body>
    <div class="botflo-widget" id="botfloWidget">
        <div class="botflo-header">
            <div class="botflo-avatar">${config.icon}</div>
            <div class="botflo-info">
                <div class="botflo-name">${botName}</div>
                <div class="botflo-status">
                    <span class="status-dot"></span>
                    Online • Powered by BotFlo.ai
                </div>
            </div>
            <div class="botflo-controls">
                <button class="control-btn" onclick="minimizeWidget()" title="Minimize">−</button>
                <button class="control-btn" onclick="closeWidget()" title="Close">×</button>
            </div>
        </div>
        
        <div class="botflo-messages" id="botfloMessages">
            <div class="message bot">
                <div class="message-avatar">${config.icon}</div>
                <div>
                    <div class="message-bubble">
                        ${config.welcomeMessage}
                    </div>
                    <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
            </div>
        </div>

        <div class="quick-actions" id="quickActions">
            ${quickActionsHtml}
        </div>
        
        <div class="botflo-input">
            <input type="text" class="input-field" id="botfloInput" placeholder="Type your message..." onkeypress="handleKeyPress(event)">
            <button class="send-btn" onclick="sendMessage()" id="sendBtn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m22 2-7 20-4-9-9-4 20-7z"/>
                </svg>
            </button>
        </div>
    </div>

    <script>
        // Enhanced bot configuration
        const BOTFLO_CONFIG = {
            apiKey: '${apiKey}',
            endpoint: '/api/chat',
            botType: '${botType}',
            customization: ${JSON.stringify(customization)},
            uploadedFiles: ${JSON.stringify(uploadedFiles)}
        };
        
        let isMinimized = false;
        let messageHistory = [];
        
        // Enhanced bot responses based on type and uploaded files
        const botResponses = {
            restaurant: {
                'menu|food|eat|order': [
                    'Here\\'s our menu! What would you like to order today? 🍽️',
                    'I\\'d love to help you with our delicious menu options! What are you craving?',
                    'Our chef\\'s specials are amazing today! Would you like to see what\\'s available?'
                ],
                'reservation|table|book': [
                    'I can help you book a table! What date and time works for you? 📅',
                    'Let me check our availability for you. When would you like to dine with us?'
                ],
                'hours|open|close|time': [
                    'We\\'re open Monday-Friday 11am-10pm, weekends 10am-11pm. 🕐',
                    'Our current hours are 11am-10pm weekdays, 10am-11pm weekends!'
                ],
                'default': [
                    'I can help with our menu, taking orders, or making reservations. What do you need? 🍕',
                    'Welcome! I\\'m here to help with anything restaurant-related. How can I assist you?'
                ]
            },
            support: {
                'help|support|problem|issue': [
                    'I\\'m here to help! What issue are you experiencing? 🆘',
                    'No worries, I\\'ll do my best to assist you. What\\'s the problem?'
                ],
                'account|login|password': [
                    'I can help with account issues. Are you having trouble logging in? 🔐',
                    'Account troubles? Let me help you get back on track!'
                ],
                'billing|payment|charge': [
                    'For billing questions, I can help or connect you with our billing team. 💳',
                    'Let me assist with your billing inquiry!'
                ],
                'bug|error|not working': [
                    'Sorry you\\'re having technical issues! Let me help troubleshoot. 🔧',
                    'Technical problems can be frustrating. Let\\'s figure this out together!'
                ],
                'default': [
                    'I\\'m your customer support assistant. How can I help you today? 👋',
                    'Hi there! I\\'m here to help solve any issues you might have.'
                ]
            },
            realestate: {
                'house|home|property|buy|sell': [
                    'I\\'d love to help you find your dream home! What type of property are you looking for? 🏠',
                    'Great! Let\\'s find you the perfect property. What\\'s your budget range?'
                ],
                'location|area|neighborhood': [
                    'Location is so important! Which areas interest you most? 📍',
                    'Let me help you explore the best neighborhoods for your needs!'
                ],
                'price|budget|cost': [
                    'I can help you find properties within your budget. What price range works for you? 💰',
                    'Budget planning is smart! What\\'s your ideal price range?'
                ],
                'tour|visit|viewing': [
                    'I can schedule a viewing for you! Which properties caught your eye? 👁️',
                    'Virtual or in-person tours available! When would work best for you?'
                ],
                'default': [
                    'I\\'m here to help with all your real estate needs! Looking to buy, sell, or just browse? 🏠',
                    'Welcome to your real estate assistant! How can I help you today?'
                ]
            }
        };
        
        function sendMessage() {
            const input = document.getElementById('botfloInput');
            const message = input.value.trim();
            
            if (!message) return;
            
            // Add user message
            addMessage(message, 'user');
            input.value = '';
            
            // Show typing indicator
            showTypingIndicator();
            
            // Get bot response with delay for realism
            setTimeout(() => {
                hideTypingIndicator();
                const response = getBotResponse(message);
                addMessage(response, 'bot');
                
                // Store in history
                messageHistory.push({user: message, bot: response, timestamp: new Date()});
            }, 1000 + Math.random() * 1000); // 1-2 second delay
        }
        
        function sendQuickAction(action) {
            const input = document.getElementById('botfloInput');
            input.value = action;
            sendMessage();
        }
        
        function addMessage(text, sender) {
            const messagesContainer = document.getElementById('botfloMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${sender}\`;
            
            const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const avatar = sender === 'bot' ? '${config.icon}' : '👤';
            
            messageDiv.innerHTML = \`
                <div class="message-avatar">\${avatar}</div>
                <div>
                    <div class="message-bubble">\${text}</div>
                    <div class="message-time">\${time}</div>
                </div>
            \`;
            
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        function showTypingIndicator() {
            const messagesContainer = document.getElementById('botfloMessages');
            const typingDiv = document.createElement('div');
            typingDiv.className = 'message bot';
            typingDiv.id = 'typingIndicator';
            typingDiv.innerHTML = \`
                <div class="message-avatar">${config.icon}</div>
                <div class="message-bubble">
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            \`;
            messagesContainer.appendChild(typingDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        function hideTypingIndicator() {
            const indicator = document.getElementById('typingIndicator');
            if (indicator) indicator.remove();
        }
        
        function getBotResponse(message) {
            const responses = botResponses[BOTFLO_CONFIG.botType] || botResponses.support;
            const lowerMessage = message.toLowerCase();
            
            // Check uploaded files for context
            if (BOTFLO_CONFIG.uploadedFiles.length > 0) {
                const fileTypes = BOTFLO_CONFIG.uploadedFiles.map(f => f.type);
                if (lowerMessage.includes('menu') && fileTypes.includes('pdf')) {
                    return 'I have your menu loaded! Let me help you with that. What are you in the mood for? 📋';
                }
                if (lowerMessage.includes('catalog') && fileTypes.includes('image')) {
                    return 'I can see your product catalog! What specific item are you looking for? 🛍️';
                }
            }
            
            // Match patterns and return random response
            for (const [pattern, responseArray] of Object.entries(responses)) {
                if (pattern !== 'default') {
                    const keywords = pattern.split('|');
                    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                        return responseArray[Math.floor(Math.random() * responseArray.length)];
                    }
                }
            }
            
            return responses.default[Math.floor(Math.random() * responses.default.length)];
        }
        
        function handleKeyPress(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        }
        
        function minimizeWidget() {
            const widget = document.getElementById('botfloWidget');
            isMinimized = !isMinimized;
            
            if (isMinimized) {
                widget.classList.add('minimized');
                widget.innerHTML = \`
                    <div style="width: 100%; height: 100%; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; cursor: pointer;" onclick="minimizeWidget()">
                        ${config.icon}
                    </div>
                \`;
            } else {
                widget.classList.remove('minimized');
                location.reload(); // Simple way to restore - in production you'd maintain state
            }
        }
        
        function closeWidget() {
            document.getElementById('botfloWidget').style.display = 'none';
        }
        
        // Initialize widget
        document.addEventListener('DOMContentLoaded', function() {
            // Add some initial quick actions
            const quickActions = document.getElementById('quickActions');
            if (quickActions && quickActions.children.length === 0) {
                quickActions.style.display = 'none';
            }
            
            // Validate API key integrity
            if (!BOTFLO_CONFIG.apiKey || BOTFLO_CONFIG.apiKey.length < 8) {
                console.error('BotFlo: Invalid API configuration');
                document.getElementById('botfloWidget').innerHTML = \`
                    <div style="padding: 2rem; text-align: center; color: var(--error); background: white; border-radius: 1.5rem; box-shadow: var(--shadow-xl);">
                        <h3>⚠️ Configuration Error</h3>
                        <p>This bot requires proper API configuration.</p>
                        <p style="font-size: 0.875rem; margin-top: 1rem;">Contact: support@botflo.ai</p>
                    </div>
                \`;
            }
        });
    </script>
</body>
</html>`;
}

// BotFlo marketplace and payment endpoints
app.get('/api/payment/create-checkout', async (req, res) => {
  try {
    const { bot, type, price } = req.query;
    
    logger.info(`Payment requested: bot=${bot}, type=${type}, price=${price}`);
    
    // Bot pricing configuration
    const botPricing = {
      restaurant: { 
        name: 'Restaurant Ordering Bot',
        download: 24, 
        hosted: 39,
        description: 'Complete restaurant chatbot with menu, orders & reservations'
      },
      support: { 
        name: 'Customer Support Bot',
        download: 19, 
        hosted: 29,
        description: 'AI customer support with knowledge base & ticket creation'
      },
      realestate: { 
        name: 'Real Estate Bot',
        download: 29, 
        hosted: 49,
        description: 'Property listings with virtual tours & lead capture'
      }
    };
    
    const botInfo = botPricing[bot];
    if (!botInfo || !botInfo[type]) {
      logger.error(`Invalid bot or pricing type: bot=${bot}, type=${type}`);
      return res.status(400).json({ error: 'Invalid bot or pricing type' });
    }
    
    // If Stripe is not properly configured, use demo mode
    if (!isStripeConfigured) {
      logger.info('Using demo payment mode');
      return res.redirect(`/api/payment/demo-checkout?bot=${bot}&type=${type}&price=${price}`);
    }
    
    const isRecurring = type === 'hosted';
    const mode = isRecurring ? 'subscription' : 'payment';
    
    // Create Stripe Checkout session
    const sessionConfig = {
      payment_method_types: ['card'],
      mode: mode,
      success_url: `${process.env.BASE_URL || `${req.protocol}://${req.get('host')}`}/success?session_id={CHECKOUT_SESSION_ID}&bot=${bot}&type=${type}`,
      cancel_url: `${process.env.BASE_URL || `${req.protocol}://${req.get('host')}`}/botflo-marketplace.html?cancelled=true`,
      metadata: {
        bot_type: bot,
        deployment_type: type,
        price: price.toString()
      }
    };
    
    if (isRecurring) {
      // Create subscription for hosted service
      sessionConfig.line_items = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${botInfo.name} - Hosted Service`,
            description: `${botInfo.description} - Fully hosted with support`
          },
          unit_amount: botInfo[type] * 100,
          recurring: {
            interval: 'month'
          }
        },
        quantity: 1
      }];
    } else {
      // One-time payment for code download
      sessionConfig.line_items = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${botInfo.name} - Source Code`,
            description: `${botInfo.description} - Complete source code with documentation`
          },
          unit_amount: botInfo[type] * 100
        },
        quantity: 1
      }];
    }
    
    logger.info('Creating Stripe checkout session...');
    const session = await stripe.checkout.sessions.create(sessionConfig);
    
    logger.info(`Stripe session created: ${session.id}`);
    
    // Redirect to Stripe Checkout
    res.redirect(303, session.url);
    
  } catch (error) {
    logger.error(`Checkout creation error: ${error.message}`);
    
    // If Stripe error related to API key, fall back to demo mode
    if (error.message.includes('Invalid API Key') || error.message.includes('api_key') || !isStripeConfigured) {
      logger.warn('Stripe API key issue, falling back to demo mode');
      return res.redirect(`/api/payment/demo-checkout?bot=${req.query.bot}&type=${req.query.type}&price=${req.query.price}`);
    }
    
    res.status(500).json({ error: 'Payment processing error', details: error.message });
  }
});

// Demo/Test payment endpoint for development
app.get('/api/payment/demo-checkout', async (req, res) => {
  try {
    const { bot, type, price } = req.query;
    
    logger.info(`Demo payment requested: bot=${bot}, type=${type}, price=${price}`);
    
    // Validate parameters
    if (!bot || !type || !price) {
      return res.status(400).json({ error: 'Missing required parameters: bot, type, price' });
    }
    
    // Bot pricing configuration
    const botPricing = {
      restaurant: { 
        name: 'Restaurant Ordering Bot',
        download: 24, 
        hosted: 39,
        description: 'Complete restaurant chatbot with menu, orders & reservations'
      },
      support: { 
        name: 'Customer Support Bot',
        download: 19, 
        hosted: 29,
        description: 'AI customer support with knowledge base & ticket creation'
      },
      realestate: { 
        name: 'Real Estate Bot',
        download: 29, 
        hosted: 49,
        description: 'Property listings with virtual tours & lead capture'
      }
    };
    
    const botInfo = botPricing[bot];
    if (!botInfo || !botInfo[type]) {
      return res.status(400).json({ error: 'Invalid bot or pricing type' });
    }
    
    // Simulate payment processing delay
    setTimeout(() => {
      // Generate a fake session ID for demo purposes
      const fakeSessionId = `demo_sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Redirect to success page with demo session
      const successUrl = `/success?session_id=${fakeSessionId}&bot=${bot}&type=${type}&demo=true`;
      res.redirect(303, successUrl);
    }, 1000);
    
  } catch (error) {
    logger.error(`Demo checkout error: ${error.message}`);
    res.status(500).json({ error: 'Demo payment processing error' });
  }
});

// Success page after payment
app.get('/success', async (req, res) => {
  try {
    const { session_id, bot, type, demo } = req.query;
    
    if (!session_id) {
      return res.redirect('/botflo-marketplace.html?error=no_session');
    }
    
    let isValidPayment = false;
    let sessionData = {};
    
    if (demo === 'true' || session_id.startsWith('demo_')) {
      // Demo mode - simulate successful payment
      logger.info(`Demo payment completed: ${session_id}`);
      isValidPayment = true;
      sessionData = {
        id: session_id,
        payment_status: 'paid',
        amount_total: 0,
        mode: 'demo'
      };
    } else if (isStripeConfigured) {
      // Real Stripe payment - retrieve session
      try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        logger.info(`Stripe session retrieved: ${session.id}, status: ${session.payment_status}`);
        isValidPayment = session.payment_status === 'paid';
        sessionData = session;
      } catch (stripeError) {
        logger.error(`Error retrieving Stripe session: ${stripeError.message}`);
        return res.redirect('/botflo-marketplace.html?error=payment_verification_failed');
      }
    } else {
      // Stripe not configured but got a real session ID - treat as demo
      logger.warn('Received session ID but Stripe not configured, treating as demo');
      isValidPayment = true;
      sessionData = { id: session_id, payment_status: 'demo', mode: 'demo' };
    }
    
    if (isValidPayment) {
      // Generate download link and bot code
      const downloadToken = generateDownloadToken(bot, type, session_id);
      
      // Payment successful - provide download or setup hosted service
      const successHtml = generateSuccessPage(bot, type, session_id, downloadToken, sessionData.mode === 'demo');
      res.send(successHtml);
    } else {
      logger.warn(`Payment not completed: ${session_id}`);
      res.redirect('/botflo-marketplace.html?error=payment_not_completed');
    }
    
  } catch (error) {
    logger.error(`Success page error: ${error.message}`);
    res.redirect('/botflo-marketplace.html?error=session_error');
  }
});

// Generate download token for security
function generateDownloadToken(bot, type, sessionId) {
  const timestamp = Date.now();
  const hash = require('crypto')
    .createHash('md5')
    .update(`${bot}-${type}-${sessionId}-${timestamp}`)
    .digest('hex');
  return `${bot}_${type}_${timestamp}_${hash.substring(0, 8)}`;
}

// Generate success page HTML
function generateSuccessPage(bot, type, sessionId, downloadToken, isDemo = false) {
  const botName = bot.charAt(0).toUpperCase() + bot.slice(1);
  const demoNote = isDemo ? '<div style="background: #fef3c7; color: #92400e; padding: 1rem; border-radius: 8px; margin: 1rem 0;"><strong>Demo Mode:</strong> This is a demonstration. No payment was processed.</div>' : '';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Purchase ${isDemo ? 'Demo ' : ''}Successful - BotFlo.ai</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                margin: 0; padding: 1rem; color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center;
            }
            .container { 
                max-width: 600px; width: 100%; text-align: center; 
                background: white; color: #333; padding: 2rem; border-radius: 16px; 
                box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
            }
            .success-icon { font-size: 4rem; margin-bottom: 1rem; }
            h1 { color: #10b981; margin-bottom: 1rem; }
            .download-btn { 
                background: #10b981; color: white; padding: 1rem 2rem; 
                text-decoration: none; border-radius: 8px; display: inline-block; 
                margin: 1rem; font-weight: 600; transition: all 0.3s;
            }
            .download-btn:hover { background: #059669; transform: translateY(-2px); }
            .support-info { 
                background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 1rem 0; 
                border-left: 4px solid #667eea;
            }
            .back-link { 
                color: #667eea; text-decoration: none; font-weight: 500; 
                display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 2rem;
            }
            .back-link:hover { text-decoration: underline; }
            .tips { background: #e0e7ff; padding: 1.5rem; border-radius: 8px; margin: 1rem 0; }
            .tips h3 { color: #3730a3; margin-bottom: 1rem; }
            .tips ul { text-align: left; color: #4338ca; }
            .tips li { margin-bottom: 0.5rem; }
            @media (max-width: 768px) {
                .container { margin: 0; padding: 1.5rem; }
                .success-icon { font-size: 3rem; }
                h1 { font-size: 1.75rem; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="success-icon">${isDemo ? '🎯' : '✅'}</div>
            <h1>${isDemo ? 'Demo' : 'Purchase'} Successful!</h1>
            <p>Thank you for ${isDemo ? 'trying' : 'purchasing'} the <strong>${botName} Bot</strong>!</p>
            
            ${demoNote}
            
            ${type === 'download' ? `
                <div class="support-info">
                    <h3>📦 Your Bot Code is Ready</h3>
                    <p>Download your complete bot source code below:</p>
                    <a href="/api/download/${downloadToken}" class="download-btn">
                        📥 Download Bot Code
                    </a>
                    <p><small>Includes: HTML, JavaScript, documentation, and customization guide</small></p>
                    <h3>🚀 Your Hosted Bot is Being Set Up</h3>
                    <p>Your bot will be live at: <strong>${bot}-${sessionId.slice(-8)}.botflo.ai</strong></p>
                    <p>Setup will complete within 24 hours. You'll receive an email with:</p>
                    <ul style="text-align: left; margin: 1rem 0;">
                        <li>Your bot's live URL</li>
                        <li>Dashboard access credentials</li>
                        <li>File upload instructions</li>
                        <li>Customization options</li>
                    </ul>
                    <a href="mailto:support@botflo.ai?subject=Bot Setup - ${sessionId}" class="download-btn">
                        📧 Contact Support
                    </a>
                    ${isDemo ? '<p><small><em>Demo hosting is for testing only - not a live service</em></small></p>' : ''}
                </div>
            ` : ''}
            
            <div class="tips">
                <h3>🎯 Quick Start Tips</h3>
                <ul>
                    <li>Check your email for detailed setup instructions</li>
                    <li>Join our Discord community: <strong>discord.gg/botflo</strong></li>
                    <li>Need help? Email <strong>support@botflo.ai</strong></li>
                    <li>View documentation at <strong>docs.botflo.ai</strong></li>
                </ul>
            </div>
            
            <a href="/botflo-marketplace.html" class="back-link">
                ← Back to Marketplace
            </a>
        </div>
    </body>
    </html>
  `;
}

// Download endpoint for purchased bots
app.get('/api/download/:token', (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).send('Download token required');
    }
    
    // In production, verify token in database
    // For now, we'll extract bot type from token
    const botType = token.replace('download_', '').replace(/_\d+$/, '');
    
    logger.info(`Download request for token: ${token}, botType: ${botType}`);
    
    // Generate bot code
    const botCode = generateBotCode(botType, {
      title: `Custom ${botType.charAt(0).toUpperCase() + botType.slice(1)} Bot`,
      isPaid: true,
      downloadToken: token
    });
    
    // Set headers for download
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${botType}-bot.html"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    res.send(botCode);
    
  } catch (error) {
    logger.error(`Download error: ${error.message}`);
    res.status(500).send('Download failed');
  }
});

// Email notification signup
app.post('/api/notify', (req, res) => {
  try {
    const { email, botType } = req.body;
    
    if (!email || !botType) {
      return res.status(400).json({ error: 'Email and bot type required' });
    }
    
    // Store notification request (in production, save to database)
    logger.info(`Notification signup: ${email} for ${botType} bot`);
    
    // TODO: Add to email list, send confirmation
    
    res.json({ success: true, message: "You'll be notified when this bot is ready!" });
    
  } catch (error) {
    logger.error(`Notification signup error: ${error.message}`);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Demo bot endpoints - Enhanced
app.get('/demo/:botType', (req, res) => {
  const { botType } = req.params;
  
  // Generate demo bot HTML
  const demoCode = generateBotCode(botType, {
    botName: `${botType.charAt(0).toUpperCase() + botType.slice(1)} Bot Demo`,
    primaryColor: '#667eea',
    welcomeMessage: 'This is a live demo! Try asking about our services.',
    animationStyle: 'slideUp',
    botSize: 350
  }, []);
  
  res.send(demoCode);
});

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// API Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    marketplace: 'active',
    payments: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured',
    database: 'optional',
    bots_available: ['restaurant', 'support', 'realestate'],
    last_updated: '2025-06-26'
  });
});

// Redirect root to marketplace
app.get('/', (req, res) => {
  res.redirect('/botflo-marketplace.html');
});

app.get('/botflo-marketplace.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'botflo-marketplace.html'));
});

// Bot Builder route
app.get('/bot-builder', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'bot-builder.html'));
});

app.get('/builder/:type', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'bot-builder.html'));
});

// Additional footer routes
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/careers', (req, res) => {
  res.redirect('/#contact'); // Redirect to contact section for now
});

app.get('/status', (req, res) => {
  res.json({ status: 'All systems operational', timestamp: new Date().toISOString() });
});

app.get('/api', (req, res) => {
  res.redirect('/docs'); // Redirect to documentation
});

app.get('/changelog', (req, res) => {
  res.redirect('/blog'); // Redirect to blog for now
});

app.get('/cookies', (req, res) => {
  res.redirect('/privacy'); // Redirect to privacy policy
});

app.get('/security', (req, res) => {
  res.redirect('/docs'); // Redirect to documentation
});

// Start the server
app.listen(port, () => {
  logger.info(`BotFlo.ai server running on port ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Health check: http://localhost:${port}/api/health`);
  
  // Show revenue recovery progress
  const dailyTarget = 277 / 30; // $9.23/day needed
  logger.info(`💰 Revenue target: $${dailyTarget.toFixed(2)}/day to recover $277 in 30 days`);
});
