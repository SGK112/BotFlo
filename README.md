# ChatBot Builder Pro 🤖

A powerful, no-code chatbot builder with drag-and-drop functionality and real-time customization.

## 🚀 Live Demo

- **🌐 Live Site**: [https://lc4h.com/public/chatbot-builder-landing.html](https://lc4h.com/public/chatbot-builder-landing.html)
- **🎨 Enhanced Demo**: [https://lc4h.com/public/enhanced-chatbot-designer.html](https://lc4h.com/public/enhanced-chatbot-designer.html)
- **🔧 Visual Builder**: [https://lc4h.com/public/advanced-flow-builder.html](https://lc4h.com/public/advanced-flow-builder.html)
- **📋 Features**: [https://lc4h.com/public/features.html](https://lc4h.com/public/features.html)

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

## 📈 Performance

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

**🌐 Live Demo**: [https://lc4h.com/public/chatbot-builder-landing.html](https://lc4h.com/public/chatbot-builder-landing.html)

**📁 GitHub Repository**: [https://github.com/SGK112/chatflo.com](https://github.com/SGK112/chatflo.com)

### 🎯 Quick Links
- **Main Landing**: [chatbot-builder-landing.html](https://lc4h.com/public/chatbot-builder-landing.html)
- **Enhanced Builder**: [enhanced-chatbot-designer.html](https://lc4h.com/public/enhanced-chatbot-designer.html)
- **Visual Flow Builder**: [advanced-flow-builder.html](https://lc4h.com/public/advanced-flow-builder.html)
- **Features Overview**: [features.html](https://lc4h.com/public/features.html)

---

Built with ❤️ for the AI chatbot community
