#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Starting ChatBot Builder cleanup for deployment...\n');

// Files to remove (old/unused files)
const filesToRemove = [
  'public/index.html', // Old granite chatbot interface
  'public/chatbot.html', // Old simple interface
  'public/direct-test.html',
  'public/iframe-test.html',
  'public/path-test.html',
  'public/sg-chatbot-widget.html',
  'public/simplified-widget.html',
  'public/standalone-chat.html',
  'public/include-chatbot.html',
  'public/include-chatbot.js',
  'public/sg-chatbot-widget.js',
  'public/materials.json',
  'public/companyInfo.json',
  'public/m_w_s.pdf',
  'public/llms.txt',
  'public/sw.js',
  'public/manifest.json',
  'public/index.test.js',
  'chatbot_com_scraper.js',
  'chatbotController.js',
  'enhanced_chatbot_designer.js',
  'populatecountertops.js',
  'scraper.js',
  'upload_images.js',
  'your-data-utils.js',
  'insert_into_mongodb.py',
  'cari_integration.py',
  'app.py',
  'Calc.css',
  'Calc.js',
  'Cia.html',
  'script.js',
  'server.backup.js',
  'server.clean.js',
  'package.backup.json',
  'run.bat',
  'run.sh',
  'setup.ps1',
  'cleanup.ps1',
  'error.log'
];

// Directories to remove
const dirsToRemove = [
  'scraped_data',
  'countertop_images',
  'data',
  'test'
];

// Remove unnecessary files
filesToRemove.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed: ${file}`);
    } catch (err) {
      console.log(`⚠️  Could not remove ${file}: ${err.message}`);
    }
  }
});

// Remove unnecessary directories
dirsToRemove.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Removed directory: ${dir}`);
    } catch (err) {
      console.log(`⚠️  Could not remove ${dir}: ${err.message}`);
    }
  }
});

console.log('\n🎉 Cleanup completed!');
console.log('📁 Project is now ready for deployment.');
