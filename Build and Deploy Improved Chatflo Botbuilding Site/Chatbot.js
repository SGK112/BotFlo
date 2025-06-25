const mongoose = require('mongoose');

const chatbotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'active', 'inactive'], default: 'draft' },
  
  // Chatbot configuration
  config: {
    welcomeMessage: { type: String, default: 'Hello! How can I help you today?' },
    theme: { type: String, default: 'default' },
    avatar: { type: String },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' }
  },
  
  // Flow data for the visual builder
  flow: {
    nodes: [{ type: mongoose.Schema.Types.Mixed }],
    connections: [{ type: mongoose.Schema.Types.Mixed }]
  },
  
  // Knowledge base and training data
  knowledgeBase: [{
    type: { type: String, enum: ['text', 'url', 'file'] },
    content: { type: String },
    source: { type: String }
  }],
  
  // Integration settings
  integrations: {
    website: {
      enabled: { type: Boolean, default: false },
      domains: [{ type: String }],
      embedCode: { type: String }
    },
    api: {
      enabled: { type: Boolean, default: false },
      webhook: { type: String },
      apiKey: { type: String }
    }
  },
  
  // Analytics data
  analytics: {
    totalConversations: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    lastActive: { type: Date }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
chatbotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Chatbot', chatbotSchema);

