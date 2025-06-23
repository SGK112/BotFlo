/**
 * FlowBuilder - Main application class that orchestrates all components
 */
import { EventEmitter } from './core/EventEmitter.js';
import { NodeManager } from './core/NodeManager.js';
import { ComponentLibrary } from './components/ComponentLibrary.js';
import { Workspace } from './components/Workspace.js';
import { PropertiesPanel } from './components/PropertiesPanel.js';
import { NotificationManager } from './components/NotificationManager.js';
import { StorageManager } from './utils/StorageManager.js';

export class FlowBuilder extends EventEmitter {
    constructor() {
        super();
        
        // Initialize core managers
        this.nodeManager = new NodeManager();
        this.storageManager = new StorageManager();
        this.notificationManager = new NotificationManager();
        
        // Initialize UI components
        this.componentLibrary = null;
        this.workspace = null;
        this.propertiesPanel = null;
        
        // Application state
        this.isInitialized = false;
        this.currentProject = null;
        this.isDirty = false;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Initialize UI components
            await this.initializeComponents();
            
            // Set up event handlers
            this.setupEventHandlers();
            
            // Create initial start node
            this.createStartNode();
            
            // Load any saved project
            await this.loadLastProject();
            
            this.isInitialized = true;
            this.emit('app:initialized');
            
            this.notificationManager.show('Flow Builder initialized successfully', 'success');
            
            console.log('FlowBuilder initialized successfully');
        } catch (error) {
            console.error('Failed to initialize FlowBuilder:', error);
            this.notificationManager.show('Failed to initialize application', 'error');
        }
    }

    /**
     * Initialize UI components
     */
    async initializeComponents() {
        // Initialize component library
        const componentLibraryContainer = document.getElementById('component-library');
        if (componentLibraryContainer) {
            this.componentLibrary = new ComponentLibrary(componentLibraryContainer);
            await this.componentLibrary.init();
        }

        // Initialize workspace
        const workspaceContainer = document.getElementById('main-workspace');
        if (workspaceContainer) {
            this.workspace = new Workspace(workspaceContainer, this.nodeManager);
            await this.workspace.init();
        }

        // Initialize properties panel
        const propertiesPanelContainer = document.getElementById('properties-panel');
        if (propertiesPanelContainer) {
            this.propertiesPanel = new PropertiesPanel(propertiesPanelContainer, this.nodeManager);
            await this.propertiesPanel.init();
        }

        // Verify all components are initialized
        if (!this.componentLibrary || !this.workspace || !this.propertiesPanel) {
            throw new Error('Failed to initialize one or more UI components');
        }
    }

    /**
     * Set up event handlers between components
     */
    setupEventHandlers() {
        // Node manager events
        this.nodeManager.on('node:created', (node) => {
            this.workspace?.addNodeToCanvas(node);
            this.markDirty();
            this.emit('flow:changed');
        });

        this.nodeManager.on('node:selected', ({ node }) => {
            this.workspace?.selectNode(node.id);
            this.propertiesPanel?.showNodeProperties(node);
        });

        this.nodeManager.on('node:deselected', () => {
            this.workspace?.deselectAllNodes();
            this.propertiesPanel?.showEmptyState();
        });

        this.nodeManager.on('node:deleted', (node) => {
            this.workspace?.removeNodeFromCanvas(node.id);
            this.markDirty();
            this.emit('flow:changed');
        });

        this.nodeManager.on('node:moved', ({ node }) => {
            this.workspace?.updateNodePosition(node.id, node.x, node.y);
            this.markDirty();
        });

        this.nodeManager.on('node:config:updated', ({ node }) => {
            this.workspace?.updateNodeDisplay(node.id);
            this.propertiesPanel?.updateNodeProperties(node);
            this.markDirty();
            this.emit('flow:changed');
        });

        // Component library events
        this.componentLibrary?.on('component:drag:start', (componentType) => {
            this.workspace?.enableDropMode();
        });

        this.componentLibrary?.on('component:drag:end', () => {
            this.workspace?.disableDropMode();
        });

        // Workspace events
        this.workspace?.on('node:drop', ({ componentType, x, y }) => {
            this.createNode(componentType, x, y);
        });

        this.workspace?.on('node:select', (nodeId) => {
            this.nodeManager.selectNode(nodeId);
        });

        this.workspace?.on('node:deselect', () => {
            this.nodeManager.deselectNode();
        });

        this.workspace?.on('node:move', ({ nodeId, x, y }) => {
            this.nodeManager.updateNodePosition(nodeId, x, y);
        });

        this.workspace?.on('node:delete', (nodeId) => {
            this.deleteNode(nodeId);
        });

        this.workspace?.on('canvas:click', () => {
            this.nodeManager.deselectNode();
        });

        // Properties panel events
        this.propertiesPanel?.on('property:change', ({ nodeId, key, value }) => {
            this.nodeManager.updateNodeConfig(nodeId, key, value);
        });

        // Auto-save
        this.on('flow:changed', this.debounce(() => {
            this.autoSave();
        }, 1000));

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    /**
     * Set up keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            const isCtrlOrCmd = e.ctrlKey || e.metaKey;

            if (isCtrlOrCmd) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveChatbot();
                        break;
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.redo();
                        } else {
                            this.undo();
                        }
                        break;
                    case 'c':
                        e.preventDefault();
                        this.copySelectedNode();
                        break;
                    case 'v':
                        e.preventDefault();
                        this.pasteNode();
                        break;
                    case 'd':
                        e.preventDefault();
                        this.duplicateSelectedNode();
                        break;
                    case 'a':
                        e.preventDefault();
                        this.selectAllNodes();
                        break;
                }
            } else {
                switch (e.key) {
                    case 'Delete':
                    case 'Backspace':
                        e.preventDefault();
                        this.deleteSelectedNode();
                        break;
                    case 'Escape':
                        e.preventDefault();
                        this.nodeManager.deselectNode();
                        break;
                }
            }
        });
    }

    /**
     * Create initial start node
     */
    createStartNode() {
        const startNode = this.nodeManager.createNode('welcome', 100, 100, {}, true);
        this.nodeManager.selectNode(startNode.id);
    }

    /**
     * Create a new node
     * @param {string} type - Node type
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {object} config - Optional configuration
     * @returns {object} Created node
     */
    createNode(type, x, y, config = {}) {
        const node = this.nodeManager.createNode(type, x, y, config);
        this.notificationManager.show(`${node.type} node added`, 'success');
        return node;
    }

    /**
     * Delete a node
     * @param {string} nodeId - Node ID
     * @returns {boolean} Success status
     */
    deleteNode(nodeId) {
        const success = this.nodeManager.deleteNode(nodeId);
        if (success) {
            this.notificationManager.show('Node deleted', 'success');
        }
        return success;
    }

    /**
     * Delete currently selected node
     */
    deleteSelectedNode() {
        const selectedNode = this.nodeManager.getSelectedNode();
        if (selectedNode) {
            this.deleteNode(selectedNode.id);
        }
    }

    /**
     * Copy currently selected node
     */
    copySelectedNode() {
        const selectedNode = this.nodeManager.getSelectedNode();
        if (selectedNode) {
            this.nodeManager.copyNode(selectedNode.id);
            this.notificationManager.show('Node copied', 'success');
        }
    }

    /**
     * Paste node from clipboard
     */
    pasteNode() {
        const bounds = this.workspace?.getViewportBounds();
        const x = bounds ? bounds.centerX : 300;
        const y = bounds ? bounds.centerY : 200;
        
        const pastedNode = this.nodeManager.pasteNode(x, y);
        if (pastedNode) {
            this.notificationManager.show('Node pasted', 'success');
        }
    }

    /**
     * Duplicate currently selected node
     */
    duplicateSelectedNode() {
        const selectedNode = this.nodeManager.getSelectedNode();
        if (selectedNode) {
            const duplicatedNode = this.nodeManager.duplicateNode(selectedNode.id);
            if (duplicatedNode) {
                this.nodeManager.selectNode(duplicatedNode.id);
                this.notificationManager.show('Node duplicated', 'success');
            }
        }
    }

    /**
     * Select all nodes
     */
    selectAllNodes() {
        // TODO: Implement multi-selection
        this.notificationManager.show('Select all not yet implemented', 'info');
    }

    /**
     * Undo last action
     */
    undo() {
        // TODO: Implement undo system
        this.notificationManager.show('Undo not yet implemented', 'info');
    }

    /**
     * Redo last undone action
     */
    redo() {
        // TODO: Implement redo system
        this.notificationManager.show('Redo not yet implemented', 'info');
    }

    /**
     * Test the chatbot
     */
    async testChatbot() {
        try {
            this.notificationManager.show('Starting chatbot test...', 'info');
            
            // Validate flow
            const validation = this.validateFlow();
            if (!validation.isValid) {
                this.notificationManager.show(`Cannot test: ${validation.errors[0]}`, 'error');
                return;
            }

            // TODO: Implement test runner
            this.notificationManager.show('Test mode not yet implemented', 'info');
            
        } catch (error) {
            console.error('Test failed:', error);
            this.notificationManager.show('Test failed', 'error');
        }
    }

    /**
     * Save the chatbot
     */
    async saveChatbot() {
        try {
            const flowData = this.exportFlow();
            await this.storageManager.saveProject('current', flowData);
            
            this.isDirty = false;
            this.notificationManager.show('Chatbot saved successfully', 'success');
            
        } catch (error) {
            console.error('Save failed:', error);
            this.notificationManager.show('Failed to save chatbot', 'error');
        }
    }

    /**
     * Deploy the chatbot
     */
    async deployChatbot() {
        try {
            this.notificationManager.show('Starting deployment...', 'info');
            
            // Validate flow
            const validation = this.validateFlow();
            if (!validation.isValid) {
                this.notificationManager.show(`Cannot deploy: ${validation.errors[0]}`, 'error');
                return;
            }

            // TODO: Implement deployment
            this.notificationManager.show('Deployment not yet implemented', 'info');
            
        } catch (error) {
            console.error('Deployment failed:', error);
            this.notificationManager.show('Deployment failed', 'error');
        }
    }

    /**
     * Auto-save the project
     */
    async autoSave() {
        if (!this.isDirty) return;
        
        try {
            const flowData = this.exportFlow();
            await this.storageManager.saveProject('autosave', flowData);
            console.log('Auto-saved project');
        } catch (error) {
            console.warn('Auto-save failed:', error);
        }
    }

    /**
     * Load the last project
     */
    async loadLastProject() {
        try {
            const projectData = await this.storageManager.loadProject('current');
            if (projectData) {
                this.importFlow(projectData);
                this.notificationManager.show('Project loaded', 'success');
            }
        } catch (error) {
            console.warn('Failed to load last project:', error);
        }
    }

    /**
     * Export flow data
     * @returns {object} Flow data
     */
    exportFlow() {
        return {
            nodes: this.nodeManager.exportNodes(),
            connections: [], // TODO: Implement connections
            metadata: {
                name: this.currentProject?.name || 'Untitled Chatbot',
                created: this.currentProject?.created || Date.now(),
                modified: Date.now(),
                version: '1.0.0'
            }
        };
    }

    /**
     * Import flow data
     * @param {object} flowData - Flow data to import
     */
    importFlow(flowData) {
        if (flowData.nodes) {
            this.nodeManager.importNodes(flowData.nodes);
        }
        
        if (flowData.metadata) {
            this.currentProject = flowData.metadata;
        }

        this.isDirty = false;
        this.emit('flow:imported', flowData);
    }

    /**
     * Validate the current flow
     * @returns {object} Validation result
     */
    validateFlow() {
        const errors = [];
        const warnings = [];

        // Check if there are any nodes
        const nodes = this.nodeManager.getAllNodes();
        if (nodes.length === 0) {
            errors.push('Flow must have at least one node');
        }

        // Validate each node
        this.nodeManager.validateAllNodes();
        for (const node of nodes) {
            if (!node.validation.isValid) {
                errors.push(`Node ${node.id}: ${node.validation.errors[0]}`);
            }
            warnings.push(...node.validation.warnings.map(w => `Node ${node.id}: ${w}`));
        }

        // TODO: Validate connections

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Mark the project as dirty (unsaved changes)
     */
    markDirty() {
        this.isDirty = true;
        this.emit('project:dirty');
    }

    /**
     * Debounce utility function
     * @param {function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.removeAllListeners();
        this.nodeManager?.removeAllListeners();
        this.componentLibrary?.destroy();
        this.workspace?.destroy();
        this.propertiesPanel?.destroy();
        this.notificationManager?.destroy();
    }
}
