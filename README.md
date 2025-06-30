# 🤖 BotFlo.ai - Advanced AI-Powered Chatbot Platform

A revolutionary, revenue-ready chatbot platform with intelligent NLP, web scraping, and desktop + mobile optimized design. Create smart chatbots that understand context, sentiment, and your business content.

## 🚀 Live Platform

### 🌐 Main Application
- **🏠 Homepage**: `https://cuddly-broccoli-5gx5wx67vqqfpprr-3000.app.github.dev/`
- **� Marketplace**: `https://cuddly-broccoli-5gx5wx67vqqfpprr-3000.app.github.dev/marketplace-unified.html`
- **🤖 Smart Website Scraper**: `https://cuddly-broccoli-5gx5wx67vqqfpprr-3000.app.github.dev/website-scraper.html`
- **� Dashboard**: `https://cuddly-broccoli-5gx5wx67vqqfpprr-3000.app.github.dev/dashboard.html`
- **⚙️ Customization**: `https://cuddly-broccoli-5gx5wx67vqqfpprr-3000.app.github.dev/customize.html`

### 🛠️ Local Development
- **� Main Platform**: `http://localhost:3000`
- **🔧 All Features**: Available at localhost with full functionality

## 🧠 Intelligent Features

### 🎯 Advanced NLP Engine
- **Intent Recognition**: Automatically detects user intent with confidence scoring
- **Sentiment Analysis**: Understands emotional context (positive, negative, neutral)
- **Context Awareness**: Maintains conversation context across interactions
- **Entity Extraction**: Identifies key information from user messages
- **Smart Suggestions**: Provides relevant follow-up questions

### � Web Content Integration
- **Automatic Scraping**: Enter any website URL to extract content
- **Content Analysis**: AI analyzes and creates relevant responses
- **Business Info Integration**: Automatically includes contact details and hours
- **Dynamic Responses**: Generates contextual answers based on scraped data
- **Semantic Matching**: Finds relevant content using advanced algorithms

### 💻 Desktop + Mobile Optimized
- **Responsive Design**: Seamless experience on desktop, tablet, and mobile
- **PC-Friendly Interface**: Optimized layouts for larger screens
- **Touch Interactions**: Mobile-first touch interface
- **PWA Ready**: Install as native app on any device
- **Adaptive UI**: Components adjust to screen size and input method

## ✨ Platform Features

- **🎨 Enhanced Visual Designer** - Real-time chatbot customization with instant preview
- **🔧 Advanced Flow Builder** - Modular drag-and-drop chatbot flow creation
- **📱 Mobile Responsive** - Works perfectly on all devices
- **🎯 Multiple Builder Types** - Choose from different builder interfaces
- **⚡ Real-time Preview** - See changes instantly as you build
- **🎨 Preset Themes** - Professional, Modern, Dark Mode, and more
- **💾 Export Functionality** - Generate ready-to-use chatbot code

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **Backend**: Node.js, Express.js
- **Architecture**: Modular component-based design
- **Styling**: Modern CSS with animations and responsive design
- **Icons**: Font Awesome, Bootstrap Icons, Material Icons

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm 8+
- MongoDB (optional - for user data)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/BotFlo.git
   cd BotFlo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🌐 Deployment Options

### Option 1: Render (Recommended - Free Tier Available)

1. **Connect to GitHub**
   - Push your code to GitHub
   - Connect your repository to Render

2. **Deploy Settings**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Add your environment variables

### Option 2: Railway

1. **Deploy to Railway**
   ```bash
   npm install -g @railway/cli
   railway login
   railway deploy
   ```

### Option 3: Heroku

1. **Deploy to Heroku**
   ```bash
   heroku create your-chatbot-builder
   git push heroku main
   ```

### Option 4: DigitalOcean App Platform

1. **Connect GitHub repository**
2. **Configure build settings**
   - Build Command: `npm install`
   - Run Command: `npm start`

### Option 5: Docker Deployment

```bash
# Build the image
docker build -t chatbot-builder .

# Run the container
docker run -p 3000:3000 chatbot-builder
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database (Optional)
MONGO_URI=mongodb://localhost:27017/chatbot-builder

# OpenAI API (Optional - for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Authentication (Future implementation)
JWT_SECRET=your_jwt_secret_here

# Email Service (Future implementation)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## 📁 Project Structure

```
BotFlo/
├── public/                 # Static frontend files
│   ├── enhanced-chatbot-designer.html
│   ├── botflo-marketplace.html
│   ├── visual-bot-builder-enhanced.html
│   ├── features.html
│   ├── pricing.html
│   └── css/, js/, flow-builder/
├── extracted-platform/     # New advanced platform
│   ├── backend/            # Node.js/Python backend
│   │   ├── api/           # API endpoints
│   │   ├── models/        # Data models
│   │   ├── utils/         # Utilities
│   │   ├── server.js      # Main server
│   │   └── package.json
│   └── frontend/          # React components
│       ├── components/    # UI components
│       ├── styles/        # CSS files
│       └── App.jsx        # Main app
├── api/                   # Original API files
├── core/                  # Core bot functionality
├── middleware/            # Express middleware
├── models/               # Database models
├── routes/               # API routes
├── services/             # External services
├── server.js             # Main Express server
├── package.json
└── README.md
```

## 🎯 Available Pages

### Core Pages
- **Homepage**: `/` - Main landing page
- **Features**: `/features` - Platform features overview
- **Templates**: `/templates` - Chatbot templates gallery
- **Pricing**: `/pricing` - Subscription plans
- **About**: `/about` - Company information

### Builder Tools
- **Builders Overview**: `/builders` - Compare builder types
- **Visual Builder**: `/builders/visual` - Drag & drop interface
- **Enhanced Designer**: `/builders/enhanced` - Advanced builder
- **Simple Builder**: `/builders/simple` - Quick setup tool

### Resources
- **Tutorials**: `/tutorials` - Step-by-step guides
- **Documentation**: `/docs` - API and technical docs
- **Blog**: `/blog` - Latest insights and updates
- **Community**: `/community` - User community hub

### User Account
- **Login**: `/login` - User authentication
- **Signup**: `/signup` - Account registration
- **Dashboard**: `/dashboard` - User dashboard

## 🔒 Security Features

- Helmet.js for security headers
- CORS protection
- Rate limiting
- Input validation
- Environment variable protection

## � Troubleshooting

### Server Won't Start

**Problem**: Server fails to start or shows errors
**Solutions**:
1. Check Node.js version: `node --version` (requires v18+)
2. Install dependencies: `npm install`
3. Check for port conflicts: Server runs on port 3000 by default
4. Review console error messages for specific issues

### Chat API Not Working

**Problem**: AI chat functionality returns errors
**Solutions**:
1. Check if `OPENAI_API_KEY` is set in `.env` file
2. Verify API key is valid in OpenAI dashboard
3. Check server logs for specific error messages
4. Test health endpoint: `http://localhost:3000/api/health`

### Database Connection Issues

**Problem**: MongoDB connection errors
**Solutions**:
1. MongoDB is optional - app runs without it
2. If using MongoDB, ensure service is running
3. Check `MONGO_URI` format: `mongodb://localhost:27017/database_name`
4. Verify MongoDB service status

### Missing Functions Error

**Problem**: `getMaterialPrices is not defined` or similar
**Solution**: This has been fixed in the latest version. The server now includes these functions.

### Environment Variables

**Problem**: Configuration not loading
**Solutions**:
1. Ensure `.env` file exists in project root
2. Copy from `.env.example` if needed
3. Check syntax - no spaces around `=`
4. Restart server after changing `.env`

### Health Check

Test server status: `curl http://localhost:3000/api/health`

Expected response:
```json
{
  "status": "ok",
  "server": "ChatFlo Chatbot Builder",
  "services": {
    "mongodb": "connected/disconnected",
    "openai": "configured/not configured"
  }
}
```

## �📈 Performance

- Gzip compression
- Static file caching
- Optimized images
- Minified CSS/JS
- CDN-ready assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [/docs](http://localhost:3000/docs)
- **Community**: [/community](http://localhost:3000/community)
- **Support**: [/support](http://localhost:3000/support)
- **Email**: support@chatbotbuilder.com

## 🎉 Demo & Platform Access

### 🌐 Local Development (Original Platform)
**📍 Main Server**: `http://localhost:3000` (when running `npm start`)

### 🆕 Advanced Platform (Extracted)
**📍 Enhanced Server**: `http://localhost:3001` (when running extracted platform)

**📁 GitHub Repository**: Update your repository URL here

### 🎯 Quick Local Access
- **🏠 Main Marketplace**: `http://localhost:3000/botflo-marketplace.html`
- **🚀 Enhanced Designer**: `http://localhost:3000/enhanced-chatbot-designer.html` 
- **🎯 Visual Builder**: `http://localhost:3000/visual-bot-builder-enhanced.html`
- **🔧 Advanced Platform**: `http://localhost:3001` (new React-based platform)
- **📋 Features Overview**: `http://localhost:3000/features.html`

---

Built with ❤️ for the AI chatbot community

## 🔄 Recent Updates & Fixes

### 📝 Documentation Fixed
- ✅ **Repository References**: Updated all links from old "chatflo" GitHub to "BotFlo"
- ✅ **URL Corrections**: Fixed local development URLs to reflect actual file structure
- ✅ **Project Structure**: Updated to show both original and extracted platform architectures
- ✅ **Branding Consistency**: All references now use "BotFlo.ai" branding

### 🚀 Current Platform Status

#### Original BotFlo Platform (Port 3000)
- **Status**: ✅ **RUNNING** - `http://localhost:3000`
- **Features**: Drag-and-drop builder, templates, marketplace
- **Tech**: Node.js + Express + Static frontend

#### Extracted Advanced Platform (Port 3001) 
- **Status**: ⚠️ **EXTRACTED** - Contains advanced React-based components
- **Location**: `/extracted-platform/` directory
- **Features**: React UI, Python/Node.js APIs, file upload, payment integration
- **Tech**: React + Node.js + Python + MongoDB/Stripe ready

### 🎯 What Caused the Issue?

1. **Documentation Mismatch**: README was pointing to old "chatflo" repository URLs
2. **Missing Dependencies**: Original server needed `npm install`
3. **Platform Confusion**: Two different platforms (original vs extracted) with different URLs

### 🛠️ Resolution Steps Taken

1. ✅ Fixed all repository references in README.md
2. ✅ Updated URLs to reflect actual local development structure  
3. ✅ Installed missing dependencies (`npm install`)
4. ✅ Started original BotFlo server successfully on port 3000
5. ✅ Documented both platform architectures clearly
