// Chatbot Execution Engine
class ChatbotExecutor {
  constructor(chatbotData, sessionData = {}) {
    this.nodes = new Map(chatbotData.nodes || []);
    this.connections = chatbotData.connections || [];
    this.sessionData = sessionData;
    this.variables = sessionData.variables || {};
    this.currentNodeId = sessionData.currentNodeId || this.findStartNode();
    this.conversationHistory = sessionData.history || [];
  }

  findStartNode() {
    for (let [id, node] of this.nodes) {
      if (node.type === 'start') {
        return id;
      }
    }
    throw new Error('No start node found in chatbot');
  }

  async processMessage(userMessage) {
    try {
      // Add user message to history
      this.conversationHistory.push({
        type: 'user',
        message: userMessage,
        timestamp: new Date().toISOString()
      });

      // Store user input as variable
      this.variables.lastUserInput = userMessage;

      // Process current node
      const currentNode = this.nodes.get(this.currentNodeId);
      if (!currentNode) {
        throw new Error('Current node not found');
      }

      const response = await this.executeNode(currentNode, userMessage);
      
      // Add bot response to history
      if (response.message) {
        this.conversationHistory.push({
          type: 'bot',
          message: response.message,
          timestamp: new Date().toISOString()
        });
      }

      return {
        success: true,
        message: response.message,
        nextNodeId: response.nextNodeId,
        variables: this.variables,
        sessionData: {
          currentNodeId: response.nextNodeId,
          variables: this.variables,
          history: this.conversationHistory
        },
        actions: response.actions || []
      };

    } catch (error) {
      console.error('Error processing message:', error);
      return {
        success: false,
        error: error.message,
        message: "I'm sorry, I encountered an error. Please try again."
      };
    }
  }

  async executeNode(node, userInput) {
    switch (node.type) {
      case 'start':
        return this.executeStartNode(node);
      case 'message':
        return this.executeMessageNode(node);
      case 'question':
        return this.executeQuestionNode(node, userInput);
      case 'condition':
        return this.executeConditionNode(node);
      case 'api':
        return await this.executeApiNode(node);
      case 'ai':
        return await this.executeAiNode(node, userInput);
      case 'delay':
        return await this.executeDelayNode(node);
      case 'webhook':
        return await this.executeWebhookNode(node);
      case 'database':
        return await this.executeDatabaseNode(node);
      case 'end':
        return this.executeEndNode(node);
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  executeStartNode(node) {
    const nextNodeId = this.getNextNodeId(node.id);
    return {
      message: node.data.message || "Hello! How can I help you today?",
      nextNodeId
    };
  }

  executeMessageNode(node) {
    const message = this.interpolateVariables(node.data.message || "");
    const nextNodeId = this.getNextNodeId(node.id);
    
    return {
      message,
      nextNodeId
    };
  }

  executeQuestionNode(node, userInput) {
    const question = this.interpolateVariables(node.data.message || "");
    
    // Store user's answer
    if (userInput && node.data.variableName) {
      this.variables[node.data.variableName] = userInput;
    }

    // Validate input based on type
    if (userInput && node.data.inputType) {
      const validation = this.validateInput(userInput, node.data);
      if (!validation.valid) {
        return {
          message: validation.error,
          nextNodeId: node.id // Stay on same node
        };
      }
    }

    const nextNodeId = this.getNextNodeId(node.id);
    return {
      message: question,
      nextNodeId,
      actions: node.data.inputType === 'choice' ? [{
        type: 'showChoices',
        choices: node.data.choices || []
      }] : []
    };
  }

  executeConditionNode(node) {
    const variable = this.getVariable(node.data.variable);
    const value = node.data.value;
    const operator = node.data.operator || 'equals';

    let conditionMet = false;

    switch (operator) {
      case 'equals':
        conditionMet = variable == value;
        break;
      case 'greater':
        conditionMet = parseFloat(variable) > parseFloat(value);
        break;
      case 'less':
        conditionMet = parseFloat(variable) < parseFloat(value);
        break;
      case 'contains':
        conditionMet = String(variable).toLowerCase().includes(String(value).toLowerCase());
        break;
    }

    const outputIndex = conditionMet ? 0 : 1; // true or false output
    const nextNodeId = this.getNextNodeId(node.id, outputIndex);

    return {
      message: null, // Condition nodes don't send messages
      nextNodeId
    };
  }

  async executeApiNode(node) {
    try {
      const url = this.interpolateVariables(node.data.apiUrl || "");
      const method = node.data.method || 'GET';
      const headers = node.data.headers || {};
      const body = node.data.body || {};

      const config = {
        method,
        url,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      if (method !== 'GET' && Object.keys(body).length > 0) {
        config.data = body;
      }

      const response = await axios(config);
      
      // Store API response in variables
      this.variables.apiResponse = response.data;
      this.variables.apiStatus = response.status;

      const nextNodeId = this.getNextNodeId(node.id);
      return {
        message: node.data.successMessage || "API call completed successfully.",
        nextNodeId
      };

    } catch (error) {
      console.error('API call failed:', error);
      const nextNodeId = this.getNextNodeId(node.id);
      return {
        message: node.data.errorMessage || "Sorry, there was an error processing your request.",
        nextNodeId
      };
    }
  }

  async executeAiNode(node, userInput) {
    try {
      const prompt = this.interpolateVariables(node.data.prompt || userInput);
      const model = node.data.model || 'gpt-3.5-turbo';
      const temperature = node.data.temperature || 0.7;

      // Make API call to our server's AI endpoint
      const response = await fetch('/api/ai/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          context: this.buildAiContext(),
          model,
          temperature
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const nextNodeId = this.getNextNodeId(node.id);
      return {
        message: data.response,
        nextNodeId
      };

    } catch (error) {
      console.error('AI generation failed:', error);
      const nextNodeId = this.getNextNodeId(node.id);
      return {
        message: "I'm having trouble generating a response right now. Please try again.",
        nextNodeId
      };
    }
  }

  async executeDelayNode(node) {
    const duration = parseFloat(node.data.duration || 1) * 1000;
    
    await new Promise(resolve => setTimeout(resolve, duration));
    
    const nextNodeId = this.getNextNodeId(node.id);
    return {
      message: null,
      nextNodeId,
      actions: [{
        type: 'typing',
        duration: duration
      }]
    };
  }

  async executeWebhookNode(node) {
    try {
      const url = this.interpolateVariables(node.data.webhookUrl || "");
      const payload = {
        variables: this.variables,
        timestamp: new Date().toISOString(),
        nodeId: node.id
      };

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const nextNodeId = this.getNextNodeId(node.id);
      return {
        message: node.data.message || null,
        nextNodeId
      };

    } catch (error) {
      console.error('Webhook failed:', error);
      const nextNodeId = this.getNextNodeId(node.id);
      return {
        message: node.data.errorMessage || null,
        nextNodeId
      };
    }
  }

  async executeDatabaseNode(node) {
    // Database operations would be implemented here
    // For now, just simulate success
    const nextNodeId = this.getNextNodeId(node.id);
    return {
      message: node.data.message || "Database operation completed.",
      nextNodeId
    };
  }

  executeEndNode(node) {
    return {
      message: node.data.message || "Thank you for chatting with me!",
      nextNodeId: null // Conversation ends
    };
  }

  getNextNodeId(currentNodeId, outputIndex = 0) {
    const connection = this.connections.find(conn => 
      conn.from.nodeId === currentNodeId && 
      (conn.from.outputIndex === outputIndex || conn.from.outputIndex === undefined)
    );
    
    return connection ? connection.to.nodeId : null;
  }

  interpolateVariables(text) {
    if (!text) return text;
    
    return text.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, varPath) => {
      return this.getVariable(varPath) || match;
    });
  }

  getVariable(path) {
    const keys = path.split('.');
    let value = this.variables;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return '';
      }
    }
    
    return value;
  }

  validateInput(input, nodeData) {
    const inputType = nodeData.inputType;
    
    switch (inputType) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input)) {
          return {
            valid: false,
            error: "Please enter a valid email address."
          };
        }
        break;
        
      case 'number':
        if (isNaN(parseFloat(input))) {
          return {
            valid: false,
            error: "Please enter a valid number."
          };
        }
        break;
        
      case 'choice':
        const choices = nodeData.choices || [];
        if (!choices.includes(input)) {
          return {
            valid: false,
            error: `Please select one of: ${choices.join(', ')}`
          };
        }
        break;
    }
    
    return { valid: true };
  }

  buildAiContext() {
    const recentHistory = this.conversationHistory.slice(-5);
    let context = "You are a helpful chatbot assistant. ";
    
    if (recentHistory.length > 0) {
      context += "Recent conversation:\n";
      recentHistory.forEach(entry => {
        context += `${entry.type}: ${entry.message}\n`;
      });
    }
    
    if (Object.keys(this.variables).length > 0) {
      context += "\nKnown information:\n";
      Object.entries(this.variables).forEach(([key, value]) => {
        if (key !== 'lastUserInput' && typeof value === 'string') {
          context += `${key}: ${value}\n`;
        }
      });
    }
    
    return context;
  }
}

// Chatbot Testing Framework
class ChatbotTester {
  constructor(chatbotData) {
    this.chatbotData = chatbotData;
  }

  async runTests(testScenarios = []) {
    const results = {
      totalTests: testScenarios.length,
      passed: 0,
      failed: 0,
      tests: []
    };

    for (const scenario of testScenarios) {
      const testResult = await this.runSingleTest(scenario);
      results.tests.push(testResult);
      
      if (testResult.passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    }

    return results;
  }

  async runSingleTest(scenario) {
    try {
      const executor = new ChatbotExecutor(this.chatbotData, {});
      let currentResponse = null;
      
      for (const step of scenario.steps) {
        const response = await executor.processMessage(step.input);
        currentResponse = response;
        
        // Check if response matches expected output
        if (step.expectedOutput && !response.message.includes(step.expectedOutput)) {
          return {
            name: scenario.name,
            passed: false,
            error: `Expected "${step.expectedOutput}" but got "${response.message}"`
          };
        }
      }

      return {
        name: scenario.name,
        passed: true,
        finalResponse: currentResponse
      };

    } catch (error) {
      return {
        name: scenario.name,
        passed: false,
        error: error.message
      };
    }
  }
}

// Export for use in server
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ChatbotExecutor, ChatbotTester };
}
