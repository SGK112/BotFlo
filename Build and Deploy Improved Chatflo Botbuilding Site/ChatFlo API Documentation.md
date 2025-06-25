# ChatFlo API Documentation

## Overview

The ChatFlo API provides comprehensive endpoints for managing users, subscriptions, and chatbots. All API endpoints return JSON responses and use standard HTTP status codes for error handling.

**Base URL**: `http://localhost:3000/api` (development)  
**Production URL**: `https://yourdomain.com/api`

## Authentication

ChatFlo uses JWT (JSON Web Token) based authentication. Include the token in the Authorization header for protected endpoints.

```
Authorization: Bearer <your_jwt_token>
```

### Token Lifecycle
- **Expiration**: 7 days
- **Refresh**: Automatic on valid requests
- **Storage**: Secure HTTP-only cookies (recommended) or localStorage

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **Authenticated users**: 1000 requests per hour
- **Unauthenticated**: 100 requests per hour
- **Subscription endpoints**: 50 requests per hour

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error description",
  "code": "ERROR_CODE",
  "details": [
    {
      "field": "fieldName",
      "message": "Specific field error"
    }
  ],
  "timestamp": "2025-06-25T04:45:28.356Z"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Internal Server Error |

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123",
  "company": "Example Corp",
  "role": "developer"
}
```

**Validation Rules**:
- `firstName`: Required, 2-50 characters
- `lastName`: Required, 2-50 characters
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters
- `confirmPassword`: Must match password
- `company`: Optional, max 100 characters
- `role`: Optional, predefined values

**Success Response** (201):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_12345",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "company": "Example Corp",
    "role": "developer",
    "subscription": {
      "plan": "starter",
      "status": "active",
      "startDate": "2025-06-25T04:45:28.356Z"
    },
    "usage": {
      "chatbots": 0,
      "conversations": 0,
      "apiCalls": 0
    },
    "createdAt": "2025-06-25T04:45:28.356Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response** (400):
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Email already exists"
    }
  ]
}
```

### Login User

Authenticate user and receive access token.

**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Success Response** (200):
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_12345",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "subscription": {
      "plan": "starter",
      "status": "active"
    },
    "usage": {
      "chatbots": 1,
      "conversations": 45
    },
    "lastLogin": "2025-06-25T04:45:28.356Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get User Profile

Retrieve current user's profile information.

**Endpoint**: `GET /api/auth/profile`  
**Authentication**: Required

**Success Response** (200):
```json
{
  "user": {
    "id": "user_12345",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "company": "Example Corp",
    "role": "developer",
    "subscription": {
      "plan": "professional",
      "status": "active",
      "startDate": "2025-06-25T04:45:28.356Z",
      "nextBilling": "2025-07-25T04:45:28.356Z"
    },
    "usage": {
      "chatbots": 3,
      "conversations": 1250,
      "apiCalls": 450
    },
    "preferences": {
      "notifications": true,
      "newsletter": false
    }
  }
}
```

## Subscription Endpoints

### Get Subscription Plans

Retrieve all available subscription plans.

**Endpoint**: `GET /api/subscription/plans`

**Success Response** (200):
```json
{
  "plans": {
    "starter": {
      "name": "Starter",
      "description": "Perfect for individuals getting started",
      "price": 0,
      "billing": "monthly",
      "features": {
        "chatbots": 1,
        "conversations": 100,
        "templates": "basic",
        "customBranding": false,
        "analytics": false,
        "apiAccess": false,
        "support": "email"
      },
      "limits": {
        "chatbots": 1,
        "conversationsPerMonth": 100,
        "apiCallsPerMonth": 0
      }
    },
    "professional": {
      "name": "Professional",
      "description": "Ideal for growing businesses",
      "price": 49,
      "billing": "monthly",
      "features": {
        "chatbots": 5,
        "conversations": 5000,
        "templates": "all",
        "customBranding": true,
        "analytics": true,
        "apiAccess": false,
        "support": "priority"
      },
      "limits": {
        "chatbots": 5,
        "conversationsPerMonth": 5000,
        "apiCallsPerMonth": 1000
      }
    },
    "enterprise": {
      "name": "Enterprise",
      "description": "For large organizations",
      "price": "custom",
      "billing": "custom",
      "features": {
        "chatbots": "unlimited",
        "conversations": "unlimited",
        "templates": "all_plus_custom",
        "customBranding": true,
        "analytics": true,
        "apiAccess": true,
        "support": "dedicated"
      },
      "limits": {
        "chatbots": -1,
        "conversationsPerMonth": -1,
        "apiCallsPerMonth": -1
      }
    }
  }
}
```

### Get Current Subscription

Get current user's subscription details.

**Endpoint**: `GET /api/subscription/current`  
**Authentication**: Required

**Success Response** (200):
```json
{
  "subscription": {
    "plan": "professional",
    "status": "active",
    "startDate": "2025-06-25T04:45:28.356Z",
    "nextBilling": "2025-07-25T04:45:28.356Z",
    "features": {
      "chatbots": 5,
      "conversations": 5000,
      "templates": "all",
      "customBranding": true,
      "analytics": true,
      "apiAccess": false,
      "support": "priority"
    },
    "usage": {
      "chatbots": 3,
      "conversations": 1250,
      "apiCalls": 450,
      "period": "2025-06"
    },
    "limits": {
      "chatbots": 5,
      "conversationsPerMonth": 5000,
      "apiCallsPerMonth": 1000
    }
  }
}
```

### Create Checkout Session

Create Stripe checkout session for subscription upgrade.

**Endpoint**: `POST /api/subscription/checkout`  
**Authentication**: Required

**Request Body**:
```json
{
  "plan": "professional",
  "billing": "monthly"
}
```

**Success Response** (200):
```json
{
  "sessionId": "cs_test_stripe_session_id",
  "url": "https://checkout.stripe.com/pay/cs_test_stripe_session_id"
}
```

## Chatbot Management Endpoints

### Create Chatbot

Create a new chatbot.

**Endpoint**: `POST /api/chatbots`  
**Authentication**: Required

**Request Body**:
```json
{
  "name": "Customer Support Bot",
  "description": "Handles customer inquiries and support",
  "config": {
    "welcomeMessage": "Hello! How can I help you today?",
    "theme": "professional",
    "avatar": "https://example.com/avatar.png",
    "language": "en",
    "timezone": "UTC"
  }
}
```

**Success Response** (201):
```json
{
  "message": "Chatbot created successfully",
  "chatbot": {
    "id": "chatbot_12345",
    "name": "Customer Support Bot",
    "description": "Handles customer inquiries and support",
    "userId": "user_12345",
    "status": "draft",
    "config": {
      "welcomeMessage": "Hello! How can I help you today?",
      "theme": "professional",
      "avatar": "https://example.com/avatar.png",
      "language": "en",
      "timezone": "UTC"
    },
    "flow": {
      "nodes": [],
      "connections": []
    },
    "knowledgeBase": [],
    "integrations": {
      "website": {
        "enabled": false,
        "domains": [],
        "embedCode": ""
      },
      "api": {
        "enabled": false,
        "webhook": "",
        "apiKey": ""
      }
    },
    "analytics": {
      "totalConversations": 0,
      "totalMessages": 0,
      "averageRating": 0,
      "lastActive": null
    },
    "createdAt": "2025-06-25T04:45:28.356Z",
    "updatedAt": "2025-06-25T04:45:28.356Z"
  }
}
```

**Error Response** (403):
```json
{
  "error": "Chatbot limit reached for your subscription plan",
  "currentCount": 1,
  "limit": 1,
  "plan": "starter",
  "upgradeRequired": true
}
```

### Get Chatbots

Retrieve user's chatbots with pagination and filtering.

**Endpoint**: `GET /api/chatbots`  
**Authentication**: Required

**Query Parameters**:
- `status`: Filter by status (active, inactive, draft)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10, max: 50)
- `search`: Search by name or description

**Example**: `GET /api/chatbots?status=active&page=1&limit=10&search=support`

**Success Response** (200):
```json
{
  "chatbots": [
    {
      "id": "chatbot_12345",
      "name": "Customer Support Bot",
      "description": "Handles customer inquiries",
      "status": "active",
      "config": {
        "theme": "professional",
        "language": "en"
      },
      "analytics": {
        "totalConversations": 150,
        "totalMessages": 450,
        "averageRating": 4.2,
        "lastActive": "2025-06-24T18:30:00.000Z"
      },
      "createdAt": "2025-06-20T10:15:30.000Z",
      "updatedAt": "2025-06-24T18:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "pages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### Get Chatbot Details

Retrieve detailed information about a specific chatbot.

**Endpoint**: `GET /api/chatbots/:id`  
**Authentication**: Required

**Success Response** (200):
```json
{
  "chatbot": {
    "id": "chatbot_12345",
    "name": "Customer Support Bot",
    "description": "Handles customer inquiries and support",
    "userId": "user_12345",
    "status": "active",
    "config": {
      "welcomeMessage": "Hello! How can I help you today?",
      "theme": "professional",
      "avatar": "https://example.com/avatar.png",
      "language": "en",
      "timezone": "UTC"
    },
    "flow": {
      "nodes": [
        {
          "id": "node_1",
          "type": "welcome",
          "content": "Hello! How can I help you today?",
          "position": { "x": 100, "y": 100 }
        }
      ],
      "connections": []
    },
    "knowledgeBase": [
      {
        "id": "kb_1",
        "question": "What are your business hours?",
        "answer": "We're open Monday-Friday, 9 AM to 6 PM EST."
      }
    ],
    "integrations": {
      "website": {
        "enabled": true,
        "domains": ["example.com"],
        "embedCode": "<script>...</script>"
      }
    },
    "analytics": {
      "totalConversations": 150,
      "totalMessages": 450,
      "averageRating": 4.2,
      "conversationsByDay": [
        { "date": "2025-06-24", "count": 25 },
        { "date": "2025-06-23", "count": 30 }
      ]
    },
    "createdAt": "2025-06-20T10:15:30.000Z",
    "updatedAt": "2025-06-24T18:30:00.000Z"
  }
}
```

### Update Chatbot

Update chatbot configuration and content.

**Endpoint**: `PUT /api/chatbots/:id`  
**Authentication**: Required

**Request Body**:
```json
{
  "name": "Updated Customer Support Bot",
  "description": "Enhanced customer support with AI",
  "config": {
    "welcomeMessage": "Hi there! I'm here to help you.",
    "theme": "modern"
  },
  "flow": {
    "nodes": [
      {
        "id": "node_1",
        "type": "welcome",
        "content": "Hi there! I'm here to help you.",
        "position": { "x": 100, "y": 100 }
      }
    ]
  }
}
```

**Success Response** (200):
```json
{
  "message": "Chatbot updated successfully",
  "chatbot": {
    "id": "chatbot_12345",
    "name": "Updated Customer Support Bot",
    "updatedAt": "2025-06-25T04:45:28.356Z"
  }
}
```

### Delete Chatbot

Delete a chatbot permanently.

**Endpoint**: `DELETE /api/chatbots/:id`  
**Authentication**: Required

**Success Response** (200):
```json
{
  "message": "Chatbot deleted successfully"
}
```

## Chat Endpoints

### Send Message

Send a message to a chatbot and receive response.

**Endpoint**: `POST /api/chat`

**Request Body**:
```json
{
  "message": "Hello, I need help with my order",
  "chatbotId": "chatbot_12345",
  "sessionId": "session_67890",
  "userId": "user_12345"
}
```

**Success Response** (200):
```json
{
  "response": {
    "message": "I'd be happy to help you with your order! Could you please provide your order number?",
    "type": "text",
    "suggestions": [
      "I don't have my order number",
      "My order number is #12345"
    ]
  },
  "sessionId": "session_67890",
  "conversationId": "conv_98765"
}
```

## Analytics Endpoints

### Get Chatbot Analytics

Retrieve analytics data for a specific chatbot.

**Endpoint**: `GET /api/chatbots/:id/analytics`  
**Authentication**: Required

**Query Parameters**:
- `period`: Time period (day, week, month, year)
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)

**Success Response** (200):
```json
{
  "analytics": {
    "overview": {
      "totalConversations": 150,
      "totalMessages": 450,
      "averageRating": 4.2,
      "completionRate": 0.85,
      "averageSessionDuration": 180
    },
    "conversationsByDay": [
      { "date": "2025-06-24", "count": 25 },
      { "date": "2025-06-23", "count": 30 }
    ],
    "topQuestions": [
      {
        "question": "What are your business hours?",
        "count": 45,
        "percentage": 30
      }
    ],
    "userSatisfaction": [
      { "rating": 5, "count": 60 },
      { "rating": 4, "count": 40 }
    ]
  }
}
```

## Webhook Endpoints

### Stripe Webhook

Handle Stripe webhook events for subscription management.

**Endpoint**: `POST /api/webhooks/stripe`  
**Authentication**: Stripe signature verification

**Supported Events**:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## SDK Examples

### JavaScript/Node.js

```javascript
const ChatFloAPI = require('chatflo-sdk');

const client = new ChatFloAPI({
  apiKey: 'your_api_key',
  baseURL: 'https://api.chatflo.com'
});

// Create a chatbot
const chatbot = await client.chatbots.create({
  name: 'My Bot',
  description: 'A helpful assistant'
});

// Send a message
const response = await client.chat.send({
  message: 'Hello',
  chatbotId: chatbot.id
});
```

### Python

```python
import chatflo

client = chatflo.Client(api_key='your_api_key')

# Create a chatbot
chatbot = client.chatbots.create(
    name='My Bot',
    description='A helpful assistant'
)

# Send a message
response = client.chat.send(
    message='Hello',
    chatbot_id=chatbot.id
)
```

### cURL Examples

```bash
# Register a new user
curl -X POST https://api.chatflo.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'

# Create a chatbot
curl -X POST https://api.chatflo.com/chatbots \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{
    "name": "Customer Support Bot",
    "description": "Handles customer inquiries"
  }'

# Send a chat message
curl -X POST https://api.chatflo.com/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "chatbotId": "chatbot_12345"
  }'
```

## Rate Limiting Headers

API responses include rate limiting information:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Versioning

The API uses semantic versioning. Current version: `v1`

**Version Header**: `Accept: application/vnd.chatflo.v1+json`

## Support

For API support and questions:
- **Documentation**: [https://docs.chatflo.com](https://docs.chatflo.com)
- **Email**: api-support@chatflo.com
- **GitHub Issues**: [https://github.com/SGK112/chatflo/issues](https://github.com/SGK112/chatflo/issues)

---

*Last updated: June 25, 2025*

