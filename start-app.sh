#!/bin/bash

# BotFlo Mobile App Startup Script

echo "🤖 Starting BotFlo - Revenue-Ready Chatbot Platform"
echo "================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "📦 Initializing new npm project..."
    npm init -y
    npm install express cors
fi

# Create a simple server if server.js doesn't exist
if [ ! -f "server.js" ]; then
    echo "🚀 Creating simple server..."
    cat > server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static('public'));

// API endpoint for health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch all handler: send back React's index.html file for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 BotFlo server is running on http://localhost:${PORT}`);
    console.log(`📱 Mobile app ready - add to home screen for best experience!`);
    console.log(`💰 Revenue-ready chatbots available in the marketplace`);
});
EOF
fi

echo "🚀 Starting BotFlo server..."
echo ""
echo "📱 Mobile App Features:"
echo "   • PWA ready - install on mobile devices"
echo "   • Revenue-focused chatbot marketplace"
echo "   • Mobile-first dashboard and analytics"
echo "   • Instant website training and customization"
echo ""
echo "💰 Monetization Features:"
echo "   • Professional chatbot store ($25-$45 per bot)"
echo "   • Website content training system"
echo "   • Revenue tracking and analytics"
echo "   • Mobile app management"
echo ""
echo "🎯 Access your app at: http://localhost:3000"
echo ""

# Start the server
npm start
