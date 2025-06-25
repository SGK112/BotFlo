// In-memory storage for testing when MongoDB is not available
class InMemoryStorage {
  constructor() {
    this.users = new Map();
    this.chatbots = new Map();
    this.userIdCounter = 1;
    this.chatbotIdCounter = 1;
  }

  // User methods
  async createUser(userData) {
    const id = this.userIdCounter++;
    const user = {
      _id: id.toString(),
      ...userData,
      createdAt: new Date(),
      subscription: {
        plan: 'starter',
        status: 'active',
        trialEndsAt: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null
      },
      usage: {
        chatbots: 0,
        conversations: 0,
        lastReset: new Date()
      }
    };
    this.users.set(user.email, user);
    return user;
  }

  async findUserByEmail(email) {
    return this.users.get(email) || null;
  }

  async findUserById(id) {
    for (const user of this.users.values()) {
      if (user._id === id) {
        return user;
      }
    }
    return null;
  }

  async updateUser(id, updates) {
    const user = await this.findUserById(id);
    if (user) {
      Object.assign(user, updates);
      this.users.set(user.email, user);
      return user;
    }
    return null;
  }

  // Chatbot methods
  async createChatbot(chatbotData) {
    const id = this.chatbotIdCounter++;
    const chatbot = {
      _id: id.toString(),
      ...chatbotData,
      createdAt: new Date(),
      updatedAt: new Date(),
      analytics: {
        totalConversations: 0,
        totalMessages: 0,
        averageRating: 0,
        lastActive: null
      }
    };
    this.chatbots.set(chatbot._id, chatbot);
    return chatbot;
  }

  async findChatbotsByUserId(userId) {
    const userChatbots = [];
    for (const chatbot of this.chatbots.values()) {
      if (chatbot.userId === userId) {
        userChatbots.push(chatbot);
      }
    }
    return userChatbots.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  async findChatbotById(id) {
    return this.chatbots.get(id) || null;
  }

  async updateChatbot(id, updates) {
    const chatbot = this.chatbots.get(id);
    if (chatbot) {
      Object.assign(chatbot, updates, { updatedAt: new Date() });
      this.chatbots.set(id, chatbot);
      return chatbot;
    }
    return null;
  }

  async deleteChatbot(id) {
    return this.chatbots.delete(id);
  }

  async countChatbotsByUserId(userId) {
    let count = 0;
    for (const chatbot of this.chatbots.values()) {
      if (chatbot.userId === userId) {
        count++;
      }
    }
    return count;
  }
}

module.exports = new InMemoryStorage();

