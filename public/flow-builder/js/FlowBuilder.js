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
        
        console.log('FlowBuilder constructor complete');
        // Note: init() will be called manually from main.js
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
        } else {
            console.error('Component library container not found!');
        }

        // Initialize workspace
        const workspaceContainer = document.getElementById('main-workspace');
        if (workspaceContainer) {
            this.workspace = new Workspace(workspaceContainer);
            // Workspace init is called automatically in constructor
        } else {
            console.error('Workspace container not found!');
        }

        // Initialize properties panel
        const propertiesPanelContainer = document.getElementById('properties-panel');
        if (propertiesPanelContainer) {
            this.propertiesPanel = new PropertiesPanel(propertiesPanelContainer);
            // PropertiesPanel init is called automatically in constructor
        } else {
            console.warn('Properties panel container not found - panel will not be available');
        }

        // Verify all components are initialized
        if (!this.componentLibrary || !this.workspace) {
            throw new Error('Failed to initialize required UI components');
        }
        
        console.log('Components initialized:', {
            componentLibrary: !!this.componentLibrary,
            workspace: !!this.workspace,
            propertiesPanel: !!this.propertiesPanel
        });
    }

    /**
     * Set up event handlers between components - FIXED to prevent circular loops
     */
    setupEventHandlers() {
        // Node manager events - only update UI, don't trigger more events
        this.nodeManager.on('node:created', (node) => {
            if (this.workspace && typeof this.workspace.addNodeToCanvas === 'function') {
                this.workspace.addNodeToCanvas(node);
            } else {
                console.warn('Workspace not ready or addNodeToCanvas method missing');
            }
            this.markDirty();
            this.emit('flow:changed');
        });

        this.nodeManager.on('node:selected', ({ node }) => {
            // Update workspace selection visually without triggering events
            if (this.workspace && typeof this.workspace.updateNodeSelection === 'function') {
                this.workspace.updateNodeSelection(node.id);
            }
            if (this.propertiesPanel && typeof this.propertiesPanel.showNodeProperties === 'function') {
                this.propertiesPanel.showNodeProperties(node);
            }
        });

        this.nodeManager.on('node:deselected', () => {
            if (this.workspace && typeof this.workspace.clearVisualSelection === 'function') {
                this.workspace.clearVisualSelection();
            }
            if (this.propertiesPanel && typeof this.propertiesPanel.clearProperties === 'function') {
                this.propertiesPanel.clearProperties();
            }
        });

        this.nodeManager.on('node:deleted', (node) => {
            if (this.workspace && typeof this.workspace.removeNodeFromCanvas === 'function') {
                this.workspace.removeNodeFromCanvas(node.id);
            }
            this.markDirty();
            this.emit('flow:changed');
        });

        this.nodeManager.on('node:moved', ({ node }) => {
            if (this.workspace && typeof this.workspace.updateNodePosition === 'function') {
                this.workspace.updateNodePosition(node.id, node.x, node.y);
            }
            this.markDirty();
        });

        this.nodeManager.on('node:config:updated', ({ node }) => {
            if (this.workspace && typeof this.workspace.updateNodeDisplay === 'function') {
                this.workspace.updateNodeDisplay(node.id);
            }
            if (this.propertiesPanel && typeof this.propertiesPanel.updateNodeProperties === 'function') {
                this.propertiesPanel.updateNodeProperties(node);
            }
            this.markDirty();
            this.emit('flow:changed');
        });

        // Component library events
        if (this.componentLibrary) {
            this.componentLibrary.on('component:drag:start', (eventData) => {
                if (this.workspace && typeof this.workspace.enableDropMode === 'function') {
                    this.workspace.enableDropMode();
                }
            });

            this.componentLibrary.on('component:drag:end', (eventData) => {
                if (this.workspace && typeof this.workspace.disableDropMode === 'function') {
                    this.workspace.disableDropMode();
                }
            });
        }

        // Workspace events - these trigger nodeManager events
        if (this.workspace) {
            console.log('Setting up workspace events'); // Debug
            
            this.workspace.on('node:drop', ({ componentType, x, y }) => {
                console.log('FlowBuilder received node:drop event', { componentType, x, y }); // Debug
                this.createNode(componentType, x, y);
            });

            this.workspace.on('node:select', (nodeId) => {
                this.nodeManager.selectNode(nodeId);
            });

            this.workspace.on('node:deselect', () => {
                this.nodeManager.deselectNode();
            });

            this.workspace.on('node:move', ({ nodeId, x, y }) => {
                this.nodeManager.updateNodePosition(nodeId, x, y);
            });

            this.workspace.on('node:delete', (nodeId) => {
                this.deleteNode(nodeId);
            });

            this.workspace.on('canvas:click', () => {
                this.nodeManager.deselectNode();
            });
        }

        // Properties panel events
        if (this.propertiesPanel) {
            this.propertiesPanel.on('property:change', ({ nodeId, key, value }) => {
                this.nodeManager.updateNodeConfig(nodeId, key, value);
            });
        }

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
                        this.copySelected();
                        break;
                    case 'v':
                        e.preventDefault();
                        this.paste();
                        break;
                    case 'a':
                        e.preventDefault();
                        this.selectAll();
                        break;
                }
            }

            // Delete key
            if (e.key === 'Delete' || e.key === 'Backspace') {
                this.deleteSelected();
            }

            // Escape key
            if (e.key === 'Escape') {
                this.nodeManager.deselectNode();
            }
        });
    }

    /**
     * Create a new node
     */
    async createNode(type, x = 100, y = 100) {
        try {
            console.log('FlowBuilder.createNode called with:', { type, x, y }); // Debug
            const node = this.nodeManager.createNode(type, x, y);
            console.log('Node created successfully:', node); // Debug
            this.markDirty();
            return node;
        } catch (error) {
            console.error('Failed to create node:', error);
            this.notificationManager.show(`Failed to create ${type} node`, 'error');
        }
    }

    /**
     * Create the initial start node
     */
    async createStartNode() {
        if (this.nodeManager.getAllNodes().length === 0) {
            await this.createNode('start', 100, 100);
        }
    }

    /**
     * Delete a node
     */
    deleteNode(nodeId) {
        try {
            this.nodeManager.deleteNode(nodeId);
            this.markDirty();
        } catch (error) {
            console.error('Failed to delete node:', error);
            this.notificationManager.show('Failed to delete node', 'error');
        }
    }

    /**
     * Delete selected nodes
     */
    deleteSelected() {
        const selectedNodes = this.nodeManager.getSelectedNodes();
        selectedNodes.forEach(node => {
            // Don't delete the start node
            if (node.type !== 'start') {
                this.deleteNode(node.id);
            }
        });
    }

    /**
     * Select all nodes
     */
    selectAll() {
        if (this.workspace && typeof this.workspace.selectAll === 'function') {
            this.workspace.selectAll();
        }
    }

    /**
     * Copy selected nodes
     */
    copySelected() {
        const selectedNodes = this.nodeManager.getSelectedNodes();
        if (selectedNodes.length > 0) {
            this.nodeManager.copyNodes(selectedNodes.map(n => n.id));
            this.notificationManager.show(`Copied ${selectedNodes.length} node(s)`, 'success');
        }
    }

    /**
     * Paste nodes
     */
    paste() {
        const pastedNodes = this.nodeManager.pasteNodes();
        if (pastedNodes.length > 0) {
            this.notificationManager.show(`Pasted ${pastedNodes.length} node(s)`, 'success');
            this.markDirty();
        }
    }

    /**
     * Undo last action
     */
    undo() {
        // TODO: Implement undo functionality
        this.notificationManager.show('Undo functionality coming soon', 'info');
    }

    /**
     * Redo last undone action
     */
    redo() {
        // TODO: Implement redo functionality
        this.notificationManager.show('Redo functionality coming soon', 'info');
    }

    /**
     * Mark the project as dirty (has unsaved changes)
     */
    markDirty() {
        if (!this.isDirty) {
            this.isDirty = true;
            this.emit('project:dirty');
        }
    }

    /**
     * Mark the project as clean (saved)
     */
    markClean() {
        if (this.isDirty) {
            this.isDirty = false;
            this.emit('project:clean');
        }
    }

    /**
     * Save the current chatbot configuration
     */
    async saveChatbot() {
        try {
            const flowData = this.exportFlowData();
            const projectName = this.currentProject?.name || 'Untitled Chatbot';
            
            // Save to storage
            await this.storageManager.saveProject(projectName, flowData);
            
            this.isDirty = false;
            this.emit('project:saved', { name: projectName, data: flowData });
            
            this.notificationManager.show('Chatbot saved successfully', 'success');
            
            return flowData;
        } catch (error) {
            console.error('Failed to save chatbot:', error);
            this.notificationManager.show('Failed to save chatbot', 'error');
            throw error;
        }
    }

    /**
     * Export flow data in various formats
     */
    async export(format = 'json') {
        try {
            const flowData = this.exportFlowData();
            const fileName = `chatbot-flow-${Date.now()}`;

            switch (format.toLowerCase()) {
                case 'json':
                    this.downloadFile(JSON.stringify(flowData, null, 2), `${fileName}.json`, 'application/json');
                    break;
                case 'yaml':
                    const yaml = this.convertToYAML(flowData);
                    this.downloadFile(yaml, `${fileName}.yaml`, 'text/yaml');
                    break;
                case 'png':
                    await this.exportAsImage('png');
                    break;
                case 'svg':
                    await this.exportAsImage('svg');
                    break;
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }

            this.notificationManager.show(`Flow exported as ${format.toUpperCase()}`, 'success');
        } catch (error) {
            console.error('Failed to export flow:', error);
            this.notificationManager.show('Failed to export flow', 'error');
            throw error;
        }
    }

    /**
     * Test the current chatbot flow
     */
    testChatbot() {
        try {
            const flowData = this.exportFlowData();
            
            // Validate flow
            const validation = this.validateFlow(flowData);
            if (!validation.isValid) {
                this.notificationManager.show(`Flow validation failed: ${validation.errors.join(', ')}`, 'error');
                return;
            }

            // Open test window
            const testWindow = window.open('/chat.html', 'chatbot-test', 'width=400,height=600,scrollbars=yes,resizable=yes');
            
            if (testWindow) {
                // Pass flow data to test window
                testWindow.addEventListener('load', () => {
                    testWindow.postMessage({ type: 'LOAD_FLOW', data: flowData }, '*');
                });
                
                this.notificationManager.show('Test window opened', 'success');
            } else {
                this.notificationManager.show('Failed to open test window. Please allow popups.', 'warning');
            }
        } catch (error) {
            console.error('Failed to test chatbot:', error);
            this.notificationManager.show('Failed to test chatbot', 'error');
        }
    }

    /**
     * Deploy the chatbot
     */
    async deployChatbot() {
        try {
            const flowData = this.exportFlowData();
            
            // Validate flow
            const validation = this.validateFlow(flowData);
            if (!validation.isValid) {
                this.notificationManager.show(`Cannot deploy: ${validation.errors.join(', ')}`, 'error');
                return;
            }

            // For demo purposes, we'll just save and show success
            await this.saveChatbot();
            
            // In a real implementation, this would deploy to a server
            const deploymentId = `deploy_${Date.now()}`;
            const deploymentUrl = `https://your-chatbot-domain.com/chat/${deploymentId}`;
            
            this.notificationManager.show(`Chatbot deployed successfully! URL: ${deploymentUrl}`, 'success');
            
            // Copy URL to clipboard
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(deploymentUrl);
                this.notificationManager.show('Deployment URL copied to clipboard', 'info');
            }

            this.emit('chatbot:deployed', { id: deploymentId, url: deploymentUrl });
        } catch (error) {
            console.error('Failed to deploy chatbot:', error);
            this.notificationManager.show('Failed to deploy chatbot', 'error');
        }
    }

    /**
     * Export current flow data
     */
    exportFlowData() {
        const nodes = this.nodeManager.getAllNodes();
        const connections = []; // TODO: Implement connections when available
        
        return {
            version: '1.0.0',
            created: new Date().toISOString(),
            nodes: nodes,
            connections: connections,
            metadata: {
                name: this.currentProject?.name || 'Untitled Chatbot',
                description: this.currentProject?.description || '',
                tags: this.currentProject?.tags || [],
                author: 'BotFlo User',
                nodeCount: nodes.length,
                connectionCount: connections.length
            }
        };
    }

    /**
     * Validate flow for deployment
     */
    validateFlow(flowData) {
        const errors = [];
        const warnings = [];

        // Check for start node
        const hasStartNode = flowData.nodes.some(node => node.type === 'start');
        if (!hasStartNode) {
            errors.push('Flow must have a start node');
        }

        // Check for at least one response node
        const hasResponseNode = flowData.nodes.some(node => node.type === 'message' || node.type === 'response');
        if (!hasResponseNode) {
            warnings.push('Flow should have at least one response node');
        }

        // Check for orphaned nodes (nodes without connections)
        if (flowData.nodes.length > 1 && flowData.connections.length === 0) {
            warnings.push('Nodes appear to be disconnected');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Download file helper
     */
    downloadFile(content, fileName, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Convert data to YAML format
     */
    convertToYAML(data) {
        // Simple YAML conversion (in production, use a proper YAML library)
        return JSON.stringify(data, null, 2)
            .replace(/"/g, '')
            .replace(/\{/g, '')
            .replace(/\}/g, '')
            .replace(/\[/g, '')
            .replace(/\]/g, '')
            .replace(/,$/gm, '');
    }

    /**
     * Export workspace as image
     */
    async exportAsImage(format = 'png') {
        if (!this.workspace || !this.workspace.canvas) {
            throw new Error('Workspace canvas not available');
        }

        const canvas = this.workspace.canvas;
        const dataURL = canvas.toDataURL(`image/${format}`);
        
        // Create download link
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `chatbot-flow-${Date.now()}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Utility function for debouncing
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
     * Get application status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            dirty: this.isDirty,
            nodeCount: this.nodeManager.getNodes().size,
            selectedNodeCount: this.nodeManager.getSelectedNodes().length
        };
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Remove event listeners
        this.removeAllListeners();
        
        // Clean up components
        if (this.componentLibrary) {
            this.componentLibrary.destroy();
        }
        if (this.workspace) {
            this.workspace.destroy();
        }
        if (this.propertiesPanel) {
            this.propertiesPanel.destroy();
        }
        
        console.log('FlowBuilder destroyed');
    }
}

// Export for global access
window.FlowBuilder = FlowBuilder;
