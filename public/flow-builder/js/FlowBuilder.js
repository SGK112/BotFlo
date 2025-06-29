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
            this.workspace = new Workspace(workspaceContainer);
            // Workspace init is not async, but we call it explicitly
            this.workspace.init();
        }

        // Initialize properties panel
        const propertiesPanelContainer = document.getElementById('properties-panel');
        if (propertiesPanelContainer) {
            this.propertiesPanel = new PropertiesPanel(propertiesPanelContainer);
            await this.propertiesPanel.init();
        }

        // Verify all components are initialized
        if (!this.componentLibrary || !this.workspace || !this.propertiesPanel) {
            throw new Error('Failed to initialize one or more UI components');
        }
        
        console.log('All components initialized:', {
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
            this.componentLibrary.on('component:drag:start', (componentType) => {
                if (this.workspace && typeof this.workspace.enableDropMode === 'function') {
                    this.workspace.enableDropMode();
                }
            });

            this.componentLibrary.on('component:drag:end', () => {
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
     * Test the chatbot
     */
    async testChatbot() {
        try {
            this.notificationManager.show('Opening chatbot test...', 'info');
            
            // Save current flow before testing
            await this.autoSave();
            
            // Open test window
            const testWindow = window.open('/chatbot-test.html', '_blank', 'width=400,height=600');
            if (!testWindow) {
                throw new Error('Pop-up blocked. Please allow pop-ups for this site.');
            }
            
        } catch (error) {
            console.error('Failed to test chatbot:', error);
            this.notificationManager.show('Failed to test chatbot: ' + error.message, 'error');
        }
    }

    /**
     * Save chatbot
     */
    async saveChatbot() {
        try {
            this.notificationManager.show('Saving chatbot...', 'info');
            
            const flowData = this.serializeFlow();
            const success = await this.storageManager.saveProject('current', flowData);
            
            if (success) {
                this.markClean();
                this.notificationManager.show('Chatbot saved successfully!', 'success');
            } else {
                throw new Error('Save operation failed');
            }
        } catch (error) {
            console.error('Failed to save chatbot:', error);
            this.notificationManager.show('Failed to save chatbot: ' + error.message, 'error');
        }
    }

    /**
     * Deploy chatbot
     */
    async deployChatbot() {
        try {
            this.notificationManager.show('Deploying chatbot...', 'info');
            
            // Save first
            await this.saveChatbot();
            
            // TODO: Implement actual deployment
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate deployment
            
            this.notificationManager.show('Chatbot deployed successfully!', 'success');
            
            // Show deployment options
            this.showDeploymentOptions();
            
        } catch (error) {
            console.error('Failed to deploy chatbot:', error);
            this.notificationManager.show('Failed to deploy chatbot: ' + error.message, 'error');
        }
    }

    /**
     * Show deployment options
     */
    showDeploymentOptions() {
        // Create deployment modal
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Deployment Successful</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>Your chatbot has been deployed successfully!</p>
                        <div class="deployment-options">
                            <div class="option">
                                <h6>Embed Code</h6>
                                <textarea class="form-control" readonly rows="3">&lt;script src="https://botflo.com/embed/chatbot-${Date.now()}.js"&gt;&lt;/script&gt;</textarea>
                            </div>
                            <div class="option mt-3">
                                <h6>Direct Link</h6>
                                <input type="text" class="form-control" readonly value="https://botflo.com/chat/chatbot-${Date.now()}">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="this.copyDeploymentInfo()">Copy Info</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show modal (assuming Bootstrap is available)
        if (window.bootstrap) {
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
            
            // Clean up when modal is hidden
            modal.addEventListener('hidden.bs.modal', () => {
                modal.remove();
            });
        }
    }

    /**
     * Preview chatbot
     */
    async previewChatbot() {
        try {
            this.notificationManager.show('Opening preview...', 'info');
            
            // Save current flow before preview
            await this.autoSave();
            
            // Open preview window
            const previewWindow = window.open('/chatbot.html?preview=true', '_blank', 'width=800,height=600');
            if (!previewWindow) {
                throw new Error('Pop-up blocked. Please allow pop-ups for this site.');
            }
            
        } catch (error) {
            console.error('Failed to preview chatbot:', error);
            this.notificationManager.show('Failed to preview chatbot: ' + error.message, 'error');
        }
    }

    /**
     * Auto-save functionality
     */
    async autoSave() {
        try {
            const flowData = this.serializeFlow();
            await this.storageManager.saveProject('autosave', flowData);
            console.log('Auto-saved project');
        } catch (error) {
            console.warn('Auto-save failed:', error);
        }
    }

    /**
     * Load the last saved project
     */
    async loadLastProject() {
        try {
            const flowData = await this.storageManager.loadProject('current') || 
                            await this.storageManager.loadProject('autosave');
            
            if (flowData) {
                await this.deserializeFlow(flowData);
                this.markClean();
                console.log('Loaded saved project');
            }
        } catch (error) {
            console.warn('Failed to load saved project:', error);
        }
    }

    /**
     * Serialize the current flow to JSON
     */
    serializeFlow() {
        const nodes = [];
        const connections = [];
        
        // Serialize nodes
        this.nodeManager.getNodes().forEach(node => {
            nodes.push({
                id: node.id,
                type: node.type,
                x: node.x,
                y: node.y,
                config: node.config
            });
        });
        
        // TODO: Serialize connections when connection system is implemented
        
        return {
            version: '1.0.0',
            nodes,
            connections,
            metadata: {
                created: this.currentProject?.created || new Date().toISOString(),
                modified: new Date().toISOString(),
                name: this.currentProject?.name || 'Untitled Chatbot'
            }
        };
    }

    /**
     * Deserialize flow from JSON
     */
    async deserializeFlow(flowData) {
        try {
            // Clear existing nodes
            this.nodeManager.clear();
            
            // Load nodes
            if (flowData.nodes) {
                for (const nodeData of flowData.nodes) {
                    const node = this.nodeManager.createNode(
                        nodeData.type, 
                        nodeData.x, 
                        nodeData.y,
                        nodeData.config || {}
                    );
                    node.id = nodeData.id; // Preserve original ID
                }
            }
            
            // TODO: Load connections when connection system is implemented
            
            // Update project metadata
            this.currentProject = flowData.metadata || {};
            
        } catch (error) {
            console.error('Failed to deserialize flow:', error);
            this.notificationManager.show('Failed to load project', 'error');
        }
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
