# ChatBot Builder Pro 🤖

A powerful, no-code chatbot builder with drag-and-drop functionality and real-time customization.

## 🚀 Live Demo

## 🚀 Live Demo

- **🌐 Main Platform**: [https://sgk112.github.io/chatflo/](https://sgk112.github.io/chatflo/)
- **📋 Professional Landing**: [https://sgk112.github.io/chatflo/public/chatbot-builder-landing.html](https://sgk112.github.io/chatflo/public/chatbot-builder-landing.html)
- **🎯 Live Demo**: [https://sgk112.github.io/chatflo/public/demo.html](https://sgk112.github.io/chatflo/public/demo.html)

### 🛠️ Builder Options
- **🚀 Pro Builder**: [https://sgk112.github.io/chatflo/public/chatbot-builder-pro.html](https://sgk112.github.io/chatflo/public/chatbot-builder-pro.html)
- **🔧 Advanced Flow Builder**: [https://sgk112.github.io/chatflo/public/advanced-flow-builder.html](https://sgk112.github.io/chatflo/public/advanced-flow-builder.html)
- **🎯 Simple Builder**: [https://sgk112.github.io/chatflo/public/chatbot.html](https://sgk112.github.io/chatflo/public/chatbot.html)
- **📋 Features Overview**: [https://sgk112.github.io/chatflo/public/features-comprehensive.html](https://sgk112.github.io/chatflo/public/features-comprehensive.html)

### Local Development
- **Local Development**: `http://localhost:3000/public/chatbot-builder-landing.html`
- **Enhanced Demo**: `http://localhost:3000/demo`
- **Visual Builder**: `http://localhost:3000/builders/visual`

## ✨ Features

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
   git clone https://github.com/SGK112/chatflo.com.git
   cd chatflo.com
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
chatbot-builder/
├── public/                 # Static frontend files
│   ├── chatbot-builder-landing.html
│   ├── features.html
│   ├── templates.html
│   ├── pricing.html
│   ├── builders/
│   └── ...
├── server.js              # Express server
├── package.json
├── Dockerfile
├── docker-compose.yml
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

## 🎉 Demo

**🌐 Live Demo**: [https://sgk112.github.io/chatflo.com/public/chatbot-builder-landing.html](https://sgk112.github.io/chatflo.com/public/chatbot-builder-landing.html)

**📁 GitHub Repository**: [https://github.com/SGK112/chatflo.com](https://github.com/SGK112/chatflo.com)

### 🎯 Quick Links
- **Professional Landing**: [chatbot-builder-landing.html](https://sgk112.github.io/chatflo.com/public/chatbot-builder-landing.html)
- **🚀 Pro Builder**: [chatbot-builder-pro.html](https://sgk112.github.io/chatflo.com/public/chatbot-builder-pro.html)
- **🎯 Simple Builder**: [chatbot.html](https://sgk112.github.io/chatflo.com/public/chatbot.html)
- **🔧 Advanced Flow Builder**: [advanced-flow-builder.html](https://sgk112.github.io/chatflo.com/public/advanced-flow-builder.html)
- **📋 Features Overview**: [features-comprehensive.html](https://sgk112.github.io/chatflo.com/public/features-comprehensive.html)

---

Built with ❤️ for the AI chatbot community
