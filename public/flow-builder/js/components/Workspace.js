import { EventEmitter } from '../core/EventEmitter.js';

export class Workspace extends EventEmitter {
    constructor(containerElement) {
        super();
        this.container = containerElement;
        this.canvas = null;
        this.nodes = new Map();
        this.connections = new Map();
        this.selectedElements = new Set();
        this.isUpdatingSelection = false; // Prevent circular events
        this.init();
    }

    init() {
        this.setupWorkspaceHTML();
        this.setupEventListeners();
    }

    setupWorkspaceHTML() {
        this.container.innerHTML = `
            <div class="workspace-header">
                <div class="workspace-title">Flow Designer</div>
                <div class="workspace-actions">
                    <button class="btn btn-sm" id="zoomOut">
                        <i class="fas fa-search-minus"></i>
                    </button>
                    <button class="btn btn-sm" id="zoomReset">100%</button>
                    <button class="btn btn-sm" id="zoomIn">
                        <i class="fas fa-search-plus"></i>
                    </button>
                    <button class="btn btn-sm" id="fitToView">
                        <i class="fas fa-expand-arrows-alt"></i>
                    </button>
                </div>
            </div>
            <div class="workspace-canvas" id="workspace-canvas">
                <canvas id="flow-canvas"></canvas>
                <div class="nodes-container" id="nodes-container"></div>
            </div>
            <div class="workspace-minimap" id="workspace-minimap" style="display: none;">
                <canvas id="minimap-canvas"></canvas>
            </div>
        `;

        this.canvas = this.container.querySelector('#flow-canvas');
        this.nodesContainer = this.container.querySelector('#nodes-container');
    }

    setupEventListeners() {
        // Zoom controls
        this.container.querySelector('#zoomIn').addEventListener('click', () => {
            this.emit('zoomIn');
        });

        this.container.querySelector('#zoomOut').addEventListener('click', () => {
            this.emit('zoomOut');
        });

        this.container.querySelector('#zoomReset').addEventListener('click', () => {
            this.emit('zoomReset');
        });

        this.container.querySelector('#fitToView').addEventListener('click', () => {
            this.emit('fitToView');
        });

        // Canvas events
        this.canvas.addEventListener('drop', this.handleDrop.bind(this));
        this.canvas.addEventListener('dragover', this.handleDragOver.bind(this));
        this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
        this.canvas.addEventListener('contextmenu', this.handleContextMenu.bind(this));

        // Selection events
        this.container.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    handleDrop(event) {
        event.preventDefault();
        const data = event.dataTransfer.getData('text/plain');
        
        try {
            const dropData = JSON.parse(data);
            if (dropData.type === 'component') {
                const rect = this.canvas.getBoundingClientRect();
                const position = {
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top
                };
                
                this.emit('node:drop', {
                    componentType: dropData.componentType,
                    x: position.x,
                    y: position.y
                });
            }
        } catch (error) {
            console.warn('Invalid drop data:', error);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }

    handleCanvasClick(event) {
        if (event.target === this.canvas || event.target.closest('#workspace-canvas')) {
            this.clearSelection();
            this.emit('canvas:click', {
                x: event.offsetX,
                y: event.offsetY
            });
        }
    }

    handleContextMenu(event) {
        event.preventDefault();
        this.emit('contextMenu', {
            x: event.clientX,
            y: event.clientY,
            target: event.target
        });
    }

    handleKeyDown(event) {
        if (event.key === 'Delete' || event.key === 'Backspace') {
            this.deleteSelected();
        } else if (event.key === 'Escape') {
            this.clearSelection();
        } else if (event.ctrlKey || event.metaKey) {
            if (event.key === 'a') {
                event.preventDefault();
                this.selectAll();
            } else if (event.key === 'c') {
                event.preventDefault();
                this.copySelected();
            } else if (event.key === 'v') {
                event.preventDefault();
                this.pasteNodes();
            }
        }
    }

    addNode(nodeConfig) {
        const nodeElement = this.createNodeElement(nodeConfig);
        this.nodesContainer.appendChild(nodeElement);
        this.nodes.set(nodeConfig.id, {
            config: nodeConfig,
            element: nodeElement
        });
        
        this.emit('nodeAdded', nodeConfig);
        return nodeElement;
    }

    createNodeElement(nodeConfig) {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'flow-node';
        nodeDiv.dataset.nodeId = nodeConfig.id;
        nodeDiv.dataset.nodeType = nodeConfig.type;
        
        nodeDiv.style.left = nodeConfig.position.x + 'px';
        nodeDiv.style.top = nodeConfig.position.y + 'px';
        
        nodeDiv.innerHTML = `
            <div class="node-header">
                <div class="node-icon">
                    <i class="${nodeConfig.icon || 'fas fa-cube'}"></i>
                </div>
                <div class="node-title">${nodeConfig.title || nodeConfig.type}</div>
                <div class="node-menu">
                    <button class="node-menu-btn">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
            <div class="node-content">
                ${this.generateNodeContent(nodeConfig)}
            </div>
            <div class="node-ports">
                ${this.generateNodePorts(nodeConfig)}
            </div>
        `;

        this.setupNodeInteractions(nodeDiv, nodeConfig);
        return nodeDiv;
    }

    generateNodeContent(nodeConfig) {
        // Basic content generation - can be extended
        if (nodeConfig.description) {
            return `<div class="node-description">${nodeConfig.description}</div>`;
        }
        return '<div class="node-placeholder">Configure node...</div>';
    }

    generateNodePorts(nodeConfig) {
        let portsHTML = '';
        
        // Input ports
        if (nodeConfig.inputs) {
            nodeConfig.inputs.forEach((input, index) => {
                portsHTML += `
                    <div class="node-port input-port" data-port-type="input" data-port-index="${index}">
                        <div class="port-connector"></div>
                        <span class="port-label">${input.label || input.name}</span>
                    </div>
                `;
            });
        }

        // Output ports
        if (nodeConfig.outputs) {
            nodeConfig.outputs.forEach((output, index) => {
                portsHTML += `
                    <div class="node-port output-port" data-port-type="output" data-port-index="${index}">
                        <span class="port-label">${output.label || output.name}</span>
                        <div class="port-connector"></div>
                    </div>
                `;
            });
        }

        return portsHTML;
    }

    setupNodeInteractions(nodeElement, nodeConfig) {
        // Make node draggable
        this.makeNodeDraggable(nodeElement);
        
        // Node selection
        nodeElement.addEventListener('click', (event) => {
            event.stopPropagation();
            this.selectNode(nodeConfig.id, !event.ctrlKey && !event.metaKey);
        });

        // Port interactions
        const ports = nodeElement.querySelectorAll('.port-connector');
        ports.forEach(port => {
            port.addEventListener('mousedown', (event) => {
                event.stopPropagation();
                this.handlePortMouseDown(event, nodeConfig.id, port);
            });
        });
    }

    makeNodeDraggable(nodeElement) {
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };

        const handleMouseDown = (event) => {
            if (event.target.closest('.port-connector, .node-menu-btn')) return;
            
            isDragging = true;
            const rect = nodeElement.getBoundingClientRect();
            dragOffset.x = event.clientX - rect.left;
            dragOffset.y = event.clientY - rect.top;
            
            nodeElement.classList.add('dragging');
            event.preventDefault();
        };

        const handleMouseMove = (event) => {
            if (!isDragging) return;
            
            const containerRect = this.nodesContainer.getBoundingClientRect();
            const x = event.clientX - containerRect.left - dragOffset.x;
            const y = event.clientY - containerRect.top - dragOffset.y;
            
            nodeElement.style.left = x + 'px';
            nodeElement.style.top = y + 'px';
            
            this.emit('nodeMoved', {
                nodeId: nodeElement.dataset.nodeId,
                position: { x, y }
            });
        };

        const handleMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                nodeElement.classList.remove('dragging');
            }
        };

        nodeElement.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    handlePortMouseDown(event, nodeId, portElement) {
        const portType = portElement.parentElement.dataset.portType;
        const portIndex = portElement.parentElement.dataset.portIndex;
        
        this.emit('portClicked', {
            nodeId,
            portType,
            portIndex,
            position: {
                x: event.clientX,
                y: event.clientY
            }
        });
    }

    selectNode(nodeId, clearOthers = true) {
        if (clearOthers) {
            this.clearSelection();
        }
        
        this.selectedElements.add(nodeId);
        const nodeData = this.nodes.get(nodeId);
        if (nodeData) {
            nodeData.element.classList.add('selected');
            this.emit('nodeSelected', nodeId);
        }
    }

    clearSelection() {
        this.selectedElements.forEach(nodeId => {
            const nodeData = this.nodes.get(nodeId);
            if (nodeData) {
                nodeData.element.classList.remove('selected');
            }
        });
        this.selectedElements.clear();
        this.emit('selectionCleared');
    }

    deleteSelected() {
        const nodesToDelete = Array.from(this.selectedElements);
        nodesToDelete.forEach(nodeId => {
            this.removeNode(nodeId);
        });
        this.clearSelection();
    }

    removeNode(nodeId) {
        const nodeData = this.nodes.get(nodeId);
        if (nodeData) {
            nodeData.element.remove();
            this.nodes.delete(nodeId);
            this.selectedElements.delete(nodeId);
            this.emit('nodeRemoved', nodeId);
        }
    }

    selectAll() {
        this.nodes.forEach((nodeData, nodeId) => {
            this.selectedElements.add(nodeId);
            nodeData.element.classList.add('selected');
        });
        this.emit('allNodesSelected');
    }

    copySelected() {
        const selectedNodes = Array.from(this.selectedElements).map(nodeId => {
            const nodeData = this.nodes.get(nodeId);
            return nodeData ? nodeData.config : null;
        }).filter(Boolean);
        
        if (selectedNodes.length > 0) {
            // Store in clipboard or temporary storage
            this.clipboard = selectedNodes;
            this.emit('nodesCopied', selectedNodes);
        }
    }

    pasteNodes() {
        if (this.clipboard && this.clipboard.length > 0) {
            const offset = { x: 20, y: 20 };
            this.clipboard.forEach(nodeConfig => {
                const newConfig = {
                    ...nodeConfig,
                    id: this.generateNodeId(),
                    position: {
                        x: nodeConfig.position.x + offset.x,
                        y: nodeConfig.position.y + offset.y
                    }
                };
                this.addNode(newConfig);
            });
            this.emit('nodesPasted', this.clipboard);
        }
    }

    generateNodeId() {
        return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getSelectedNodes() {
        return Array.from(this.selectedElements);
    }

    getNodes() {
        return Array.from(this.nodes.values()).map(nodeData => nodeData.config);
    }

    clear() {
        this.nodes.forEach((nodeData) => {
            nodeData.element.remove();
        });
        this.nodes.clear();
        this.connections.clear();
        this.selectedElements.clear();
        this.emit('workspaceCleared');
    }

    /**
     * Add a node to the canvas (called by FlowBuilder)
     * @param {object} node - Node object from NodeManager
     */
    addNodeToCanvas(node) {
        const nodeElement = this.createNodeElement(node);
        this.nodesContainer.appendChild(nodeElement);
        
        this.nodes.set(node.id, {
            config: node,
            element: nodeElement
        });
        
        this.emit('nodeAdded', node);
    }

    /**
     * Remove a node from the canvas
     * @param {string} nodeId - Node ID to remove
     */
    removeNodeFromCanvas(nodeId) {
        const nodeData = this.nodes.get(nodeId);
        if (nodeData) {
            nodeData.element.remove();
            this.nodes.delete(nodeId);
            this.selectedElements.delete(nodeId);
            this.emit('nodeRemoved', nodeId);
        }
    }

    /**
     * Select a node (called from FlowBuilder)
     * @param {string} nodeId - Node ID to select
     */
    selectNode(nodeId) {        
        this.clearVisualSelection();
        this.selectedElements.add(nodeId);
        const nodeData = this.nodes.get(nodeId);
        if (nodeData) {
            nodeData.element.classList.add('selected');
        }
        // Don't emit event - this is called in response to NodeManager events
    }

    /**
     * Deselect all nodes (called from FlowBuilder)
     */
    deselectAllNodes() {
        this.clearVisualSelection();
        // Don't emit event - this is called in response to NodeManager events
    }

    /**
     * Update node position
     * @param {string} nodeId - Node ID
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    updateNodePosition(nodeId, x, y) {
        const nodeData = this.nodes.get(nodeId);
        if (nodeData) {
            nodeData.element.style.left = `${x}px`;
            nodeData.element.style.top = `${y}px`;
            nodeData.config.x = x;
            nodeData.config.y = y;
        }
    }

    /**
     * Update node display (refresh node appearance)
     * @param {string} nodeId - Node ID
     */
    updateNodeDisplay(nodeId) {
        const nodeData = this.nodes.get(nodeId);
        if (nodeData) {
            // Update the node element based on new config
            const updatedElement = this.createNodeElement(nodeData.config);
            nodeData.element.replaceWith(updatedElement);
            this.nodes.set(nodeId, {
                config: nodeData.config,
                element: updatedElement
            });
        }
    }

    /**
     * Enable drop mode for drag and drop
     */
    enableDropMode() {
        this.canvas.classList.add('drop-mode');
        this.canvas.style.cursor = 'copy';
    }

    /**
     * Disable drop mode
     */
    disableDropMode() {
        this.canvas.classList.remove('drop-mode');
        this.canvas.style.cursor = 'default';
    }

    /**
     * Create a visual node element
     * @param {object} node - Node configuration
     * @returns {HTMLElement} Node element
     */
    createNodeElement(node) {
        const nodeElement = document.createElement('div');
        nodeElement.className = 'flow-node';
        nodeElement.dataset.nodeId = node.id;
        nodeElement.dataset.nodeType = node.type;
        
        // Position the node
        nodeElement.style.left = `${node.x}px`;
        nodeElement.style.top = `${node.y}px`;
        nodeElement.style.width = `${node.width || 200}px`;
        nodeElement.style.height = `${node.height || 150}px`;
        
        // Create node content
        const nodeConfig = this.getNodeTypeConfig(node.type);
        const icon = nodeConfig?.icon || '⚙️';
        const name = nodeConfig?.name || node.type;
        
        nodeElement.innerHTML = `
            <div class="node-header">
                <span class="node-icon">${icon}</span>
                <span class="node-title">${name}</span>
                <div class="node-actions">
                    <button class="node-delete" onclick="this.closest('.flow-node').dispatchEvent(new CustomEvent('delete-node'))">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="node-content">
                <div class="node-config">
                    ${this.renderNodeConfig(node)}
                </div>
            </div>
            <div class="node-ports">
                <div class="input-port"></div>
                <div class="output-port"></div>
            </div>
        `;
        
        // Add event listeners
        this.setupNodeEventListeners(nodeElement, node);
        
        return nodeElement;
    }

    /**
     * Get node type configuration
     * @param {string} type - Node type
     * @returns {object} Node configuration
     */
    getNodeTypeConfig(type) {
        // Import NODE_CONFIGS if available
        if (window.NODE_CONFIGS) {
            return window.NODE_CONFIGS[type];
        }
        
        // Fallback configurations
        const fallbackConfigs = {
            welcome: { icon: '👋', name: 'Welcome' },
            message: { icon: '💬', name: 'Message' },
            question: { icon: '❓', name: 'Question' },
            condition: { icon: '🔀', name: 'Condition' },
            action: { icon: '⚡', name: 'Action' }
        };
        
        return fallbackConfigs[type] || { icon: '⚙️', name: type };
    }

    /**
     * Render node configuration display
     * @param {object} node - Node object
     * @returns {string} HTML string
     */
    renderNodeConfig(node) {
        if (node.config.message) {
            const message = node.config.message.length > 50 
                ? node.config.message.substring(0, 50) + '...'
                : node.config.message;
            return `<div class="config-message">${message}</div>`;
        }
        
        if (node.config.question) {
            const question = node.config.question.length > 50
                ? node.config.question.substring(0, 50) + '...'
                : node.config.question;
            return `<div class="config-question">${question}</div>`;
        }
        
        return '<div class="config-placeholder">Configure this node</div>';
    }

    /**
     * Setup event listeners for a node element
     * @param {HTMLElement} nodeElement - Node DOM element
     * @param {object} node - Node configuration
     */
    setupNodeEventListeners(nodeElement, node) {
        // Click to select
        nodeElement.addEventListener('click', (e) => {
            e.stopPropagation();
            // Emit directly without going through selectNode to avoid circular calls
            this.emit('node:select', node.id);
        });
        
        // Delete node
        nodeElement.addEventListener('delete-node', () => {
            this.emit('node:delete', node.id);
        });
        
        // Drag to move (basic implementation)
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        
        nodeElement.addEventListener('mousedown', (e) => {
            if (e.target.closest('.node-delete') || e.target.closest('.node-port')) {
                return;
            }
            
            isDragging = true;
            const rect = nodeElement.getBoundingClientRect();
            const canvasRect = this.canvas.getBoundingClientRect();
            
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            
            nodeElement.style.cursor = 'grabbing';
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const canvasRect = this.canvas.getBoundingClientRect();
            const x = e.clientX - canvasRect.left - dragOffset.x;
            const y = e.clientY - canvasRect.top - dragOffset.y;
            
            nodeElement.style.left = `${Math.max(0, x)}px`;
            nodeElement.style.top = `${Math.max(0, y)}px`;
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                nodeElement.style.cursor = 'grab';
                
                const x = parseInt(nodeElement.style.left);
                const y = parseInt(nodeElement.style.top);
                
                this.emit('node:move', {
                    nodeId: node.id,
                    x: x,
                    y: y
                });
            }
        });
    }

    /**
     * Update node selection visually without emitting events (called from FlowBuilder)
     * @param {string} nodeId - Node ID to select
     */
    updateNodeSelection(nodeId) {
        this.clearVisualSelection();
        this.selectedElements.add(nodeId);
        const nodeData = this.nodes.get(nodeId);
        if (nodeData) {
            nodeData.element.classList.add('selected');
        }
        // Don't emit event - this is called in response to NodeManager events
    }

    /**
     * Clear visual selection without emitting events (called from FlowBuilder)
     */
    clearVisualSelection() {
        this.selectedElements.forEach(nodeId => {
            const nodeData = this.nodes.get(nodeId);
            if (nodeData) {
                nodeData.element.classList.remove('selected');
            }
        });
        this.selectedElements.clear();
        // Don't emit event - this is called in response to NodeManager events
    }
}
