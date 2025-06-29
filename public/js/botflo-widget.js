/**
 * BotFlo Widget - Game-like Chatbot Customization Experience
 * Make buying and customizing a chatbot feel like character creation in an RPG
 */

class BotFloWidget {
    constructor() {
        this.currentBot = {
            id: null,
            name: 'My Chatbot',
            avatar: '🤖',
            personality: 'friendly',
            color: '#2563eb',
            level: 1,
            xp: 0,
            abilities: [],
            stats: {
                intelligence: 50,
                friendliness: 75,
                efficiency: 60,
                creativity: 40
            },
            equipped: {
                greeting: 'welcome',
                responses: ['message'],
                features: []
            }
        };
        
        this.gameConfig = {
            levels: {
                1: { xp: 0, name: 'Novice Bot', unlocks: ['basic_greeting', 'simple_responses'] },
                2: { xp: 100, name: 'Apprentice Bot', unlocks: ['quick_replies', 'conditions'] },
                3: { xp: 300, name: 'Expert Bot', unlocks: ['api_calls', 'webhooks'] },
                4: { xp: 600, name: 'Master Bot', unlocks: ['ai_responses', 'analytics'] },
                5: { xp: 1000, name: 'Legendary Bot', unlocks: ['everything'] }
            },
            
            avatars: [
                { emoji: '🤖', name: 'Classic Bot', cost: 0 },
                { emoji: '👨‍💼', name: 'Business Assistant', cost: 50 },
                { emoji: '👩‍🔬', name: 'Tech Expert', cost: 75 },
                { emoji: '🦸‍♀️', name: 'Super Helper', cost: 100 },
                { emoji: '🧙‍♂️', name: 'Wizard Bot', cost: 150 },
                { emoji: '🦄', name: 'Mythical Bot', cost: 200 }
            ],
            
            personalities: [
                { id: 'friendly', name: 'Friendly', description: '+25% user satisfaction', cost: 0 },
                { id: 'professional', name: 'Professional', description: '+20% conversion rate', cost: 25 },
                { id: 'funny', name: 'Humorous', description: '+30% engagement time', cost: 40 },
                { id: 'empathetic', name: 'Empathetic', description: '+35% problem resolution', cost: 60 },
                { id: 'genius', name: 'Genius', description: '+50% complex query handling', cost: 100 }
            ],
            
            abilities: [
                { id: 'live_chat', name: 'Live Chat Handoff', description: 'Seamlessly transfer to humans', cost: 30 },
                { id: 'multilingual', name: 'Multilingual', description: 'Speak 50+ languages', cost: 50 },
                { id: 'sentiment', name: 'Sentiment Analysis', description: 'Understand user emotions', cost: 40 },
                { id: 'analytics', name: 'Advanced Analytics', description: 'Deep conversation insights', cost: 35 },
                { id: 'integrations', name: 'API Integrations', description: 'Connect to your tools', cost: 45 }
            ]
        };
        
        this.init();
    }
    
    init() {
        this.createGameInterface();
        this.bindEvents();
        this.loadBotData();
    }
    
    createGameInterface() {
        // Create the main game-like interface
        const gameContainer = document.createElement('div');
        gameContainer.className = 'botflo-game-container';
        gameContainer.innerHTML = this.renderGameInterface();
        
        // Add to page (or specified container)
        const targetContainer = document.getElementById('botflo-widget') || document.body;
        targetContainer.appendChild(gameContainer);
        
        // Add game-specific CSS
        this.addGameStyles();
    }
    
    renderGameInterface() {
        return `
            <div class="game-header">
                <div class="bot-preview">
                    <div class="bot-avatar" id="bot-avatar">${this.currentBot.avatar}</div>
                    <div class="bot-info">
                        <h3 class="bot-name" contenteditable="true" id="bot-name">${this.currentBot.name}</h3>
                        <div class="bot-level">Level ${this.currentBot.level} ${this.gameConfig.levels[this.currentBot.level].name}</div>
                        <div class="xp-bar">
                            <div class="xp-fill" style="width: ${this.getXPPercentage()}%"></div>
                            <span class="xp-text">${this.currentBot.xp} / ${this.getNextLevelXP()} XP</span>
                        </div>
                    </div>
                </div>
                
                <div class="game-currency">
                    <div class="currency-item">
                        <span class="currency-icon">💎</span>
                        <span class="currency-amount" id="premium-currency">0</span>
                    </div>
                    <div class="currency-item">
                        <span class="currency-icon">⚡</span>
                        <span class="currency-amount" id="energy">100</span>
                    </div>
                </div>
            </div>
            
            <div class="game-tabs">
                <button class="tab-btn active" data-tab="customize">🎨 Customize</button>
                <button class="tab-btn" data-tab="abilities">⚡ Abilities</button>
                <button class="tab-btn" data-tab="stats">📊 Stats</button>
                <button class="tab-btn" data-tab="shop">🛒 Shop</button>
            </div>
            
            <div class="game-content">
                ${this.renderCustomizeTab()}
                ${this.renderAbilitiesTab()}
                ${this.renderStatsTab()}
                ${this.renderShopTab()}
            </div>
            
            <div class="game-actions">
                <button class="btn btn-secondary" id="test-bot">🎮 Test Bot</button>
                <button class="btn btn-primary" id="deploy-bot">🚀 Deploy Bot</button>
                <button class="btn btn-success" id="save-bot">💾 Save Progress</button>
            </div>
            
            <div class="achievement-popup" id="achievement-popup" style="display: none;">
                <div class="achievement-content">
                    <div class="achievement-icon">🏆</div>
                    <div class="achievement-text">
                        <h4>Achievement Unlocked!</h4>
                        <p id="achievement-description"></p>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderCustomizeTab() {
        return `
            <div class="tab-content" id="customize-tab">
                <div class="customization-grid">
                    <div class="customization-section">
                        <h4>🎭 Avatar</h4>
                        <div class="avatar-grid">
                            ${this.gameConfig.avatars.map(avatar => `
                                <div class="avatar-option ${this.currentBot.avatar === avatar.emoji ? 'selected' : ''}" 
                                     data-avatar="${avatar.emoji}" data-cost="${avatar.cost}">
                                    <div class="avatar-emoji">${avatar.emoji}</div>
                                    <div class="avatar-name">${avatar.name}</div>
                                    <div class="avatar-cost">${avatar.cost > 0 ? avatar.cost + '💎' : 'FREE'}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="customization-section">
                        <h4>🎪 Personality</h4>
                        <div class="personality-grid">
                            ${this.gameConfig.personalities.map(personality => `
                                <div class="personality-option ${this.currentBot.personality === personality.id ? 'selected' : ''}" 
                                     data-personality="${personality.id}" data-cost="${personality.cost}">
                                    <div class="personality-name">${personality.name}</div>
                                    <div class="personality-description">${personality.description}</div>
                                    <div class="personality-cost">${personality.cost > 0 ? personality.cost + '💎' : 'FREE'}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="customization-section">
                        <h4>🎨 Color Theme</h4>
                        <div class="color-grid">
                            <input type="color" id="bot-color" value="${this.currentBot.color}" class="color-picker">
                            <div class="color-presets">
                                <div class="color-preset" data-color="#2563eb" style="background: #2563eb"></div>
                                <div class="color-preset" data-color="#059669" style="background: #059669"></div>
                                <div class="color-preset" data-color="#dc2626" style="background: #dc2626"></div>
                                <div class="color-preset" data-color="#7c3aed" style="background: #7c3aed"></div>
                                <div class="color-preset" data-color="#ea580c" style="background: #ea580c"></div>
                                <div class="color-preset" data-color="#0891b2" style="background: #0891b2"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderAbilitiesTab() {
        return `
            <div class="tab-content" id="abilities-tab" style="display: none;">
                <div class="abilities-grid">
                    ${this.gameConfig.abilities.map(ability => `
                        <div class="ability-card ${this.currentBot.abilities.includes(ability.id) ? 'equipped' : ''}" 
                             data-ability="${ability.id}" data-cost="${ability.cost}">
                            <div class="ability-header">
                                <h4>${ability.name}</h4>
                                <div class="ability-cost">${ability.cost}💎</div>
                            </div>
                            <p class="ability-description">${ability.description}</p>
                            <button class="ability-btn ${this.currentBot.abilities.includes(ability.id) ? 'equipped' : 'equip'}">
                                ${this.currentBot.abilities.includes(ability.id) ? '✅ Equipped' : '⚡ Equip'}
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    renderStatsTab() {
        return `
            <div class="tab-content" id="stats-tab" style="display: none;">
                <div class="stats-container">
                    <h4>🎯 Bot Statistics</h4>
                    <div class="stats-grid">
                        ${Object.entries(this.currentBot.stats).map(([stat, value]) => `
                            <div class="stat-item">
                                <div class="stat-name">${this.capitalize(stat)}</div>
                                <div class="stat-bar">
                                    <div class="stat-fill" style="width: ${value}%"></div>
                                    <span class="stat-value">${value}/100</span>
                                </div>
                                <div class="stat-controls">
                                    <button class="stat-btn" data-stat="${stat}" data-action="decrease">−</button>
                                    <button class="stat-btn" data-stat="${stat}" data-action="increase">+</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="stat-points">
                        <p>Stat Points Available: <span id="available-points">10</span></p>
                        <p class="stat-info">💡 Distribute points to improve your bot's performance!</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderShopTab() {
        return `
            <div class="tab-content" id="shop-tab" style="display: none;">
                <div class="shop-container">
                    <h4>🛒 Bot Shop</h4>
                    <div class="shop-categories">
                        <button class="shop-category-btn active" data-category="premium">💎 Premium Features</button>
                        <button class="shop-category-btn" data-category="cosmetic">🎨 Cosmetics</button>
                        <button class="shop-category-btn" data-category="power">⚡ Power-ups</button>
                    </div>
                    
                    <div class="shop-items">
                        <div class="shop-item">
                            <div class="item-icon">🧠</div>
                            <div class="item-info">
                                <h5>AI Brain Upgrade</h5>
                                <p>Unlock advanced AI responses and natural language understanding</p>
                            </div>
                            <div class="item-price">299💎</div>
                            <button class="shop-btn">Purchase</button>
                        </div>
                        
                        <div class="shop-item">
                            <div class="item-icon">🌐</div>
                            <div class="item-info">
                                <h5>Multi-Platform Deploy</h5>
                                <p>Deploy your bot to WhatsApp, Telegram, and more platforms</p>
                            </div>
                            <div class="item-price">199💎</div>
                            <button class="shop-btn">Purchase</button>
                        </div>
                        
                        <div class="shop-item">
                            <div class="item-icon">📊</div>
                            <div class="item-info">
                                <h5>Analytics Dashboard</h5>
                                <p>Advanced analytics and conversation insights</p>
                            </div>
                            <div class="item-price">149💎</div>
                            <button class="shop-btn">Purchase</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    bindEvents() {
        // Tab switching
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                this.switchTab(e.target.dataset.tab);
            }
            
            // Avatar selection
            if (e.target.closest('.avatar-option')) {
                this.selectAvatar(e.target.closest('.avatar-option'));
            }
            
            // Personality selection
            if (e.target.closest('.personality-option')) {
                this.selectPersonality(e.target.closest('.personality-option'));
            }
            
            // Color presets
            if (e.target.classList.contains('color-preset')) {
                this.selectColor(e.target.dataset.color);
            }
            
            // Ability equipping
            if (e.target.classList.contains('ability-btn')) {
                this.toggleAbility(e.target.closest('.ability-card'));
            }
            
            // Stat adjustments
            if (e.target.classList.contains('stat-btn')) {
                this.adjustStat(e.target.dataset.stat, e.target.dataset.action);
            }
            
            // Action buttons
            if (e.target.id === 'test-bot') {
                this.testBot();
            }
            if (e.target.id === 'deploy-bot') {
                this.deployBot();
            }
            if (e.target.id === 'save-bot') {
                this.saveBot();
            }
        });
        
        // Color picker
        document.addEventListener('change', (e) => {
            if (e.target.id === 'bot-color') {
                this.selectColor(e.target.value);
            }
        });
        
        // Bot name editing
        document.addEventListener('blur', (e) => {
            if (e.target.id === 'bot-name') {
                this.updateBotName(e.target.textContent);
            }
        });
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
        document.getElementById(`${tabName}-tab`).style.display = 'block';
    }
    
    selectAvatar(avatarElement) {
        const avatar = avatarElement.dataset.avatar;
        const cost = parseInt(avatarElement.dataset.cost);
        
        if (this.canAfford(cost)) {
            // Remove previous selection
            document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
            
            // Select new avatar
            avatarElement.classList.add('selected');
            this.currentBot.avatar = avatar;
            document.getElementById('bot-avatar').textContent = avatar;
            
            // Deduct cost and add XP
            this.spendCurrency(cost);
            this.gainXP(cost * 2);
            
            this.playSound('select');
            this.showFloatingText(avatarElement, '✨ Avatar Equipped!');
        } else {
            this.showFloatingText(avatarElement, '❌ Not enough gems!', 'error');
        }
    }
    
    selectPersonality(personalityElement) {
        const personality = personalityElement.dataset.personality;
        const cost = parseInt(personalityElement.dataset.cost);
        
        if (this.canAfford(cost)) {
            document.querySelectorAll('.personality-option').forEach(el => el.classList.remove('selected'));
            personalityElement.classList.add('selected');
            this.currentBot.personality = personality;
            
            this.spendCurrency(cost);
            this.gainXP(cost * 3);
            
            this.playSound('upgrade');
            this.showFloatingText(personalityElement, '🎭 Personality Updated!');
        } else {
            this.showFloatingText(personalityElement, '❌ Not enough gems!', 'error');
        }
    }
    
    selectColor(color) {
        this.currentBot.color = color;
        document.getElementById('bot-color').value = color;
        
        // Apply color theme to interface
        document.documentElement.style.setProperty('--bot-primary-color', color);
        
        this.gainXP(5);
        this.playSound('select');
    }
    
    toggleAbility(abilityCard) {
        const abilityId = abilityCard.dataset.ability;
        const cost = parseInt(abilityCard.dataset.cost);
        const isEquipped = this.currentBot.abilities.includes(abilityId);
        
        if (!isEquipped && this.canAfford(cost)) {
            this.currentBot.abilities.push(abilityId);
            abilityCard.classList.add('equipped');
            abilityCard.querySelector('.ability-btn').textContent = '✅ Equipped';
            
            this.spendCurrency(cost);
            this.gainXP(cost * 4);
            
            this.playSound('powerup');
            this.showFloatingText(abilityCard, '⚡ Ability Unlocked!');
            this.checkAchievements();
        } else if (isEquipped) {
            // Unequip ability (refund half the cost)
            this.currentBot.abilities = this.currentBot.abilities.filter(id => id !== abilityId);
            abilityCard.classList.remove('equipped');
            abilityCard.querySelector('.ability-btn').textContent = '⚡ Equip';
            
            this.addCurrency(Math.floor(cost / 2));
            this.showFloatingText(abilityCard, '🔄 Ability Unequipped');
        } else {
            this.showFloatingText(abilityCard, '❌ Not enough gems!', 'error');
        }
    }
    
    adjustStat(statName, action) {
        const availablePoints = parseInt(document.getElementById('available-points').textContent);
        const currentValue = this.currentBot.stats[statName];
        
        if (action === 'increase' && availablePoints > 0 && currentValue < 100) {
            this.currentBot.stats[statName] += 5;
            this.updateStatDisplay(statName);
            this.updateAvailablePoints(availablePoints - 1);
            this.gainXP(5);
            this.playSound('stat');
        } else if (action === 'decrease' && currentValue > 0) {
            this.currentBot.stats[statName] -= 5;
            this.updateStatDisplay(statName);
            this.updateAvailablePoints(availablePoints + 1);
        }
    }
    
    updateStatDisplay(statName) {
        const value = this.currentBot.stats[statName];
        const statItem = document.querySelector(`[data-stat="${statName}"]`).closest('.stat-item');
        statItem.querySelector('.stat-fill').style.width = `${value}%`;
        statItem.querySelector('.stat-value').textContent = `${value}/100`;
    }
    
    updateAvailablePoints(points) {
        document.getElementById('available-points').textContent = points;
    }
    
    testBot() {
        this.playSound('action');
        this.showNotification('🎮 Opening bot test environment...', 'info');
        
        // Open advanced flow builder
        setTimeout(() => {
            window.open('/advanced-flow-builder.html', '_blank');
        }, 1000);
        
        this.gainXP(10);
    }
    
    deployBot() {
        this.playSound('deploy');
        this.showNotification('🚀 Deploying your bot to production...', 'success');
        
        // Simulate deployment process
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            this.updateDeployProgress(progress);
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                this.showAchievement('Bot Master', 'Successfully deployed your first bot!');
                this.gainXP(50);
            }
        }, 200);
    }
    
    saveBot() {
        this.playSound('save');
        this.showNotification('💾 Progress saved!', 'success');
        localStorage.setItem('botflo-character', JSON.stringify(this.currentBot));
        this.gainXP(5);
    }
    
    loadBotData() {
        const saved = localStorage.getItem('botflo-character');
        if (saved) {
            this.currentBot = { ...this.currentBot, ...JSON.parse(saved) };
            this.updateInterface();
        }
    }
    
    updateInterface() {
        document.getElementById('bot-avatar').textContent = this.currentBot.avatar;
        document.getElementById('bot-name').textContent = this.currentBot.name;
        this.updateXPBar();
        // ... update other interface elements
    }
    
    gainXP(amount) {
        this.currentBot.xp += amount;
        this.checkLevelUp();
        this.updateXPBar();
        this.showFloatingText(document.querySelector('.xp-bar'), `+${amount} XP`, 'xp');
    }
    
    checkLevelUp() {
        const nextLevel = this.currentBot.level + 1;
        const nextLevelXP = this.gameConfig.levels[nextLevel]?.xp;
        
        if (nextLevelXP && this.currentBot.xp >= nextLevelXP) {
            this.currentBot.level = nextLevel;
            this.playSound('levelup');
            this.showAchievement(
                `Level ${nextLevel} Reached!`, 
                `You are now a ${this.gameConfig.levels[nextLevel].name}!`
            );
            this.addCurrency(50); // Level up bonus
        }
    }
    
    updateXPBar() {
        const fill = document.querySelector('.xp-fill');
        const text = document.querySelector('.xp-text');
        const percentage = this.getXPPercentage();
        const nextLevelXP = this.getNextLevelXP();
        
        fill.style.width = `${percentage}%`;
        text.textContent = `${this.currentBot.xp} / ${nextLevelXP} XP`;
    }
    
    getXPPercentage() {
        const currentLevelXP = this.gameConfig.levels[this.currentBot.level]?.xp || 0;
        const nextLevelXP = this.getNextLevelXP();
        const progressXP = this.currentBot.xp - currentLevelXP;
        const levelXPRange = nextLevelXP - currentLevelXP;
        
        return Math.min(100, (progressXP / levelXPRange) * 100);
    }
    
    getNextLevelXP() {
        const nextLevel = this.currentBot.level + 1;
        return this.gameConfig.levels[nextLevel]?.xp || this.currentBot.xp;
    }
    
    canAfford(cost) {
        const currentGems = parseInt(document.getElementById('premium-currency').textContent);
        return currentGems >= cost;
    }
    
    spendCurrency(amount) {
        const current = parseInt(document.getElementById('premium-currency').textContent);
        document.getElementById('premium-currency').textContent = Math.max(0, current - amount);
    }
    
    addCurrency(amount) {
        const current = parseInt(document.getElementById('premium-currency').textContent);
        document.getElementById('premium-currency').textContent = current + amount;
    }
    
    showAchievement(title, description) {
        const popup = document.getElementById('achievement-popup');
        document.getElementById('achievement-description').innerHTML = `<strong>${title}</strong><br>${description}`;
        
        popup.style.display = 'block';
        popup.classList.add('achievement-show');
        
        setTimeout(() => {
            popup.classList.remove('achievement-show');
            setTimeout(() => {
                popup.style.display = 'none';
            }, 300);
        }, 3000);
    }
    
    showFloatingText(element, text, type = 'success') {
        const floating = document.createElement('div');
        floating.className = `floating-text floating-${type}`;
        floating.textContent = text;
        
        const rect = element.getBoundingClientRect();
        floating.style.position = 'fixed';
        floating.style.left = `${rect.left + rect.width / 2}px`;
        floating.style.top = `${rect.top}px`;
        floating.style.zIndex = '10000';
        
        document.body.appendChild(floating);
        
        setTimeout(() => {
            floating.remove();
        }, 2000);
    }
    
    showNotification(message, type = 'info') {
        // Create or update notification system
        let notification = document.getElementById('game-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'game-notification';
            notification.className = 'game-notification';
            document.body.appendChild(notification);
        }
        
        notification.className = `game-notification notification-${type} show`;
        notification.textContent = message;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    playSound(type) {
        // Game-like sound effects (optional - can be implemented with Web Audio API)
        if (window.AudioContext) {
            // Implementation for game sounds
            console.log(`🔊 Playing sound: ${type}`);
        }
    }
    
    checkAchievements() {
        // Check for various achievements based on bot configuration
        const totalAbilities = this.currentBot.abilities.length;
        
        if (totalAbilities >= 3 && !this.hasAchievement('ability_collector')) {
            this.showAchievement('Ability Collector', 'Equipped 3 or more abilities!');
            this.markAchievement('ability_collector');
        }
    }
    
    hasAchievement(achievementId) {
        const achievements = JSON.parse(localStorage.getItem('botflo-achievements') || '[]');
        return achievements.includes(achievementId);
    }
    
    markAchievement(achievementId) {
        const achievements = JSON.parse(localStorage.getItem('botflo-achievements') || '[]');
        if (!achievements.includes(achievementId)) {
            achievements.push(achievementId);
            localStorage.setItem('botflo-achievements', JSON.stringify(achievements));
        }
    }
    
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    addGameStyles() {
        const styles = `
            <style>
            .botflo-game-container {
                max-width: 1200px;
                margin: 0 auto;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                padding: 20px;
                color: white;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            }
            
            .game-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                background: rgba(255,255,255,0.1);
                padding: 20px;
                border-radius: 15px;
                backdrop-filter: blur(10px);
            }
            
            .bot-preview {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            
            .bot-avatar {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: rgba(255,255,255,0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2.5rem;
                border: 3px solid rgba(255,255,255,0.3);
                box-shadow: 0 0 20px rgba(255,255,255,0.2);
            }
            
            .bot-info h3 {
                margin: 0;
                font-size: 1.5rem;
                font-weight: 700;
            }
            
            .bot-level {
                color: #fbbf24;
                font-weight: 600;
                margin: 5px 0;
            }
            
            .xp-bar {
                width: 200px;
                height: 20px;
                background: rgba(0,0,0,0.3);
                border-radius: 10px;
                overflow: hidden;
                position: relative;
            }
            
            .xp-fill {
                height: 100%;
                background: linear-gradient(90deg, #fbbf24, #f59e0b);
                transition: width 0.5s ease;
                border-radius: 10px;
            }
            
            .xp-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 0.8rem;
                font-weight: 600;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            }
            
            .game-currency {
                display: flex;
                gap: 20px;
            }
            
            .currency-item {
                display: flex;
                align-items: center;
                gap: 8px;
                background: rgba(0,0,0,0.2);
                padding: 10px 15px;
                border-radius: 10px;
                font-weight: 600;
            }
            
            .currency-icon {
                font-size: 1.2rem;
            }
            
            .game-tabs {
                display: flex;
                gap: 10px;
                margin-bottom: 30px;
            }
            
            .tab-btn {
                background: rgba(255,255,255,0.1);
                border: none;
                color: white;
                padding: 12px 20px;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 600;
                flex: 1;
            }
            
            .tab-btn:hover {
                background: rgba(255,255,255,0.2);
                transform: translateY(-2px);
            }
            
            .tab-btn.active {
                background: rgba(255,255,255,0.3);
                box-shadow: 0 5px 15px rgba(255,255,255,0.2);
            }
            
            .game-content {
                background: rgba(255,255,255,0.1);
                border-radius: 15px;
                padding: 30px;
                margin-bottom: 30px;
                min-height: 400px;
                backdrop-filter: blur(10px);
            }
            
            .customization-grid {
                display: grid;
                gap: 30px;
            }
            
            .customization-section h4 {
                margin: 0 0 20px 0;
                font-size: 1.2rem;
                color: #fbbf24;
            }
            
            .avatar-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 15px;
            }
            
            .avatar-option {
                background: rgba(255,255,255,0.1);
                border: 2px solid transparent;
                border-radius: 12px;
                padding: 15px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .avatar-option:hover {
                background: rgba(255,255,255,0.2);
                transform: scale(1.05);
            }
            
            .avatar-option.selected {
                border-color: #fbbf24;
                background: rgba(251, 191, 36, 0.2);
                box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
            }
            
            .avatar-emoji {
                font-size: 2rem;
                margin-bottom: 8px;
            }
            
            .avatar-name {
                font-weight: 600;
                margin-bottom: 5px;
            }
            
            .avatar-cost {
                font-size: 0.9rem;
                color: #fbbf24;
            }
            
            .personality-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
            }
            
            .personality-option {
                background: rgba(255,255,255,0.1);
                border: 2px solid transparent;
                border-radius: 12px;
                padding: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .personality-option:hover {
                background: rgba(255,255,255,0.2);
                transform: translateY(-3px);
            }
            
            .personality-option.selected {
                border-color: #fbbf24;
                background: rgba(251, 191, 36, 0.2);
            }
            
            .personality-name {
                font-weight: 700;
                margin-bottom: 8px;
                font-size: 1.1rem;
            }
            
            .personality-description {
                font-size: 0.9rem;
                margin-bottom: 10px;
                color: #e5e7eb;
            }
            
            .personality-cost {
                color: #fbbf24;
                font-weight: 600;
            }
            
            .color-grid {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            
            .color-picker {
                width: 60px;
                height: 60px;
                border: none;
                border-radius: 50%;
                cursor: pointer;
            }
            
            .color-presets {
                display: flex;
                gap: 10px;
            }
            
            .color-preset {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                transition: transform 0.2s ease;
                border: 3px solid rgba(255,255,255,0.3);
            }
            
            .color-preset:hover {
                transform: scale(1.2);
            }
            
            .abilities-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
            }
            
            .ability-card {
                background: rgba(255,255,255,0.1);
                border: 2px solid transparent;
                border-radius: 15px;
                padding: 20px;
                transition: all 0.3s ease;
            }
            
            .ability-card:hover {
                background: rgba(255,255,255,0.2);
                transform: translateY(-5px);
            }
            
            .ability-card.equipped {
                border-color: #10b981;
                background: rgba(16, 185, 129, 0.2);
            }
            
            .ability-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .ability-header h4 {
                margin: 0;
                color: #fbbf24;
            }
            
            .ability-cost {
                color: #a78bfa;
                font-weight: 600;
            }
            
            .ability-description {
                margin-bottom: 15px;
                color: #e5e7eb;
                line-height: 1.5;
            }
            
            .ability-btn {
                width: 100%;
                background: linear-gradient(45deg, #8b5cf6, #a78bfa);
                border: none;
                color: white;
                padding: 12px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .ability-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 5px 15px rgba(139, 92, 246, 0.4);
            }
            
            .ability-btn.equipped {
                background: linear-gradient(45deg, #10b981, #34d399);
            }
            
            .stats-grid {
                display: grid;
                gap: 20px;
            }
            
            .stat-item {
                display: grid;
                grid-template-columns: 120px 1fr auto;
                align-items: center;
                gap: 20px;
            }
            
            .stat-name {
                font-weight: 600;
                color: #fbbf24;
            }
            
            .stat-bar {
                position: relative;
                height: 25px;
                background: rgba(0,0,0,0.3);
                border-radius: 12px;
                overflow: hidden;
            }
            
            .stat-fill {
                height: 100%;
                background: linear-gradient(90deg, #ef4444, #f59e0b, #10b981);
                transition: width 0.5s ease;
                border-radius: 12px;
            }
            
            .stat-value {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 0.8rem;
                font-weight: 600;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
            }
            
            .stat-controls {
                display: flex;
                gap: 5px;
            }
            
            .stat-btn {
                width: 30px;
                height: 30px;
                border: none;
                background: rgba(255,255,255,0.2);
                color: white;
                border-radius: 50%;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.2s ease;
            }
            
            .stat-btn:hover {
                background: rgba(255,255,255,0.3);
                transform: scale(1.1);
            }
            
            .game-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
            }
            
            .btn {
                padding: 15px 30px;
                border: none;
                border-radius: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 1rem;
            }
            
            .btn-primary {
                background: linear-gradient(45deg, #2563eb, #3b82f6);
                color: white;
            }
            
            .btn-secondary {
                background: rgba(255,255,255,0.2);
                color: white;
            }
            
            .btn-success {
                background: linear-gradient(45deg, #10b981, #34d399);
                color: white;
            }
            
            .btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            }
            
            .achievement-popup {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                background: linear-gradient(135deg, #fbbf24, #f59e0b);
                color: white;
                padding: 20px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                transform: translateX(400px);
                transition: transform 0.5s ease;
            }
            
            .achievement-popup.achievement-show {
                transform: translateX(0);
            }
            
            .achievement-content {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .achievement-icon {
                font-size: 2rem;
                animation: bounce 0.6s ease-in-out infinite alternate;
            }
            
            @keyframes bounce {
                to {
                    transform: translateY(-10px);
                }
            }
            
            .floating-text {
                position: fixed;
                pointer-events: none;
                font-weight: 600;
                animation: float-up 2s ease-out forwards;
                z-index: 10000;
            }
            
            .floating-success {
                color: #10b981;
            }
            
            .floating-error {
                color: #ef4444;
            }
            
            .floating-xp {
                color: #fbbf24;
            }
            
            @keyframes float-up {
                0% {
                    opacity: 1;
                    transform: translateY(0);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-50px);
                }
            }
            
            .game-notification {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0);
                background: rgba(0,0,0,0.9);
                color: white;
                padding: 20px 30px;
                border-radius: 12px;
                font-weight: 600;
                z-index: 10000;
                transition: all 0.3s ease;
            }
            
            .game-notification.show {
                transform: translate(-50%, -50%) scale(1);
            }
            
            .notification-success {
                border-left: 5px solid #10b981;
            }
            
            .notification-info {
                border-left: 5px solid #3b82f6;
            }
            
            .notification-error {
                border-left: 5px solid #ef4444;
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                .botflo-game-container {
                    margin: 10px;
                    padding: 15px;
                }
                
                .game-header {
                    flex-direction: column;
                    gap: 20px;
                }
                
                .game-tabs {
                    flex-direction: column;
                }
                
                .avatar-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .personality-grid {
                    grid-template-columns: 1fr;
                }
                
                .abilities-grid {
                    grid-template-columns: 1fr;
                }
                
                .stat-item {
                    grid-template-columns: 1fr;
                    gap: 10px;
                    text-align: center;
                }
                
                .game-actions {
                    flex-direction: column;
                }
            }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// Initialize the widget when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Give user some starting currency
    setTimeout(() => {
        document.getElementById('premium-currency').textContent = '250';
    }, 1000);
    
    new BotFloWidget();
});

// Export for global access
window.BotFloWidget = BotFloWidget;
