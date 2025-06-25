const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Chatbot = require('../models/Chatbot');
const { authenticate, checkSubscription } = require('../middleware/auth');
const inMemoryStorage = require('../storage/inMemoryStorage');

const router = express.Router();

// Helper function to check if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

// Get all chatbots for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    if (isMongoConnected()) {
      const query = { userId: req.user._id };
      
      if (status) {
        query.status = status;
      }

      const chatbots = await Chatbot.find(query)
        .sort({ updatedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Chatbot.countDocuments(query);

      res.json({
        chatbots,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } else {
      // Use in-memory storage
      let chatbots = await inMemoryStorage.findChatbotsByUserId(req.user.id || req.user._id);
      
      if (status) {
        chatbots = chatbots.filter(bot => bot.status === status);
      }

      const total = chatbots.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedChatbots = chatbots.slice(startIndex, endIndex);

      res.json({
        chatbots: paginatedChatbots,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    }
  } catch (error) {
    console.error('Get chatbots error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific chatbot
router.get('/:id', authenticate, async (req, res) => {
  try {
    const chatbot = await Chatbot.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    res.json({ chatbot });
  } catch (error) {
    console.error('Get chatbot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new chatbot
router.post('/', [
  authenticate,
  body('name').trim().isLength({ min: 1 }).withMessage('Chatbot name is required'),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    // Check chatbot limits based on subscription
    let userChatbots;
    if (isMongoConnected()) {
      userChatbots = await Chatbot.countDocuments({ userId: req.user._id });
    } else {
      userChatbots = await inMemoryStorage.countChatbotsByUserId(req.user.id || req.user._id);
    }
    
    const limits = {
      starter: 1,
      professional: 5,
      enterprise: Infinity
    };

    const userLimit = limits[req.user.subscription.plan] || 1;
    if (userChatbots >= userLimit) {
      return res.status(403).json({ 
        error: 'Chatbot limit reached for your subscription plan',
        currentCount: userChatbots,
        limit: userLimit,
        plan: req.user.subscription.plan,
        upgradeRequired: true
      });
    }

    const { name, description, config } = req.body;

    if (isMongoConnected()) {
      const chatbot = new Chatbot({
        name,
        description,
        userId: req.user._id,
        config: {
          ...config,
          welcomeMessage: config?.welcomeMessage || 'Hello! How can I help you today?'
        }
      });

      await chatbot.save();

      // Update user's chatbot count
      req.user.usage.chatbots = userChatbots + 1;
      await req.user.save();

      res.status(201).json({
        message: 'Chatbot created successfully',
        chatbot
      });
    } else {
      // Use in-memory storage
      const chatbot = await inMemoryStorage.createChatbot({
        name,
        description,
        userId: req.user.id || req.user._id,
        config: {
          welcomeMessage: config?.welcomeMessage || 'Hello! How can I help you today?',
          theme: config?.theme || 'default',
          avatar: config?.avatar,
          language: config?.language || 'en',
          timezone: config?.timezone || 'UTC'
        },
        flow: {
          nodes: [],
          connections: []
        },
        knowledgeBase: [],
        integrations: {
          website: {
            enabled: false,
            domains: [],
            embedCode: ''
          },
          api: {
            enabled: false,
            webhook: '',
            apiKey: ''
          }
        }
      });

      // Update user's chatbot count
      const updatedUser = await inMemoryStorage.updateUser(req.user.id || req.user._id, {
        usage: {
          ...req.user.usage,
          chatbots: userChatbots + 1
        }
      });

      res.status(201).json({
        message: 'Chatbot created successfully (in-memory storage)',
        chatbot
      });
    }

  } catch (error) {
    console.error('Create chatbot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a chatbot
router.put('/:id', [
  authenticate,
  body('name').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const chatbot = await Chatbot.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    const { name, description, config, flow, knowledgeBase, integrations, status } = req.body;

    // Update fields if provided
    if (name) chatbot.name = name;
    if (description !== undefined) chatbot.description = description;
    if (config) chatbot.config = { ...chatbot.config, ...config };
    if (flow) chatbot.flow = flow;
    if (knowledgeBase) chatbot.knowledgeBase = knowledgeBase;
    if (integrations) chatbot.integrations = { ...chatbot.integrations, ...integrations };
    if (status) chatbot.status = status;

    await chatbot.save();

    res.json({
      message: 'Chatbot updated successfully',
      chatbot
    });

  } catch (error) {
    console.error('Update chatbot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a chatbot
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const chatbot = await Chatbot.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    await Chatbot.deleteOne({ _id: req.params.id });

    // Update user's chatbot count
    const userChatbots = await Chatbot.countDocuments({ userId: req.user._id });
    req.user.usage.chatbots = userChatbots;
    await req.user.save();

    res.json({ message: 'Chatbot deleted successfully' });

  } catch (error) {
    console.error('Delete chatbot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Duplicate a chatbot
router.post('/:id/duplicate', authenticate, async (req, res) => {
  try {
    const originalChatbot = await Chatbot.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!originalChatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    // Check chatbot limits
    const userChatbots = await Chatbot.countDocuments({ userId: req.user._id });
    const limits = {
      starter: 1,
      professional: 5,
      enterprise: Infinity
    };

    const userLimit = limits[req.user.subscription.plan] || 1;
    if (userChatbots >= userLimit) {
      return res.status(403).json({ 
        error: 'Chatbot limit reached',
        currentCount: userChatbots,
        limit: userLimit,
        plan: req.user.subscription.plan
      });
    }

    // Create duplicate
    const duplicatedChatbot = new Chatbot({
      name: `${originalChatbot.name} (Copy)`,
      description: originalChatbot.description,
      userId: req.user._id,
      config: originalChatbot.config,
      flow: originalChatbot.flow,
      knowledgeBase: originalChatbot.knowledgeBase,
      status: 'draft'
    });

    await duplicatedChatbot.save();

    // Update user's chatbot count
    req.user.usage.chatbots = userChatbots + 1;
    await req.user.save();

    res.status(201).json({
      message: 'Chatbot duplicated successfully',
      chatbot: duplicatedChatbot
    });

  } catch (error) {
    console.error('Duplicate chatbot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get chatbot analytics
router.get('/:id/analytics', authenticate, async (req, res) => {
  try {
    const chatbot = await Chatbot.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    // In a real implementation, you would fetch analytics from a separate collection
    // For now, return the basic analytics stored in the chatbot document
    res.json({
      analytics: chatbot.analytics,
      chatbotId: chatbot._id,
      name: chatbot.name
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

