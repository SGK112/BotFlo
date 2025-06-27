/**
 * BotFlo.ai - Bot Builder Visual Module
 * Handles the visual flow builder and conversation design
 */

class BotBuilderVisual {
    constructor(core) {
        this.core = core;
        this.canvas = null;
        this.selectedNode = null;
        this.draggedNode = null;
        this.isConnecting = false;
        this.connectionStart = null;
        this.zoom = 1;
        this.panOffset = { x: 0, y: 0 };
        this.isPanning = false;
        this.panStart = { x: 0, y: 0 };
    }

    /**
     * Initialize visual flow builder
     */
    async initialize() {
        this.setupCanvas();
        this.setupNodePalette();
        this.setupEventListeners();
        this.loadVisualEditor();
        
        console.log('🎨 Bot Builder Visual initialized');
    }

    /**
     * Set up canvas for visual editor
     */
    setupCanvas() {
        const visualTab = document.getElementById('visual-tab');
        if (!visualTab) return;

        // Create canvas structure if not exists
        if (!visualTab.querySelector('.visual-canvas')) {
            visualTab.innerHTML = `
                <div class="visual-toolbar">
                    <div class="toolbar-section">
                        <button class="toolbar-btn" onclick="window.botBuilder.modules.visual.addNode('message')" title="Add Message">
                            <i class="fas fa-comment"></i>
                        </button>
                        <button class="toolbar-btn" onclick="window.botBuilder.modules.visual.addNode('menu')" title="Add Menu">
                            <i class="fas fa-list"></i>
                        </button>
                        <button class="toolbar-btn" onclick="window.botBuilder.modules.visual.addNode('form')" title="Add Form">
                            <i class="fas fa-wpforms"></i>
                        </button>
                        <button class="toolbar-btn" onclick="window.botBuilder.modules.visual.addNode('condition')" title="Add Condition">
                            <i class="fas fa-code-branch"></i>
                        </button>
                        <button class="toolbar-btn" onclick="window.botBuilder.modules.visual.addNode('action')" title="Add Action">
                            <i class="fas fa-cog"></i>
                        </button>
                    </div>
                    <div class="toolbar-section">
                        <button class="toolbar-btn" onclick="window.botBuilder.modules.visual.zoomIn()" title="Zoom In">
                            <i class="fas fa-search-plus"></i>
                        </button>
                        <button class="toolbar-btn" onclick="window.botBuilder.modules.visual.zoomOut()" title="Zoom Out">
                            <i class="fas fa-search-minus"></i>
                        </button>
                        <button class="toolbar-btn" onclick="window.botBuilder.modules.visual.resetZoom()" title="Reset Zoom">
                            <i class="fas fa-expand-arrows-alt"></i>
                        </button>
                    </div>
                    <div class="toolbar-section">
                        <button class="toolbar-btn" onclick="window.botBuilder.modules.visual.autoLayout()" title="Auto Layout">
                            <i class="fas fa-magic"></i>
                        </button>
                        <button class="toolbar-btn" onclick="window.botBuilder.modules.visual.clearCanvas()" title="Clear All">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="visual-canvas-container">
                    <div class="visual-canvas" id="visualCanvas">
                        <svg class="connections-layer" id="connectionsLayer"></svg>
                        <div class="nodes-layer" id="nodesLayer"></div>
                    </div>
                </div>
                <div class="visual-properties" id="visualProperties">
                    <h3>Node Properties</h3>
                    <p class="no-selection">Select a node to edit its properties</p>
                </div>
            `;
        }

        this.canvas = document.getElementById('visualCanvas');
        this.nodesLayer = document.getElementById('nodesLayer');
        this.connectionsLayer = document.getElementById('connectionsLayer');
    }

    /**
     * Set up node palette
     */
    setupNodePalette() {
        // Node types configuration
        this.nodeTypes = {
            message: {
                icon: 'fas fa-comment',
                color: '#667eea',
                title: 'Message',
                description: 'Send a message to the user'
            },
            menu: {
                icon: 'fas fa-list',
                color: '#10b981',
                title: 'Menu',
                description: 'Show options for user to choose'
            },
            form: {
                icon: 'fas fa-wpforms',
                color: '#f59e0b',
                title: 'Form',
                description: 'Collect user information'
            },
            condition: {
                icon: 'fas fa-code-branch',
                color: '#8b5cf6',
                title: 'Condition',
                description: 'Branch based on conditions'
            },
            action: {
                icon: 'fas fa-cog',
                color: '#ef4444',
                title: 'Action',
                description: 'Perform an action'
            },
            webhook: {
                icon: 'fas fa-globe',
                color: '#06b6d4',
                title: 'Webhook',
                description: 'Call external API'
            }
        };
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        if (!this.canvas) return;

        // Canvas events
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));

        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Context menu
        this.canvas.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
    }

    /**
     * Load visual editor content
     */
    loadVisualEditor() {
        if (!this.canvas) return;

        const bot = this.core.getCurrentBot();
        
        // Clear existing nodes
        this.clearCanvas();
        
        // Load nodes from bot configuration
        if (bot.nodes && bot.nodes.length > 0) {
            bot.nodes.forEach(node => this.renderNode(node));
        } else {
            // Create default start node
            this.addNode('message', { x: 200, y: 150 });
        }

        // Load connections
        if (bot.edges && bot.edges.length > 0) {
            bot.edges.forEach(edge => this.renderConnection(edge));
        }
    }

    /**
     * Add new node to canvas
     */
    addNode(type, position = null) {
        const bot = this.core.getCurrentBot();
        if (!bot.nodes) bot.nodes = [];

        const node = {
            id: this.generateNodeId(),
            type: type,
            position: position || this.getNextNodePosition(),
            content: this.getDefaultNodeContent(type),
            config: this.getDefaultNodeConfig(type)
        };

        bot.nodes.push(node);
        this.core.updateBotProperty('nodes', bot.nodes, true);
        
        this.renderNode(node);
        this.selectNode(node.id);
        
        this.core.showNotification(`${this.nodeTypes[type]?.title || type} node added`, 'success');
    }

    /**
     * Render node on canvas
     */
    renderNode(node) {
        if (!this.nodesLayer) return;

        const nodeEl = document.createElement('div');
        nodeEl.className = `flow-node ${node.type}`;
        nodeEl.dataset.nodeId = node.id;
        nodeEl.style.left = node.position.x + 'px';
        nodeEl.style.top = node.position.y + 'px';

        const nodeType = this.nodeTypes[node.type] || this.nodeTypes.message;
        
        nodeEl.innerHTML = `
            <div class="node-header" style="background-color: ${nodeType.color}">
                <div class="node-icon">
                    <i class="${nodeType.icon}"></i>
                </div>
                <div class="node-title">${nodeType.title}</div>
                <div class="node-controls">
                    <button class="node-btn connect-btn" onclick="window.botBuilder.modules.visual.startConnection('${node.id}')" title="Connect">
                        <i class="fas fa-link"></i>
                    </button>
                    <button class="node-btn delete-btn" onclick="window.botBuilder.modules.visual.deleteNode('${node.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="node-content">
                <div class="node-text">${this.truncateText(node.content, 50)}</div>
            </div>
            <div class="node-ports">
                <div class="port input-port" data-port="input"></div>
                <div class="port output-port" data-port="output"></div>
            </div>
        `;

        // Add event listeners
        nodeEl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectNode(node.id);
        });

        nodeEl.addEventListener('mousedown', (e) => {
            if (e.target.closest('.node-btn')) return;
            this.startNodeDrag(node.id, e);
        });

        this.nodesLayer.appendChild(nodeEl);
    }

    /**
     * Select node and show properties
     */
    selectNode(nodeId) {
        // Clear previous selection
        document.querySelectorAll('.flow-node.selected').forEach(el => {
            el.classList.remove('selected');
        });

        // Select new node
        const nodeEl = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeEl) {
            nodeEl.classList.add('selected');
            this.selectedNode = nodeId;
            this.showNodeProperties(nodeId);
        }
    }

    /**
     * Show node properties panel
     */
    showNodeProperties(nodeId) {
        const propertiesPanel = document.getElementById('visualProperties');
        if (!propertiesPanel) return;

        const bot = this.core.getCurrentBot();
        const node = bot.nodes?.find(n => n.id === nodeId);
        if (!node) return;

        const nodeType = this.nodeTypes[node.type] || this.nodeTypes.message;

        propertiesPanel.innerHTML = `
            <h3>${nodeType.title} Properties</h3>
            <div class="node-properties-form">
                ${this.renderNodePropertiesForm(node)}
            </div>
        `;
    }

    /**
     * Render node properties form
     */
    renderNodePropertiesForm(node) {
        const baseForm = `
            <div class="form-group">
                <label class="form-label">Content</label>
                <textarea class="form-textarea" 
                          onchange="window.botBuilder.modules.visual.updateNodeProperty('${node.id}', 'content', this.value)"
                          rows="3">${node.content}</textarea>
            </div>
        `;

        switch (node.type) {
            case 'menu':
                return baseForm + `
                    <div class="form-group">
                        <label class="form-label">Menu Options</label>
                        <div class="menu-options-editor">
                            ${(node.config.options || []).map((option, index) => `
                                <div class="option-item">
                                    <input type="text" 
                                           class="form-input" 
                                           value="${option}" 
                                           onchange="window.botBuilder.modules.visual.updateMenuOption('${node.id}', ${index}, this.value)">
                                    <button class="btn btn-danger btn-small" 
                                            onclick="window.botBuilder.modules.visual.removeMenuOption('${node.id}', ${index})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        <button class="btn btn-secondary btn-small" 
                                onclick="window.botBuilder.modules.visual.addMenuOption('${node.id}')">
                            <i class="fas fa-plus"></i> Add Option
                        </button>
                    </div>
                `;

            case 'form':
                return baseForm + `
                    <div class="form-group">
                        <label class="form-label">Form Fields</label>
                        <div class="form-fields-editor">
                            ${(node.config.fields || []).map((field, index) => `
                                <div class="field-item">
                                    <input type="text" 
                                           class="form-input" 
                                           value="${field}" 
                                           onchange="window.botBuilder.modules.visual.updateFormField('${node.id}', ${index}, this.value)"
                                           placeholder="Field name">
                                    <button class="btn btn-danger btn-small" 
                                            onclick="window.botBuilder.modules.visual.removeFormField('${node.id}', ${index})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        <button class="btn btn-secondary btn-small" 
                                onclick="window.botBuilder.modules.visual.addFormField('${node.id}')">
                            <i class="fas fa-plus"></i> Add Field
                        </button>
                    </div>
                `;

            case 'condition':
                return baseForm + `
                    <div class="form-group">
                        <label class="form-label">Condition</label>
                        <input type="text" 
                               class="form-input" 
                               value="${node.config.condition || ''}"
                               onchange="window.botBuilder.modules.visual.updateNodeProperty('${node.id}', 'config.condition', this.value)"
                               placeholder="e.g., user.age > 18">
                    </div>
                `;

            case 'action':
                return baseForm + `
                    <div class="form-group">
                        <label class="form-label">Action Type</label>
                        <select class="form-select" 
                                onchange="window.botBuilder.modules.visual.updateNodeProperty('${node.id}', 'config.actionType', this.value)">
                            <option value="email" ${node.config.actionType === 'email' ? 'selected' : ''}>Send Email</option>
                            <option value="webhook" ${node.config.actionType === 'webhook' ? 'selected' : ''}>Call Webhook</option>
                            <option value="save" ${node.config.actionType === 'save' ? 'selected' : ''}>Save Data</option>
                            <option value="redirect" ${node.config.actionType === 'redirect' ? 'selected' : ''}>Redirect</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Action Data</label>
                        <textarea class="form-textarea" 
                                  onchange="window.botBuilder.modules.visual.updateNodeProperty('${node.id}', 'config.actionData', this.value)"
                                  rows="3"
                                  placeholder="Action configuration (JSON)">${JSON.stringify(node.config.actionData || {}, null, 2)}</textarea>
                    </div>
                `;

            case 'webhook':
                return baseForm + `
                    <div class="form-group">
                        <label class="form-label">Webhook URL</label>
                        <input type="url" 
                               class="form-input" 
                               value="${node.config.url || ''}"
                               onchange="window.botBuilder.modules.visual.updateNodeProperty('${node.id}', 'config.url', this.value)"
                               placeholder="https://api.example.com/webhook">
                    </div>
                    <div class="form-group">
                        <label class="form-label">HTTP Method</label>
                        <select class="form-select" 
                                onchange="window.botBuilder.modules.visual.updateNodeProperty('${node.id}', 'config.method', this.value)">
                            <option value="POST" ${node.config.method === 'POST' ? 'selected' : ''}>POST</option>
                            <option value="GET" ${node.config.method === 'GET' ? 'selected' : ''}>GET</option>
                            <option value="PUT" ${node.config.method === 'PUT' ? 'selected' : ''}>PUT</option>
                            <option value="DELETE" ${node.config.method === 'DELETE' ? 'selected' : ''}>DELETE</option>
                        </select>
                    </div>
                `;

            default:
                return baseForm;
        }
    }

    /**
     * Update node property
     */
    updateNodeProperty(nodeId, property, value) {
        const bot = this.core.getCurrentBot();
        const node = bot.nodes?.find(n => n.id === nodeId);
        if (!node) return;

        // Handle nested properties
        if (property.includes('.')) {
            const parts = property.split('.');
            let obj = node;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!obj[parts[i]]) obj[parts[i]] = {};
                obj = obj[parts[i]];
            }
            obj[parts[parts.length - 1]] = value;
        } else {
            node[property] = value;
        }

        this.core.updateBotProperty('nodes', bot.nodes, true);

        // Re-render node if content changed
        if (property === 'content') {
            this.refreshNode(nodeId);
        }
    }

    /**
     * Refresh node display
     */
    refreshNode(nodeId) {
        const nodeEl = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeEl) {
            const bot = this.core.getCurrentBot();
            const node = bot.nodes?.find(n => n.id === nodeId);
            if (node) {
                const contentEl = nodeEl.querySelector('.node-text');
                if (contentEl) {
                    contentEl.textContent = this.truncateText(node.content, 50);
                }
            }
        }
    }

    /**
     * Delete node
     */
    deleteNode(nodeId) {
        if (confirm('Are you sure you want to delete this node?')) {
            const bot = this.core.getCurrentBot();
            
            // Remove node
            bot.nodes = bot.nodes?.filter(n => n.id !== nodeId) || [];
            
            // Remove connected edges
            bot.edges = bot.edges?.filter(e => e.from !== nodeId && e.to !== nodeId) || [];
            
            this.core.updateBotProperty('nodes', bot.nodes, true);
            this.core.updateBotProperty('edges', bot.edges, true);

            // Remove from DOM
            const nodeEl = document.querySelector(`[data-node-id="${nodeId}"]`);
            if (nodeEl) {
                nodeEl.remove();
            }

            // Clear properties if this node was selected
            if (this.selectedNode === nodeId) {
                this.selectedNode = null;
                const propertiesPanel = document.getElementById('visualProperties');
                if (propertiesPanel) {
                    propertiesPanel.innerHTML = `
                        <h3>Node Properties</h3>
                        <p class="no-selection">Select a node to edit its properties</p>
                    `;
                }
            }

            // Refresh connections
            this.refreshConnections();
            
            this.core.showNotification('Node deleted', 'success');
        }
    }

    /**
     * Helper methods
     */

    generateNodeId() {
        return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getNextNodePosition() {
        const bot = this.core.getCurrentBot();
        const existingNodes = bot.nodes || [];
        
        if (existingNodes.length === 0) {
            return { x: 200, y: 150 };
        }

        // Find a position that doesn't overlap
        let x = 200;
        let y = 150;
        const spacing = 200;

        for (let i = 0; i < existingNodes.length; i++) {
            x += spacing;
            if (x > 800) {
                x = 200;
                y += 150;
            }
        }

        return { x, y };
    }

    getDefaultNodeContent(type) {
        const defaults = {
            message: 'Enter your message here',
            menu: 'Please select an option:',
            form: 'Please fill out the form:',
            condition: 'Check condition',
            action: 'Perform action',
            webhook: 'Call external API'
        };
        return defaults[type] || 'Node content';
    }

    getDefaultNodeConfig(type) {
        const defaults = {
            message: {},
            menu: { options: ['Option 1', 'Option 2'] },
            form: { fields: ['name', 'email'] },
            condition: { condition: '' },
            action: { actionType: 'email', actionData: {} },
            webhook: { url: '', method: 'POST' }
        };
        return defaults[type] || {};
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    /**
     * Canvas interaction methods
     */

    handleCanvasClick(e) {
        if (e.target === this.canvas) {
            this.clearSelection();
        }
    }

    handleMouseDown(e) {
        if (e.target === this.canvas && !this.isConnecting) {
            this.isPanning = true;
            this.panStart = { x: e.clientX - this.panOffset.x, y: e.clientY - this.panOffset.y };
        }
    }

    handleMouseMove(e) {
        if (this.isPanning) {
            this.panOffset.x = e.clientX - this.panStart.x;
            this.panOffset.y = e.clientY - this.panStart.y;
            this.updateCanvasTransform();
        }
    }

    handleMouseUp(e) {
        this.isPanning = false;
    }

    handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom = Math.min(Math.max(this.zoom * delta, 0.1), 3);
        this.updateCanvasTransform();
    }

    updateCanvasTransform() {
        if (this.nodesLayer) {
            this.nodesLayer.style.transform = `translate(${this.panOffset.x}px, ${this.panOffset.y}px) scale(${this.zoom})`;
        }
        if (this.connectionsLayer) {
            this.connectionsLayer.style.transform = `translate(${this.panOffset.x}px, ${this.panOffset.y}px) scale(${this.zoom})`;
        }
    }

    clearSelection() {
        document.querySelectorAll('.flow-node.selected').forEach(el => {
            el.classList.remove('selected');
        });
        this.selectedNode = null;
        
        const propertiesPanel = document.getElementById('visualProperties');
        if (propertiesPanel) {
            propertiesPanel.innerHTML = `
                <h3>Node Properties</h3>
                <p class="no-selection">Select a node to edit its properties</p>
            `;
        }
    }

    /**
     * Toolbar actions
     */

    zoomIn() {
        this.zoom = Math.min(this.zoom * 1.2, 3);
        this.updateCanvasTransform();
    }

    zoomOut() {
        this.zoom = Math.max(this.zoom * 0.8, 0.1);
        this.updateCanvasTransform();
    }

    resetZoom() {
        this.zoom = 1;
        this.panOffset = { x: 0, y: 0 };
        this.updateCanvasTransform();
    }

    clearCanvas() {
        if (this.nodesLayer) {
            this.nodesLayer.innerHTML = '';
        }
        if (this.connectionsLayer) {
            this.connectionsLayer.innerHTML = '';
        }
        this.selectedNode = null;
    }

    autoLayout() {
        // TODO: Implement automatic layout algorithm
        this.core.showNotification('Auto layout feature coming soon!', 'info');
    }

    /**
     * Connection handling (simplified for now)
     */

    startConnection(nodeId) {
        this.isConnecting = true;
        this.connectionStart = nodeId;
        this.core.showNotification('Click another node to create connection', 'info');
    }

    /**
     * Render connections (simplified)
     */
    renderConnection(edge) {
        // This would render SVG connections between nodes
        // Simplified for now
    }

    refreshConnections() {
        // This would refresh all connection visuals
        // Simplified for now
    }

    /**
     * Menu and form helpers
     */

    updateMenuOption(nodeId, index, value) {
        const bot = this.core.getCurrentBot();
        const node = bot.nodes?.find(n => n.id === nodeId);
        if (node && node.config.options) {
            node.config.options[index] = value;
            this.core.updateBotProperty('nodes', bot.nodes, true);
        }
    }

    addMenuOption(nodeId) {
        const bot = this.core.getCurrentBot();
        const node = bot.nodes?.find(n => n.id === nodeId);
        if (node) {
            if (!node.config.options) node.config.options = [];
            node.config.options.push('New Option');
            this.core.updateBotProperty('nodes', bot.nodes, true);
            this.showNodeProperties(nodeId);
        }
    }

    removeMenuOption(nodeId, index) {
        const bot = this.core.getCurrentBot();
        const node = bot.nodes?.find(n => n.id === nodeId);
        if (node && node.config.options) {
            node.config.options.splice(index, 1);
            this.core.updateBotProperty('nodes', bot.nodes, true);
            this.showNodeProperties(nodeId);
        }
    }

    updateFormField(nodeId, index, value) {
        const bot = this.core.getCurrentBot();
        const node = bot.nodes?.find(n => n.id === nodeId);
        if (node && node.config.fields) {
            node.config.fields[index] = value;
            this.core.updateBotProperty('nodes', bot.nodes, true);
        }
    }

    addFormField(nodeId) {
        const bot = this.core.getCurrentBot();
        const node = bot.nodes?.find(n => n.id === nodeId);
        if (node) {
            if (!node.config.fields) node.config.fields = [];
            node.config.fields.push('new_field');
            this.core.updateBotProperty('nodes', bot.nodes, true);
            this.showNodeProperties(nodeId);
        }
    }

    removeFormField(nodeId, index) {
        const bot = this.core.getCurrentBot();
        const node = bot.nodes?.find(n => n.id === nodeId);
        if (node && node.config.fields) {
            node.config.fields.splice(index, 1);
            this.core.updateBotProperty('nodes', bot.nodes, true);
            this.showNodeProperties(nodeId);
        }
    }

    /**
     * Update visual editor with new bot data
     */
    update(bot) {
        // Reload the visual editor if we're currently on the visual tab
        const visualTab = document.getElementById('visual-tab');
        if (visualTab && visualTab.classList.contains('active')) {
            this.loadVisualEditor();
        }
    }
}

// Export for use in other modules
window.BotBuilderVisual = BotBuilderVisual;
