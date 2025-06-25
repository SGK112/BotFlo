# ChatFlo - Professional AI Chatbot Builder

![ChatFlo Logo](https://img.shields.io/badge/ChatFlo-AI%20Chatbot%20Builder-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-2.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-20.18.0-brightgreen?style=for-the-badge)

## 🚀 Overview

ChatFlo is a comprehensive, professional-grade AI chatbot building platform that enables users to create, deploy, and manage intelligent conversational agents without any coding knowledge. Built with modern web technologies and featuring a sophisticated subscription-based business model, ChatFlo provides everything needed to build, test, and deploy chatbots across multiple platforms.

### ✨ Key Features

- **Visual Drag-and-Drop Builder**: Intuitive interface for creating complex conversation flows
- **Three-Tier Subscription System**: Starter (Free), Professional ($49/month), Enterprise (Custom)
- **AI-Powered Intelligence**: Integration with OpenAI for natural language processing
- **Multi-Platform Deployment**: Deploy to websites, messaging apps, and social media
- **Advanced Analytics**: Comprehensive performance tracking and user behavior insights
- **Real-Time Testing**: Live preview and testing environment
- **Professional Templates**: 50+ pre-built templates for various industries
- **API Integration**: Connect with external services and databases
- **Enterprise Security**: Bank-level security with encryption and compliance

### 🎯 Target Users

- **Small Businesses**: Looking to automate customer support and lead generation
- **Enterprises**: Requiring scalable chatbot solutions with advanced features
- **Developers**: Seeking to integrate chatbot functionality into existing applications
- **Marketing Teams**: Creating engaging conversational marketing campaigns
- **Customer Support Teams**: Automating routine inquiries and support tasks

## 📋 Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Subscription Plans](#subscription-plans)
- [Deployment](#deployment)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## 🛠 Installation

### Prerequisites

Before installing ChatFlo, ensure you have the following prerequisites installed on your system:

- **Node.js**: Version 20.18.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **MongoDB**: Version 5.0 or higher (optional for development)
- **Git**: For cloning the repository

### Quick Start

1. **Clone the Repository**
   ```bash
   git clone https://github.com/SGK112/chatflo.git
   cd chatflo
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

4. **Start the Development Server**
   ```bash
   npm start
   ```

5. **Access the Application**
   Open your browser and navigate to `http://localhost:3000`

### Detailed Installation Steps

#### Step 1: System Requirements

Ensure your system meets the minimum requirements:

- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **RAM**: Minimum 4GB, recommended 8GB+
- **Storage**: At least 2GB free space
- **Network**: Internet connection for API integrations

#### Step 2: Node.js Installation

If you don't have Node.js installed:

**Windows/macOS:**
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the LTS version
3. Run the installer and follow the setup wizard

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Step 3: MongoDB Setup (Optional)

For production deployment, you'll need MongoDB:

**Using MongoDB Atlas (Recommended):**
1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Add to `.env` file

**Local Installation:**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS with Homebrew
brew install mongodb-community

# Windows
# Download from mongodb.com and follow installer
```

## ⚙️ Configuration

### Environment Variables

ChatFlo uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/chatbot-builder
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chatbot-builder

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# OpenAI Integration (Optional)
OPENAI_API_KEY=your-openai-api-key

# Payment Processing (Stripe)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PROFESSIONAL_PRICE_ID=price_professional_plan_id
STRIPE_ENTERPRISE_PRICE_ID=price_enterprise_plan_id

# Email Service (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Application URLs
BASE_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### Configuration Details

#### Database Configuration

ChatFlo supports both MongoDB and an in-memory storage system for development:

- **Production**: Use MongoDB for persistent data storage
- **Development**: Can use in-memory storage (no database required)
- **Testing**: Automatically uses in-memory storage

#### Authentication Configuration

The application uses JWT (JSON Web Tokens) for authentication:

- **JWT_SECRET**: Used to sign and verify tokens (use a strong, random string)
- **Token Expiration**: Set to 7 days by default
- **Password Hashing**: Uses bcrypt with 12 rounds

#### Payment Configuration

Stripe integration for subscription management:

- **Test Mode**: Use test API keys for development
- **Live Mode**: Use live API keys for production
- **Webhooks**: Configure webhook endpoint for subscription events

## 🎮 Usage

### Getting Started

#### 1. User Registration

New users can register for a free Starter account:

1. Navigate to `/signup`
2. Fill in required information:
   - First Name and Last Name
   - Email Address
   - Company (optional)
   - Role
   - Password (minimum 6 characters)
3. Agree to Terms of Service
4. Click "Create Account"

#### 2. Dashboard Overview

After logging in, users access the main dashboard featuring:

- **Analytics Overview**: Total chatbots, messages, active users, uptime
- **Chatbot Management**: List of created chatbots with status indicators
- **Quick Actions**: Create new chatbot, export data, filter options
- **Performance Metrics**: Real-time statistics and insights

#### 3. Creating Your First Chatbot

**Using the Visual Builder:**

1. Click "Create New Chatbot" from the dashboard
2. Choose a template or start from scratch
3. Use the drag-and-drop interface to add components:
   - Welcome Message
   - Questions and Responses
   - Menu Options
   - Form Inputs
   - Conditional Logic
   - API Integrations

**Builder Components:**

- **Welcome Message**: First interaction with users
- **Question**: Collect user input
- **Menu Options**: Provide multiple choice responses
- **Form Input**: Gather structured data
- **Conditional Logic**: Create branching conversations
- **API Integration**: Connect to external services
- **Google Sheets**: Import/export data
- **PDF Reader**: Process document content

#### 4. Testing Your Chatbot

The live preview feature allows real-time testing:

1. Use the "Live Preview" panel
2. Type messages to test conversation flows
3. Verify all paths and responses
4. Make adjustments as needed

#### 5. Deployment Options

Deploy your chatbot across multiple platforms:

- **Website Widget**: Embed code for websites
- **API Integration**: Use REST API for custom applications
- **Messaging Platforms**: Deploy to Facebook, WhatsApp, Telegram
- **Mobile Apps**: SDK integration available

### Advanced Features

#### Data Sources Integration

Connect your chatbot to various data sources:

**Website Content Import:**
```javascript
// Automatically import FAQ and content from websites
const websiteData = await importWebsiteContent('https://yourwebsite.com');
```

**CSV Data Integration:**
```javascript
// Import structured data from Google Sheets or CSV files
const csvData = await importCSVData('https://docs.google.com/spreadsheets/...');
```

**API Connections:**
```javascript
// Connect to external APIs for dynamic responses
const apiResponse = await connectAPI('https://api.example.com/data');
```

#### Analytics and Insights

Monitor chatbot performance with detailed analytics:

- **Conversation Metrics**: Total conversations, completion rates
- **User Behavior**: Most common questions, drop-off points
- **Performance**: Response times, error rates
- **Satisfaction**: User ratings and feedback

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "securepassword123",
  "confirmPassword": "securepassword123",
  "company": "Example Corp",
  "role": "Developer"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "subscription": {
      "plan": "starter",
      "status": "active"
    }
  },
  "token": "jwt_token_here"
}
```

#### POST /api/auth/login

Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "subscription": {
      "plan": "starter",
      "status": "active"
    },
    "usage": {
      "chatbots": 0,
      "conversations": 0
    }
  },
  "token": "jwt_token_here"
}
```

### Subscription Endpoints

#### GET /api/subscription/plans

Retrieve available subscription plans.

**Response:**
```json
{
  "plans": {
    "starter": {
      "name": "Starter",
      "price": 0,
      "features": {
        "chatbots": 1,
        "conversations": 100,
        "templates": "basic",
        "analytics": false
      }
    },
    "professional": {
      "name": "Professional",
      "price": 49,
      "features": {
        "chatbots": 5,
        "conversations": 5000,
        "templates": "all",
        "analytics": true
      }
    }
  }
}
```

#### GET /api/subscription/current

Get current user's subscription details (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "subscription": {
    "plan": "starter",
    "status": "active",
    "features": {
      "chatbots": 1,
      "conversations": 100,
      "templates": "basic",
      "analytics": false
    },
    "usage": {
      "chatbots": 0,
      "conversations": 0
    }
  }
}
```

### Chatbot Management Endpoints

#### POST /api/chatbots

Create a new chatbot (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "name": "Customer Support Bot",
  "description": "Handles customer inquiries and support requests",
  "config": {
    "welcomeMessage": "Hello! How can I help you today?",
    "theme": "professional",
    "language": "en"
  }
}
```

**Response:**
```json
{
  "message": "Chatbot created successfully",
  "chatbot": {
    "id": "chatbot_id",
    "name": "Customer Support Bot",
    "description": "Handles customer inquiries and support requests",
    "status": "draft",
    "config": {
      "welcomeMessage": "Hello! How can I help you today?",
      "theme": "professional",
      "language": "en"
    },
    "createdAt": "2025-06-25T04:45:28.356Z"
  }
}
```

#### GET /api/chatbots

Retrieve user's chatbots (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Query Parameters:**
- `status`: Filter by status (active, inactive, draft)
- `page`: Page number for pagination (default: 1)
- `limit`: Number of results per page (default: 10)

**Response:**
```json
{
  "chatbots": [
    {
      "id": "chatbot_id",
      "name": "Customer Support Bot",
      "status": "active",
      "analytics": {
        "totalConversations": 150,
        "totalMessages": 450,
        "averageRating": 4.2
      },
      "createdAt": "2025-06-25T04:45:28.356Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error message description",
  "details": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created successfully
- `400`: Bad request (validation errors)
- `401`: Unauthorized (invalid or missing token)
- `403`: Forbidden (subscription limits, insufficient permissions)
- `404`: Not found
- `500`: Internal server error

## 💳 Subscription Plans

### Plan Comparison

| Feature | Starter (Free) | Professional ($49/month) | Enterprise (Custom) |
|---------|----------------|--------------------------|---------------------|
| **Chatbots** | 1 | 5 | Unlimited |
| **Conversations/Month** | 100 | 5,000 | Unlimited |
| **Templates** | Basic | All Templates | All + Custom |
| **Custom Branding** | ❌ | ✅ | ✅ |
| **Analytics** | Basic | Advanced | Enterprise |
| **API Access** | ❌ | ❌ | ✅ |
| **Support** | Email | Priority | Dedicated |
| **Multi-platform Deploy** | ❌ | ✅ | ✅ |
| **White-label** | ❌ | ❌ | ✅ |
| **SSO Integration** | ❌ | ❌ | ✅ |
| **On-premise** | ❌ | ❌ | ✅ |

### Subscription Features

#### Starter Plan (Free)
Perfect for individuals and small businesses getting started with chatbots. Includes essential features to build and test basic conversational flows.

**Limitations:**
- Single chatbot limit
- 100 conversations per month
- Basic templates only
- Email support only
- ChatFlo branding included

#### Professional Plan ($49/month)
Ideal for growing businesses that need more conversations and advanced features. Includes everything needed for professional chatbot deployment.

**Key Benefits:**
- Up to 5 chatbots
- 5,000 conversations monthly
- All premium templates
- Custom branding options
- Advanced analytics dashboard
- Priority email support
- Multi-platform deployment

#### Enterprise Plan (Custom Pricing)
For large organizations requiring unlimited scale and enterprise-grade features. Includes dedicated support and custom solutions.

**Enterprise Features:**
- Unlimited chatbots and conversations
- Custom template development
- White-label solution
- API access for integrations
- SSO (Single Sign-On) integration
- Dedicated account manager
- On-premise deployment option
- Custom SLA agreements

### Subscription Management

Users can manage their subscriptions through the dashboard:

1. **Upgrade/Downgrade**: Change plans anytime
2. **Usage Monitoring**: Track conversation limits
3. **Billing History**: View payment history
4. **Cancel Anytime**: No long-term contracts

## 🚀 Deployment

### Production Deployment

#### Prerequisites for Production

Before deploying to production, ensure you have:

1. **Domain Name**: Registered domain for your application
2. **SSL Certificate**: For HTTPS encryption
3. **Database**: MongoDB Atlas or self-hosted MongoDB
4. **Email Service**: SMTP provider for notifications
5. **Payment Processing**: Stripe account with live API keys
6. **Hosting Platform**: VPS, cloud provider, or PaaS

#### Environment Setup

Create production environment variables:

```env
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chatflo-prod
JWT_SECRET=your-production-jwt-secret-very-long-and-secure
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key
BASE_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

#### Deployment Options

**Option 1: Traditional VPS Deployment**

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Application Deployment**
   ```bash
   # Clone repository
   git clone https://github.com/SGK112/chatflo.git
   cd chatflo
   
   # Install dependencies
   npm install --production
   
   # Set up environment
   cp .env.example .env
   # Edit .env with production values
   
   # Start with PM2
   pm2 start server.js --name "chatflo"
   pm2 startup
   pm2 save
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl;
       server_name yourdomain.com;
       
       ssl_certificate /path/to/certificate.crt;
       ssl_certificate_key /path/to/private.key;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

**Option 2: Docker Deployment**

1. **Create Dockerfile**
   ```dockerfile
   FROM node:20-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm install --production
   
   COPY . .
   
   EXPOSE 3000
   
   CMD ["npm", "start"]
   ```

2. **Docker Compose**
   ```yaml
   version: '3.8'
   services:
     chatflo:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - MONGO_URI=mongodb://mongo:27017/chatflo
       depends_on:
         - mongo
     
     mongo:
       image: mongo:5
       volumes:
         - mongo_data:/data/db
   
   volumes:
     mongo_data:
   ```

**Option 3: Cloud Platform Deployment**

**Heroku:**
```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret

# Deploy
git push heroku main
```

**Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Post-Deployment Checklist

1. **SSL Certificate**: Ensure HTTPS is working
2. **Database Connection**: Verify MongoDB connectivity
3. **Environment Variables**: Check all variables are set
4. **Payment Processing**: Test Stripe integration
5. **Email Service**: Verify email notifications
6. **Monitoring**: Set up application monitoring
7. **Backups**: Configure database backups
8. **Performance**: Run performance tests
9. **Security**: Security audit and penetration testing

### Monitoring and Maintenance

#### Application Monitoring

Set up monitoring for:
- **Uptime**: Server availability
- **Performance**: Response times, throughput
- **Errors**: Application errors and exceptions
- **Database**: Connection status, query performance
- **Payment**: Transaction success rates

#### Recommended Tools

- **Monitoring**: New Relic, DataDog, or Prometheus
- **Logging**: Winston (already integrated), ELK Stack
- **Error Tracking**: Sentry
- **Uptime Monitoring**: Pingdom, UptimeRobot

#### Backup Strategy

1. **Database Backups**: Daily automated MongoDB backups
2. **Code Backups**: Git repository with regular commits
3. **Configuration**: Secure storage of environment variables
4. **Recovery Testing**: Regular backup restoration tests

## 🧪 Testing

### Running Tests

The application includes comprehensive testing coverage:

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:api

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/
│   ├── models/
│   ├── middleware/
│   └── utils/
├── integration/
│   ├── auth/
│   ├── subscription/
│   └── chatbots/
└── e2e/
    ├── user-flows/
    └── api-endpoints/
```

### Testing Guidelines

#### Unit Tests
Test individual functions and components:
```javascript
describe('User Model', () => {
  test('should hash password before saving', async () => {
    const user = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'plaintext'
    });
    
    await user.save();
    expect(user.password).not.toBe('plaintext');
  });
});
```

#### Integration Tests
Test API endpoints and workflows:
```javascript
describe('Authentication API', () => {
  test('POST /api/auth/register should create new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe('john@example.com');
  });
});
```

### Manual Testing Checklist

#### User Registration Flow
- [ ] Valid registration with all required fields
- [ ] Email validation and error handling
- [ ] Password strength requirements
- [ ] Duplicate email prevention
- [ ] Terms of service agreement

#### Authentication Flow
- [ ] Successful login with valid credentials
- [ ] Error handling for invalid credentials
- [ ] JWT token generation and validation
- [ ] Password reset functionality
- [ ] Session management

#### Subscription Management
- [ ] Plan comparison and selection
- [ ] Stripe checkout integration
- [ ] Subscription limits enforcement
- [ ] Upgrade/downgrade workflows
- [ ] Billing and invoice generation

#### Chatbot Builder
- [ ] Drag-and-drop functionality
- [ ] Component configuration
- [ ] Live preview testing
- [ ] Save and export features
- [ ] Template selection and customization

## 🤝 Contributing

We welcome contributions to ChatFlo! Please follow these guidelines:

### Development Setup

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/chatflo.git
   cd chatflo
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make Changes and Test**
   ```bash
   npm test
   npm run lint
   ```

5. **Submit Pull Request**
   - Ensure all tests pass
   - Include detailed description
   - Reference related issues

### Code Style Guidelines

- **JavaScript**: Follow ESLint configuration
- **Naming**: Use camelCase for variables, PascalCase for classes
- **Comments**: Document complex logic and API endpoints
- **Commits**: Use conventional commit messages

### Pull Request Process

1. Update documentation for any new features
2. Add tests for new functionality
3. Ensure all existing tests pass
4. Update CHANGELOG.md
5. Request review from maintainers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.

## 🆘 Support

### Getting Help

- **Documentation**: Check this README and API documentation
- **Issues**: Report bugs on [GitHub Issues](https://github.com/SGK112/chatflo/issues)
- **Discussions**: Join community discussions
- **Email**: Contact support@chatflo.com

### Frequently Asked Questions

**Q: Can I use ChatFlo for commercial purposes?**
A: Yes, ChatFlo is available under the MIT license for both personal and commercial use.

**Q: What's the difference between plans?**
A: Plans differ in chatbot limits, conversation volumes, features, and support levels. See the subscription plans section for details.

**Q: Can I migrate from other chatbot platforms?**
A: Yes, we provide migration tools and support for popular platforms. Contact our support team for assistance.

**Q: Is my data secure?**
A: Yes, we implement bank-level security with encryption, secure authentication, and compliance with data protection regulations.

**Q: Can I customize the chatbot appearance?**
A: Professional and Enterprise plans include custom branding options. The Starter plan uses default ChatFlo branding.

### Community

- **GitHub**: [https://github.com/SGK112/chatflo](https://github.com/SGK112/chatflo)
- **Discord**: Join our developer community
- **Twitter**: Follow @ChatFlo for updates
- **Blog**: Read our technical blog for tips and tutorials

---

**Built with ❤️ by the ChatFlo Team**

*Last updated: June 25, 2025*

