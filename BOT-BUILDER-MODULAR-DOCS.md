# BotFlo.ai - Modular Bot Builder Architecture

## Overview

The BotFlo.ai bot builder has been refactored into a modular, maintainable architecture that separates concerns and makes development easier. This document outlines the architecture, modules, and how to work with the system.

## Architecture

### Core Principles

1. **Modularity**: Each major feature is in its own module
2. **Separation of Concerns**: UI, API, business logic are separated
3. **Maintainability**: Code is organized logically and documented
4. **Extensibility**: New features can be added without breaking existing code
5. **Testability**: Modules can be tested independently

### Module Structure

```
/public/js/bot-builder/
├── bot-builder-core.js          # Main orchestrator
├── bot-builder-api.js           # API communication
├── bot-builder-ui.js            # UI management
├── bot-builder-preview.js       # Live preview
├── bot-builder-properties.js    # Properties panel
├── bot-builder-templates.js     # Template management
├── bot-builder-visual.js        # Visual flow builder
└── bot-builder-deployment.js    # Deployment & distribution

/public/css/bot-builder/
└── bot-builder.css              # Unified styles

/public/components/bot-builder/
└── (Future component templates)
```

## Module Documentation

### 1. BotBuilderCore (`bot-builder-core.js`)

**Purpose**: Main orchestrator that coordinates all modules

**Key Responsibilities**:
- Initialize and manage all sub-modules
- Handle bot state management
- Coordinate data flow between modules
- Handle global events and shortcuts
- Auto-save functionality

**Key Methods**:
- `initialize()` - Setup the entire application
- `updateBotProperty(property, value)` - Update bot configuration
- `saveBot()` - Save bot to backend
- `deployBot()` - Deploy bot to production
- `changeBotType(type)` - Switch bot templates

**Usage**:
```javascript
const botBuilder = new BotBuilderCore();
await botBuilder.initialize();
botBuilder.updateBotProperty('name', 'New Bot Name');
```

### 2. BotBuilderAPI (`bot-builder-api.js`)

**Purpose**: Handle all API communication with the backend

**Key Responsibilities**:
- REST API calls to bot-builder-api.js
- Error handling and retry logic
- Request/response transformation
- Authentication handling

**Key Methods**:
- `createBot(config)` - Create new bot
- `updateBot(botId, config)` - Update bot
- `deployBot(botId)` - Deploy bot
- `getTemplates()` - Get available templates
- `sendMessage(botId, message)` - Chat API

**Usage**:
```javascript
const api = new BotBuilderAPI();
const bot = await api.createBot({ name: 'My Bot' });
```

### 3. BotBuilderUI (`bot-builder-ui.js`)

**Purpose**: Manage UI interactions and state

**Key Responsibilities**:
- Tab system management
- Sidebar functionality
- Notification system
- Keyboard shortcuts
- Responsive behavior

**Key Methods**:
- `switchTab(tabName)` - Change active tab
- `showNotification(message, type)` - Display notifications
- `toggleSidebar()` - Show/hide sidebar
- `updateSaveButtonState()` - Update button states

### 4. BotBuilderPreview (`bot-builder-preview.js`)

**Purpose**: Live preview of the bot being built

**Key Responsibilities**:
- Real-time chat simulation
- Bot response generation
- Chat history management
- Preview styling updates

**Key Methods**:
- `sendMessage()` - Send test message
- `addMessage(text, sender)` - Add message to chat
- `resetChat()` - Clear chat history
- `toggle()` - Show/hide preview

### 5. BotBuilderProperties (`bot-builder-properties.js`)

**Purpose**: Handle the properties panel and form interactions

**Key Responsibilities**:
- Form generation and management
- Property validation
- Quick action sections
- Integration configuration

**Key Methods**:
- `loadQuickActionContent(section)` - Load property forms
- `updateQuickAction(index, value)` - Update quick actions
- `toggleIntegration(integration, enabled)` - Toggle integrations

### 6. BotBuilderTemplates (`bot-builder-templates.js`)

**Purpose**: Manage bot templates and template operations

**Key Responsibilities**:
- Built-in template management
- Custom template creation
- Template application
- Template categorization

**Key Methods**:
- `getTemplate(templateId)` - Get specific template
- `applyTemplate(templateId)` - Apply template to current bot
- `createCustomTemplate(name, description)` - Save current bot as template

### 7. BotBuilderVisual (`bot-builder-visual.js`)

**Purpose**: Visual flow builder for conversation design

**Key Responsibilities**:
- Canvas management
- Node creation and editing
- Connection handling
- Flow validation

**Key Methods**:
- `addNode(type, position)` - Add new flow node
- `selectNode(nodeId)` - Select and edit node
- `updateNodeProperty(nodeId, property, value)` - Update node
- `deleteNode(nodeId)` - Remove node

### 8. BotBuilderDeployment (`bot-builder-deployment.js`)

**Purpose**: Handle bot deployment and distribution

**Key Responsibilities**:
- Deployment management
- Embed code generation
- Deployment history
- Integration examples

**Key Methods**:
- `deployBot()` - Deploy to production
- `testBot()` - Validate bot configuration
- `generateEmbedCode()` - Create embed snippets

## Data Flow

### Bot Configuration Structure

```javascript
{
  id: 'bot_123',
  name: 'Customer Service Bot',
  type: 'customer-service',
  icon: '🤖',
  welcome: 'Hello! How can I help you?',
  description: 'A helpful customer service bot',
  
  // Conversation flow
  nodes: [
    {
      id: 'node_1',
      type: 'message',
      content: 'Welcome message',
      position: { x: 100, y: 100 },
      config: {}
    }
  ],
  edges: [
    {
      id: 'edge_1',
      from: 'node_1',
      to: 'node_2'
    }
  ],
  
  // UI Configuration
  quickActions: ['Get Help', 'Contact Support'],
  responses: {
    greeting: 'Hello!',
    fallback: 'I did not understand',
    goodbye: 'Goodbye!'
  },
  
  // Styling
  style: {
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    size: 'medium',
    position: 'bottom-right',
    theme: 'modern'
  },
  
  // Settings
  settings: {
    analytics: true,
    fileUploads: true,
    userRegistration: false
  },
  
  // Integrations
  integrations: {
    webhook: { url: 'https://...' },
    email: { address: 'notify@...' },
    slack: { webhookUrl: 'https://...' }
  },
  
  // Deployment
  deployment: {
    status: 'deployed',
    url: 'https://bot.botflo.ai/bot_123',
    embedCode: '<script>...</script>',
    lastDeployed: '2025-06-27T...'
  }
}
```

### Event Flow

1. **User Action** → UI Module handles interaction
2. **UI Module** → Core updates bot state
3. **Core** → Notifies all modules of state change
4. **Modules** → Update their respective UI sections
5. **Core** → Auto-saves changes (debounced)

## Development Workflow

### Adding a New Feature

1. **Identify the module** that should handle the feature
2. **Add method** to the appropriate module
3. **Update the core** if coordination is needed
4. **Add UI elements** to the HTML and CSS
5. **Test integration** with other modules

### Example: Adding a New Property

```javascript
// 1. Add to BotBuilderProperties
updateCustomProperty(key, value) {
    this.core.updateBotProperty(`custom.${key}`, value);
}

// 2. Add form field in loadBasicProperties()
<div class="form-group">
    <label class="form-label">Custom Property</label>
    <input type="text" 
           onchange="window.botBuilder.modules.properties.updateCustomProperty('myProp', this.value)">
</div>

// 3. Update bot configuration structure
{
    custom: {
        myProp: 'value'
    }
}
```

### Testing

Each module can be tested independently:

```javascript
// Test API module
const api = new BotBuilderAPI();
const result = await api.createBot(testConfig);

// Test properties module
const props = new BotBuilderProperties(mockCore);
props.updateQuickAction(0, 'New Action');
```

## Best Practices

### Code Organization

1. **One responsibility per module**
2. **Clear method naming**
3. **Consistent error handling**
4. **Comprehensive documentation**

### State Management

1. **Single source of truth** (Core manages bot state)
2. **Immutable updates** where possible
3. **Event-driven updates** between modules
4. **Auto-save for user convenience**

### UI/UX

1. **Responsive design** for all screen sizes
2. **Keyboard shortcuts** for power users
3. **Loading states** for async operations
4. **Clear error messages** with recovery options

### Performance

1. **Debounced auto-save** to prevent excessive API calls
2. **Lazy loading** of non-critical features
3. **Efficient DOM updates** using minimal re-renders
4. **Image optimization** for icons and previews

## API Integration

The modular bot builder connects to the backend API defined in `/api/bot-builder-api.js`:

### Key Endpoints

- `POST /api/bots` - Create bot
- `PUT /api/bots/:id` - Update bot
- `GET /api/bots/:id` - Get bot
- `POST /api/bots/:id/deploy` - Deploy bot
- `GET /api/templates` - Get templates
- `POST /api/chat` - Send message

### Error Handling

```javascript
try {
    const result = await api.createBot(config);
} catch (error) {
    if (api.isNetworkError(error)) {
        // Handle network issues
    } else if (api.isAuthError(error)) {
        // Handle authentication
    } else {
        // Handle other errors
    }
}
```

## Future Enhancements

### Planned Features

1. **Real-time collaboration** - Multiple users editing simultaneously
2. **Version control** - Bot configuration versioning
3. **A/B testing** - Deploy multiple bot versions
4. **Advanced analytics** - Detailed conversation analytics
5. **Plugin system** - Third-party extensions

### Extensibility Points

1. **Module system** - Add new functionality modules
2. **Template system** - Custom template types
3. **Integration system** - New third-party integrations
4. **Theme system** - Custom UI themes

## Troubleshooting

### Common Issues

1. **Module not initializing**
   - Check console for errors
   - Verify all dependencies are loaded
   - Ensure correct load order

2. **API calls failing**
   - Check network connectivity
   - Verify API endpoints are running
   - Check authentication tokens

3. **UI not updating**
   - Verify module update methods are called
   - Check for JavaScript errors
   - Ensure proper event handling

### Debug Mode

Enable debug mode for detailed logging:

```javascript
window.botBuilder.debugMode = true;
```

## Contributing

### Code Style

1. **Use ES6+ features** where appropriate
2. **Follow consistent naming** conventions
3. **Add JSDoc comments** for all public methods
4. **Include error handling** in all async operations

### Pull Request Process

1. **Create feature branch** from main
2. **Add tests** for new functionality
3. **Update documentation** as needed
4. **Ensure all tests pass**
5. **Submit PR** with clear description

This modular architecture provides a solid foundation for the BotFlo.ai bot builder, making it easier to maintain, extend, and scale the application.
