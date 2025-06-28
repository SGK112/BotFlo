# BotFlo Cleanup Plan - June 28, 2025

## 🎯 **Issues Identified**

### **1. Duplicate Builder Files**
Multiple builder versions creating confusion:
- `advanced-flow-builder.html` ✅ (Current main builder)
- `bot-builder-advanced.html` ❌ (Legacy, remove)
- `bot-builder.html` ❌ (Legacy, remove)
- `chatbot-builder-landing.html` ❌ (Legacy, remove)
- `chatbot-builder-pro.html` ❌ (Legacy, remove)
- `chatbot-visual-builder.html` ❌ (Legacy, remove)
- `easy-chatbot-builder.html` ❌ (Legacy, remove)
- `visual-bot-builder-enhanced.html` ❌ (Legacy, remove)
- `enhanced-chatbot-designer.html` ❌ (Legacy, remove)

### **2. Duplicate Footer Issue**
- Shared navigation creates footer dynamically
- Some pages have manual footer HTML
- This causes double footers

### **3. Duplicate Overview Pages**
- `builders-overview.html` ❌ (Legacy)
- `builders-overview-new.html` ❌ (Legacy)
- `builders.html` ✅ (Current main page)

### **4. Extracted Platform Duplicates**
- `/extracted-platform/` contains full duplicate structure
- Should be completely removed

## 🧹 **Cleanup Actions**

### **Phase 1: Remove Legacy Files**
1. Remove all old builder variations
2. Keep only `advanced-flow-builder.html`
3. Remove extracted-platform folder
4. Remove duplicate overview pages

### **Phase 2: Fix Footer Issue**
1. Remove manual footer HTML from files
2. Ensure only shared-nav footer loads
3. Test all pages for single footer

### **Phase 3: Consolidate Features**
1. Ensure single marketplace page
2. Single pricing page
3. Single contact/support flow

### **Phase 4: Add Purchase Bypass**
1. Add dev mode bypass for free purchases
2. Create test payment flow
3. Add admin panel for testing

## 🚀 **Files to Keep (Core)**
- `index.html` - Redirect to marketplace
- `botflo-marketplace.html` - Main landing/marketplace
- `builders.html` - Builder selection page
- `advanced-flow-builder.html` - Main flow builder
- `test-builder.html` - Testing page
- `pricing.html` - Pricing page
- `docs.html` - Documentation
- Standard pages: `about.html`, `contact.html`, `privacy.html`, `terms.html`

## 🗑️ **Files to Remove**
- All legacy builder files
- Extracted platform folder
- Duplicate overview pages
- Old shared-nav files

## 💳 **Purchase Bypass Implementation**
- Add `?bypass=true&code=FREE2025` URL parameter
- Create dev panel for testing payments
- Simulate full purchase flow
- Add admin override capabilities
