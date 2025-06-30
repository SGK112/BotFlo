/**
 * FlowBuilderCore - Core functionality for the Advanced Flow Builder
 * Handles node management, connections, and core operations
 */
class FlowBuilderCore {
    constructor() {
        this.nodes = new Map();
        this.connections = new Map();
        this.selectedNode = null;
        this.nodeCounter = 0;
        this.history = [];
        this.historyIndex = -1;
        
        this.canvas = document.getElementById('canvas');
        this.canvasContainer = document.getElementById('canvasContainer');
        this.propertiesContent = document.getElementById('propertiesContent');
        this.emptyState = document.getElementById('emptyState');
        
        this.chatbotData = {
            name: 'Untitled Chatbot',
            nodes: [],
            connections: [],
            settings: {
                welcomeMessage: 'Hello! How can I help you today?',
                fallbackMessage: 'I didn\'t understand that. Could you try again?',
                theme: 'default'
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateStats();
        console.log('✅ FlowBuilderCore initialized');
    }
    
    setupEventListeners() {
        // Drag and drop for components
        const componentItems = document.querySelectorAll('.component-item');
        componentItems.forEach(item => {
            item.addEventListener('dragstart', this.handleComponentDragStart.bind(this));
        });
        
        // Canvas drop events
        if (this.canvas) {
            this.canvas.addEventListener('dragover', this.handleCanvasDragOver.bind(this));
            this.canvas.addEventListener('drop', this.handleCanvasDrop.bind(this));
        }
        
        // Component search
        const searchInput = document.getElementById('componentSearch');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleComponentSearch.bind(this));
        }
        
        // Click outside to deselect
        document.addEventListener('click', this.handleDocumentClick.bind(this));
    }
    
    handleComponentDragStart(e) {
        this.draggedComponent = {
            type: e.target.getAttribute('data-type'),
            name: e.target.querySelector('.component-name').textContent
        };
        e.dataTransfer.effectAllowed = 'copy';
    }
    
    handleCanvasDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }
    
    handleCanvasDrop(e) {
        e.preventDefault();
        if (!this.draggedComponent) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left + this.canvasContainer.scrollLeft;
        const y = e.clientY - rect.top + this.canvasContainer.scrollTop;
        
        this.createNode(this.draggedComponent.type, x, y);
        this.draggedComponent = null;
    }
    
    handleComponentSearch(e) {
        const query = e.target.value.toLowerCase();
        const components = document.querySelectorAll('.component-item');
        
        components.forEach(component => {
            const name = component.querySelector('.component-name').textContent.toLowerCase();
            const desc = component.querySelector('.component-desc').textContent.toLowerCase();
            const match = name.includes(query) || desc.includes(query);
            component.style.display = match ? 'flex' : 'none';
        });
    }
    
    handleDocumentClick(e) {
        if (!e.target.closest('.flow-node')) {
            this.selectNode(null);
        }
    }
    
    createNode(type, x, y) {
        const nodeId = 'node-' + (++this.nodeCounter);
        const node = {
            id: nodeId,
            type: type,
            x: x,
            y: y,
            data: this.getDefaultNodeData(type)
        };
        
        this.nodes.set(nodeId, node);
        this.renderNode(node);
        this.selectNode(nodeId);
        this.updateStats();
        this.saveToHistory();
        
        // Hide empty state
        if (this.emptyState) {
            this.emptyState.style.display = 'none';
        }
        
        this.showNotification(this.getNodeTypeLabel(type) + ' component added', 'success');
        
        return node;
    }
    
    getDefaultNodeData(type) {
        const defaults = {
            'message': {
                title: 'Welcome Message',
                content: 'Hello! Welcome to our chatbot. How can I help you today?',
                delay: 0
            },
            'question': {
                title: 'User Question',
                content: 'What would you like to do?',
                options: ['Get Support', 'Learn More', 'Contact Sales']
            },
            'condition': {
                title: 'Condition Check',
                variable: 'user_response',
                operator: 'equals',
                value: 'yes'
            }
        };
        
        return defaults[type] || { title: 'New Component' };
    }
    
    getNodeTypeLabel(type) {
        const labels = {
            'message': 'Text Message',
            'question': 'Question',
            'condition': 'Condition'
        };
        return labels[type] || type;
    }
    
    getNodeIcon(type) {
        const icons = {
            'message': 'fas fa-comment',
            'question': 'fas fa-question-circle',
            'condition': 'fas fa-code-branch'
        };
        return icons[type] || 'fas fa-cube';
    }
    
    renderNode(node) {
        const nodeElement = document.createElement('div');
        nodeElement.className = 'flow-node';
        nodeElement.id = node.id;
        nodeElement.style.left = node.x + 'px';
        nodeElement.style.top = node.y + 'px';
        nodeElement.style.position = 'absolute';
        nodeElement.style.width = '300px';
        nodeElement.style.background = 'white';
        nodeElement.style.border = '2px solid var(--gray-200)';
        nodeElement.style.borderRadius = 'var(--border-radius-xl)';
        nodeElement.style.boxShadow = 'var(--shadow-lg)';
        nodeElement.style.cursor = 'move';
        nodeElement.style.transition = 'all 0.2s ease';
        nodeElement.style.userSelect = 'none';
        
        const iconClass = this.getNodeIcon(node.type);
        const iconColorClass = 'icon-' + node.type;
        
        nodeElement.innerHTML = 
            '<div class="node-header" style="display: flex; align-items: center; gap: var(--space-4); padding: var(--space-5); border-bottom: 1px solid var(--gray-200); background: var(--gray-50); border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;">' +
                '<div class="node-icon" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: var(--border-radius); font-size: 1rem; color: white; background: var(--primary);">' +
                    '<i class="' + iconClass + '"></i>' +
                '</div>' +
                '<div class="node-title" style="flex: 1; font-weight: 600; color: var(--gray-900); font-size: 0.875rem;">' + node.data.title + '</div>' +
                '<div class="node-actions">' +
                    '<button class="node-action" onclick="flowBuilder.deleteNode(\'' + node.id + '\')" title="Delete" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 4px; border: none; background: transparent; color: var(--gray-500); cursor: pointer; transition: all 0.2s ease;">' +
                        '<i class="fas fa-trash"></i>' +
                    '</button>' +
                '</div>' +
            '</div>' +
            '<div class="node-content" style="padding: var(--space-6);">' +
                this.renderNodeContent(node) +
            '</div>';
        
        // Add event listeners
        nodeElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectNode(node.id);
        });
        
        // Make draggable
        this.makeDraggable(nodeElement, node);
        
        this.canvas.appendChild(nodeElement);
    }
    
    renderNodeContent(node) {
        switch (node.type) {
            case 'message':
                return '<div class="node-field">' +
                    '<div class="field-label" style="display: block; font-size: 0.75rem; font-weight: 600; color: var(--gray-700); margin-bottom: var(--space-3); text-transform: uppercase; letter-spacing: 0.05em;">Message</div>' +
                    '<div class="field-preview" style="padding: 8px; background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: 4px; font-size: 0.875rem;">' +
                        this.truncateText(node.data.content, 50) +
                    '</div>' +
                '</div>';
            case 'question':
                return '<div class="node-field">' +
                    '<div class="field-label" style="display: block; font-size: 0.75rem; font-weight: 600; color: var(--gray-700); margin-bottom: var(--space-3); text-transform: uppercase; letter-spacing: 0.05em;">Question</div>' +
                    '<div class="field-preview" style="padding: 8px; background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: 4px; font-size: 0.875rem; margin-bottom: var(--space-2);">' +
                        this.truncateText(node.data.content, 50) +
                    '</div>' +
                    '<div style="display: flex; flex-wrap: wrap; gap: 4px;">' +
                        node.data.options.slice(0, 3).map(opt => 
                            '<span style="background: var(--primary-light); color: var(--primary); padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">' + this.truncateText(opt, 15) + '</span>'
                        ).join('') +
                        (node.data.options.length > 3 ? '<span style="color: var(--gray-500); font-size: 0.75rem;">+' + (node.data.options.length - 3) + ' more</span>' : '') +
                    '</div>' +
                '</div>';
            case 'condition':
                return '<div class="node-field">' +
                    '<div class="field-label" style="display: block; font-size: 0.75rem; font-weight: 600; color: var(--gray-700); margin-bottom: var(--space-3); text-transform: uppercase; letter-spacing: 0.05em;">Condition</div>' +
                    '<div style="font-size: 0.75rem; color: var(--gray-600);">' +
                        node.data.variable + ' ' + node.data.operator + ' "' + node.data.value + '"' +
                    '</div>' +
                '</div>';
            default:
                return '<div style="color: var(--gray-500); font-size: 0.75rem;">Configure in properties panel</div>';
        }
    }
    
    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
    
    makeDraggable(element, node) {
        let isDragging = false;
        let startX, startY, initialX, initialY;
        
        element.addEventListener('mousedown', (e) => {
            if (e.target.closest('.node-action')) return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = node.x;
            initialY = node.y;
            
            element.style.zIndex = '1000';
            element.style.transform = 'rotate(2deg)';
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            node.x = initialX + deltaX;
            node.y = initialY + deltaY;
            
            element.style.left = node.x + 'px';
            element.style.top = node.y + 'px';
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.zIndex = '';
                element.style.transform = '';
                this.saveToHistory();
            }
        });
    }
    
    selectNode(nodeId) {
        // Remove previous selection
        document.querySelectorAll('.flow-node').forEach(node => {
            node.style.borderColor = 'var(--gray-200)';
            node.style.boxShadow = 'var(--shadow-lg)';
        });
        
        this.selectedNode = nodeId;
        
        if (nodeId) {
            const nodeElement = document.getElementById(nodeId);
            if (nodeElement) {
                nodeElement.style.borderColor = 'var(--primary)';
                nodeElement.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1), var(--shadow-xl)';
            }
            this.showNodeProperties(nodeId);
        } else {
            this.showEmptyProperties();
        }
    }
    
    showNodeProperties(nodeId) {
        const node = this.nodes.get(nodeId);
        if (!node) return;
        
        this.propertiesContent.innerHTML = 
            '<div class="property-section" style="margin-bottom: var(--space-12);">' +
                '<div class="section-title" style="font-size: 1rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-6); display: flex; align-items: center; gap: var(--space-2);">' +
                    '<i class="' + this.getNodeIcon(node.type) + '"></i>' +
                    this.getNodeTypeLabel(node.type) +
                '</div>' +
                '<div class="property-group" style="background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: var(--border-radius-xl); padding: var(--space-6); margin-bottom: var(--space-6);">' +
                    '<div class="property-field" style="margin-bottom: var(--space-6);">' +
                        '<label class="property-label" style="display: block; font-size: 0.875rem; font-weight: 600; color: var(--gray-700); margin-bottom: var(--space-3);">Node Title</label>' +
                        '<input type="text" class="property-input" value="' + node.data.title + '" onchange="flowBuilder.updateNodeProperty(\'' + nodeId + '\', \'title\', this.value)" style="width: 100%; padding: var(--space-4); border: 1px solid var(--gray-300); border-radius: var(--border-radius-lg); font-size: 0.875rem; font-family: inherit; background: white;">' +
                    '</div>' +
                    this.renderNodePropertyFields(node) +
                '</div>' +
            '</div>' +
            '<div class="property-section">' +
                '<div class="section-title" style="font-size: 1rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--space-6); display: flex; align-items: center; gap: var(--space-2);">' +
                    '<i class="fas fa-trash"></i>' +
                    'Actions' +
                '</div>' +
                '<div class="property-group" style="background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: var(--border-radius-xl); padding: var(--space-6);">' +
                    '<button class="btn btn-secondary" onclick="flowBuilder.deleteNode(\'' + nodeId + '\')" style="width: 100%; color: var(--error); border-color: var(--error);">' +
                        '<i class="fas fa-trash"></i>' +
                        'Delete Node' +
                    '</button>' +
                '</div>' +
            '</div>';
    }
    
    renderNodePropertyFields(node) {
        switch (node.type) {
            case 'message':
                return '<div class="property-field" style="margin-bottom: var(--space-6);">' +
                    '<label class="property-label" style="display: block; font-size: 0.875rem; font-weight: 600; color: var(--gray-700); margin-bottom: var(--space-3);">Message Content</label>' +
                    '<textarea class="property-input" onchange="flowBuilder.updateNodeProperty(\'' + node.id + '\', \'content\', this.value)" style="width: 100%; padding: var(--space-4); border: 1px solid var(--gray-300); border-radius: var(--border-radius-lg); font-size: 0.875rem; font-family: inherit; background: white; min-height: 100px; resize: vertical;">' + node.data.content + '</textarea>' +
                '</div>';
            case 'question':
                return '<div class="property-field" style="margin-bottom: var(--space-6);">' +
                    '<label class="property-label" style="display: block; font-size: 0.875rem; font-weight: 600; color: var(--gray-700); margin-bottom: var(--space-3);">Question Text</label>' +
                    '<textarea class="property-input" onchange="flowBuilder.updateNodeProperty(\'' + node.id + '\', \'content\', this.value)" style="width: 100%; padding: var(--space-4); border: 1px solid var(--gray-300); border-radius: var(--border-radius-lg); font-size: 0.875rem; font-family: inherit; background: white; min-height: 80px; resize: vertical;">' + node.data.content + '</textarea>' +
                '</div>' +
                '<div class="property-field">' +
                    '<label class="property-label" style="display: block; font-size: 0.875rem; font-weight: 600; color: var(--gray-700); margin-bottom: var(--space-3);">Answer Options (one per line)</label>' +
                    '<textarea class="property-input" onchange="flowBuilder.updateNodeProperty(\'' + node.id + '\', \'options\', this.value.split(\'\\n\').filter(o => o.trim()))" style="width: 100%; padding: var(--space-4); border: 1px solid var(--gray-300); border-radius: var(--border-radius-lg); font-size: 0.875rem; font-family: inherit; background: white; min-height: 80px; resize: vertical;">' + node.data.options.join('\n') + '</textarea>' +
                '</div>';
            case 'condition':
                return '<div class="property-field" style="margin-bottom: var(--space-6);">' +
                    '<label class="property-label" style="display: block; font-size: 0.875rem; font-weight: 600; color: var(--gray-700); margin-bottom: var(--space-3);">Variable</label>' +
                    '<input type="text" class="property-input" value="' + node.data.variable + '" onchange="flowBuilder.updateNodeProperty(\'' + node.id + '\', \'variable\', this.value)" style="width: 100%; padding: var(--space-4); border: 1px solid var(--gray-300); border-radius: var(--border-radius-lg); font-size: 0.875rem; font-family: inherit; background: white;">' +
                '</div>' +
                '<div class="property-field">' +
                    '<label class="property-label" style="display: block; font-size: 0.875rem; font-weight: 600; color: var(--gray-700); margin-bottom: var(--space-3);">Value</label>' +
                    '<input type="text" class="property-input" value="' + node.data.value + '" onchange="flowBuilder.updateNodeProperty(\'' + node.id + '\', \'value\', this.value)" style="width: 100%; padding: var(--space-4); border: 1px solid var(--gray-300); border-radius: var(--border-radius-lg); font-size: 0.875rem; font-family: inherit; background: white;">' +
                '</div>';
            default:
                return '<p style="color: var(--gray-500); font-size: 0.875rem;">No properties available for this component.</p>';
        }
    }
    
    showEmptyProperties() {
        this.propertiesContent.innerHTML = 
            '<div class="empty-state">' +
                '<div class="empty-icon" style="font-size: 4rem; margin-bottom: var(--space-6); color: var(--gray-300);">' +
                    '<i class="fas fa-mouse-pointer"></i>' +
                '</div>' +
                '<div class="empty-title" style="font-size: 1.5rem; font-weight: 600; color: var(--gray-700); margin-bottom: var(--space-4);">No Selection</div>' +
                '<div class="empty-description" style="font-size: 1rem; color: var(--gray-500); max-width: 400px; line-height: 1.6;">' +
                    'Select a node to edit its properties and configure its behavior.' +
                '</div>' +
            '</div>';
    }
    
    updateNodeProperty(nodeId, property, value) {
        const node = this.nodes.get(nodeId);
        if (!node) return;
        
        node.data[property] = value;
        
        // Re-render the node content
        const nodeElement = document.getElementById(nodeId);
        if (nodeElement) {
            const contentElement = nodeElement.querySelector('.node-content');
            contentElement.innerHTML = this.renderNodeContent(node);
            
            // Update title in header
            const titleElement = nodeElement.querySelector('.node-title');
            if (titleElement && property === 'title') {
                titleElement.textContent = value;
            }
        }
        
        this.saveToHistory();
    }
    
    deleteNode(nodeId) {
        if (!this.nodes.has(nodeId)) return;
        
        // Remove the node element
        const nodeElement = document.getElementById(nodeId);
        if (nodeElement) {
            nodeElement.remove();
        }
        
        // Remove from nodes map
        this.nodes.delete(nodeId);
        
        // Deselect if this was the selected node
        if (this.selectedNode === nodeId) {
            this.selectNode(null);
        }
        
        this.updateStats();
        this.saveToHistory();
        
        // Show empty state if no nodes
        if (this.nodes.size === 0 && this.emptyState) {
            this.emptyState.style.display = 'flex';
        }
        
        this.showNotification('Node deleted', 'success');
    }
    
    updateStats() {
        const nodeCount = this.nodes.size;
        const nodeCountElement = document.getElementById('nodeCount');
        if (nodeCountElement) {
            nodeCountElement.textContent = nodeCount + ' node' + (nodeCount !== 1 ? 's' : '');
        }
    }
    
    saveToHistory() {
        const state = {
            nodes: Array.from(this.nodes.entries()),
            connections: Array.from(this.connections.entries())
        };
        
        // Remove future history if we're not at the end
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        this.history.push(JSON.parse(JSON.stringify(state)));
        this.historyIndex = this.history.length - 1;
        
        // Limit history size
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.loadFromHistory();
            this.showNotification('Undo performed', 'info');
        }
    }
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.loadFromHistory();
            this.showNotification('Redo performed', 'info');
        }
    }
    
    loadFromHistory() {
        if (this.historyIndex < 0 || this.historyIndex >= this.history.length) return;
        
        const state = this.history[this.historyIndex];
        
        // Clear current nodes
        this.nodes.clear();
        this.connections.clear();
        this.canvas.innerHTML = '';
        
        // Add empty state back
        if (this.emptyState) {
            this.canvas.appendChild(this.emptyState);
        }
        
        // Restore nodes
        state.nodes.forEach(([id, node]) => {
            this.nodes.set(id, node);
            this.renderNode(node);
        });
        
        this.updateStats();
        this.selectNode(null);
        
        // Show/hide empty state
        if (this.nodes.size === 0 && this.emptyState) {
            this.emptyState.style.display = 'flex';
        } else if (this.emptyState) {
            this.emptyState.style.display = 'none';
        }
    }
    
    showNotification(message, type) {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log('[' + type.toUpperCase() + '] ' + message);
        }
    }
    
    // Export functionality
    save() {
        const data = this.exportChatbotData();
        localStorage.setItem('botflo-chatbot', JSON.stringify(data));
        
        const lastSaved = document.getElementById('lastSaved');
        if (lastSaved) {
            lastSaved.textContent = 'Just now';
        }
        
        this.showNotification('Chatbot saved successfully!', 'success');
    }
    
    test() {
        if (this.nodes.size === 0) {
            this.showNotification('Add some components first to test your chatbot', 'warning');
            return;
        }
        
        this.showNotification('🧪 Test mode: This would open a live chat simulation!', 'info');
    }
    
    publish() {
        if (this.nodes.size === 0) {
            this.showNotification('Add components to your chatbot before publishing', 'warning');
            return;
        }
        
        this.showNotification('🚀 Publish mode: This would deploy your chatbot!', 'success');
    }
    
    fitToScreen() {
        this.showNotification('📏 Fit to screen: This would zoom to fit all nodes', 'info');
    }
    
    exportChatbotData() {
        return {
            name: this.chatbotData.name,
            version: '1.0',
            created: new Date().toISOString(),
            nodes: Array.from(this.nodes.values()),
            connections: Array.from(this.connections.values()),
            settings: this.chatbotData.settings
        };
    }
}

// Make it globally available
window.FlowBuilderCore = FlowBuilderCore;
