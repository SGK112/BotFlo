const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files
app.use(express.static(__dirname));

// Main bot builder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'simple-bot-builder.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Simple BotFlo Builder is running!' });
});

app.listen(port, () => {
    console.log(`🚀 Simple BotFlo Builder running at http://localhost:${port}`);
    console.log(`📱 Build AI chatbots instantly - no complexity, just results!`);
});
