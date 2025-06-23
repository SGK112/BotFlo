/**
 * NodeManager - Manages flow nodes and their lifecycle
 */
import { EventEmitter } from './EventEmitter.js';
import { getNodeConfig } from '../utils/NodeConfigs.js';

export class NodeManager extends EventEmitter {
    constructor() {
        super();
        this.nodes = new Map();
        this.selectedNode = null;
        this.nodeCounter = 0;
        this.clipboard = null;
    }

    /**
     * Create a new node
     * @param {string} type - Node type
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {object} config - Optional node configuration
     * @param {boolean} isStart - Whether this is the start node
     * @returns {object} Created node
     */
    createNode(type, x, y, config = {}, isStart = false) {
        const nodeId = isStart ? 'start' : `node_${++this.nodeCounter}`;
        const nodeConfig = getNodeConfig(type);
        
        const node = {
            id: nodeId,
            type: type,
            x: x,
            y: y,
            width: 200,
            height: 150,
            config: { ...nodeConfig.config, ...config },
            connections: { 
                input: [], 
                output: [] 
            },
            metadata: {
                created: Date.now(),
                modified: Date.now(),
                version: '1.0.0'
            },
            validation: {
                isValid: true,
                errors: [],
                warnings: []
            }
        };

        this.nodes.set(nodeId, node);
        this.emit('node:created', node);
        
        return node;
    }

    /**
     * Get a node by ID
     * @param {string} nodeId - Node ID
     * @returns {object|null} Node or null if not found
     */
    getNode(nodeId) {
        return this.nodes.get(nodeId) || null;
    }

    /**
     * Get all nodes
     * @returns {object[]} Array of all nodes
     */
    getAllNodes() {
        return Array.from(this.nodes.values());
    }

    /**
     * Update node position
     * @param {string} nodeId - Node ID
     * @param {number} x - New X position
     * @param {number} y - New Y position
     */
    updateNodePosition(nodeId, x, y) {
        const node = this.getNode(nodeId);
        if (!node) return;

        const oldPosition = { x: node.x, y: node.y };
        node.x = Math.max(0, x);
        node.y = Math.max(0, y);
        node.metadata.modified = Date.now();

        this.emit('node:moved', {
            node,
            oldPosition,
            newPosition: { x: node.x, y: node.y }
        });
    }

    /**
     * Update node configuration
     * @param {string} nodeId - Node ID
     * @param {string} key - Configuration key
     * @param {any} value - New value
     */
    updateNodeConfig(nodeId, key, value) {
        const node = this.getNode(nodeId);
        if (!node) return;

        const oldValue = node.config[key];
        node.config[key] = value;
        node.metadata.modified = Date.now();

        this.validateNode(nodeId);
        
        this.emit('node:config:updated', {
            node,
            key,
            oldValue,
            newValue: value
        });
    }

    /**
     * Update entire node configuration
     * @param {string} nodeId - Node ID
     * @param {object} config - New configuration object
     */
    updateNodeFullConfig(nodeId, config) {
        const node = this.getNode(nodeId);
        if (!node) return;

        const oldConfig = { ...node.config };
        node.config = { ...config };
        node.metadata.modified = Date.now();

        this.validateNode(nodeId);
        
        this.emit('node:config:replaced', {
            node,
            oldConfig,
            newConfig: node.config
        });
    }

    /**
     * Delete a node
     * @param {string} nodeId - Node ID
     * @returns {boolean} Success status
     */
    deleteNode(nodeId) {
        if (nodeId === 'start') {
            console.warn('Cannot delete start node');
            return false;
        }

        const node = this.getNode(nodeId);
        if (!node) return false;

        // Remove all connections
        this.emit('node:delete:before', node);
        
        this.nodes.delete(nodeId);
        
        if (this.selectedNode === nodeId) {
            this.selectedNode = null;
        }

        this.emit('node:deleted', node);
        return true;
    }

    /**
     * Select a node
     * @param {string} nodeId - Node ID
     */
    selectNode(nodeId) {
        const node = this.getNode(nodeId);
        if (!node) return;

        const previousNode = this.selectedNode ? this.getNode(this.selectedNode) : null;
        this.selectedNode = nodeId;

        this.emit('node:selected', {
            node,
            previousNode
        });
    }

    /**
     * Deselect current node
     */
    deselectNode() {
        if (!this.selectedNode) return;

        const node = this.getNode(this.selectedNode);
        this.selectedNode = null;

        this.emit('node:deselected', { node });
    }

    /**
     * Get currently selected node
     * @returns {object|null} Selected node or null
     */
    getSelectedNode() {
        return this.selectedNode ? this.getNode(this.selectedNode) : null;
    }

    /**
     * Duplicate a node
     * @param {string} nodeId - Node ID to duplicate
     * @param {number} offsetX - X offset for the new node
     * @param {number} offsetY - Y offset for the new node
     * @returns {object|null} Duplicated node or null
     */
    duplicateNode(nodeId, offsetX = 50, offsetY = 50) {
        const sourceNode = this.getNode(nodeId);
        if (!sourceNode || sourceNode.id === 'start') return null;

        const newNode = this.createNode(
            sourceNode.type,
            sourceNode.x + offsetX,
            sourceNode.y + offsetY,
            { ...sourceNode.config }
        );

        this.emit('node:duplicated', {
            sourceNode,
            newNode
        });

        return newNode;
    }

    /**
     * Copy node to clipboard
     * @param {string} nodeId - Node ID to copy
     */
    copyNode(nodeId) {
        const node = this.getNode(nodeId);
        if (!node || node.id === 'start') return;

        this.clipboard = {
            type: 'node',
            data: {
                type: node.type,
                config: { ...node.config },
                timestamp: Date.now()
            }
        };

        this.emit('node:copied', { node });
    }

    /**
     * Paste node from clipboard
     * @param {number} x - X position for pasted node
     * @param {number} y - Y position for pasted node
     * @returns {object|null} Pasted node or null
     */
    pasteNode(x, y) {
        if (!this.clipboard || this.clipboard.type !== 'node') return null;

        const { type, config } = this.clipboard.data;
        const newNode = this.createNode(type, x, y, config);

        this.emit('node:pasted', { node: newNode });
        return newNode;
    }

    /**
     * Validate a node
     * @param {string} nodeId - Node ID to validate
     */
    validateNode(nodeId) {
        const node = this.getNode(nodeId);
        if (!node) return;

        const nodeConfig = getNodeConfig(node.type);
        const errors = [];
        const warnings = [];

        // Basic validation rules
        if (nodeConfig.validation) {
            for (const [key, rules] of Object.entries(nodeConfig.validation)) {
                const value = node.config[key];

                if (rules.required && (!value || value.toString().trim() === '')) {
                    errors.push(`${key} is required`);
                }

                if (rules.minLength && value && value.toString().length < rules.minLength) {
                    errors.push(`${key} must be at least ${rules.minLength} characters`);
                }

                if (rules.maxLength && value && value.toString().length > rules.maxLength) {
                    warnings.push(`${key} is longer than recommended ${rules.maxLength} characters`);
                }

                if (rules.pattern && value && !rules.pattern.test(value.toString())) {
                    errors.push(`${key} format is invalid`);
                }
            }
        }

        node.validation = {
            isValid: errors.length === 0,
            errors,
            warnings
        };

        this.emit('node:validated', { node });
    }

    /**
     * Validate all nodes
     */
    validateAllNodes() {
        for (const nodeId of this.nodes.keys()) {
            this.validateNode(nodeId);
        }
    }

    /**
     * Find nodes by type
     * @param {string} type - Node type
     * @returns {object[]} Array of matching nodes
     */
    findNodesByType(type) {
        return this.getAllNodes().filter(node => node.type === type);
    }

    /**
     * Find nodes in region
     * @param {number} x - Region X
     * @param {number} y - Region Y
     * @param {number} width - Region width
     * @param {number} height - Region height
     * @returns {object[]} Array of nodes in region
     */
    findNodesInRegion(x, y, width, height) {
        return this.getAllNodes().filter(node => {
            return node.x >= x &&
                   node.y >= y &&
                   node.x + node.width <= x + width &&
                   node.y + node.height <= y + height;
        });
    }

    /**
     * Get node bounds (for fitting view)
     * @returns {object} Bounds object with min/max x/y
     */
    getNodeBounds() {
        const nodes = this.getAllNodes();
        if (nodes.length === 0) {
            return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
        }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        for (const node of nodes) {
            minX = Math.min(minX, node.x);
            minY = Math.min(minY, node.y);
            maxX = Math.max(maxX, node.x + node.width);
            maxY = Math.max(maxY, node.y + node.height);
        }

        return { minX, minY, maxX, maxY };
    }

    /**
     * Clear all nodes except start node
     */
    clearAllNodes() {
        const nodesToDelete = this.getAllNodes()
            .filter(node => node.id !== 'start')
            .map(node => node.id);

        for (const nodeId of nodesToDelete) {
            this.deleteNode(nodeId);
        }

        this.emit('nodes:cleared');
    }

    /**
     * Export nodes data
     * @returns {object} Serializable nodes data
     */
    exportNodes() {
        return {
            nodes: this.getAllNodes().map(node => ({
                id: node.id,
                type: node.type,
                x: node.x,
                y: node.y,
                width: node.width,
                height: node.height,
                config: node.config,
                metadata: node.metadata
            })),
            metadata: {
                exported: Date.now(),
                nodeCount: this.nodes.size,
                version: '1.0.0'
            }
        };
    }

    /**
     * Import nodes data
     * @param {object} data - Nodes data to import
     */
    importNodes(data) {
        this.clearAllNodes();
        
        if (data.nodes) {
            for (const nodeData of data.nodes) {
                const node = {
                    id: nodeData.id,
                    type: nodeData.type,
                    x: nodeData.x || 0,
                    y: nodeData.y || 0,
                    width: nodeData.width || 200,
                    height: nodeData.height || 150,
                    config: nodeData.config || {},
                    connections: { input: [], output: [] },
                    metadata: nodeData.metadata || {
                        created: Date.now(),
                        modified: Date.now(),
                        version: '1.0.0'
                    },
                    validation: {
                        isValid: true,
                        errors: [],
                        warnings: []
                    }
                };

                this.nodes.set(node.id, node);
                
                // Update counter to avoid ID conflicts
                if (node.id.startsWith('node_')) {
                    const nodeNum = parseInt(node.id.split('_')[1]);
                    if (nodeNum >= this.nodeCounter) {
                        this.nodeCounter = nodeNum;
                    }
                }
            }
        }

        this.validateAllNodes();
        this.emit('nodes:imported', data);
    }
}
