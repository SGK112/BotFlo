import { EventEmitter } from './EventEmitter.js';

export class ConnectionManager extends EventEmitter {
    constructor() {
        super();
        this.connections = new Map();
        this.isConnecting = false;
        this.connectionStart = null;
    }

    startConnection(sourceNode, sourcePort) {
        this.isConnecting = true;
        this.connectionStart = { node: sourceNode, port: sourcePort };
        this.emit('connectionStarted', { sourceNode, sourcePort });
    }

    endConnection(targetNode, targetPort) {
        if (!this.isConnecting || !this.connectionStart) return false;

        const connectionId = this.generateConnectionId();
        const connection = {
            id: connectionId,
            source: this.connectionStart,
            target: { node: targetNode, port: targetPort }
        };

        this.connections.set(connectionId, connection);
        this.isConnecting = false;
        this.connectionStart = null;

        this.emit('connectionCreated', connection);
        return true;
    }

    removeConnection(connectionId) {
        if (this.connections.has(connectionId)) {
            const connection = this.connections.get(connectionId);
            this.connections.delete(connectionId);
            this.emit('connectionRemoved', connection);
            return true;
        }
        return false;
    }

    getConnections() {
        return Array.from(this.connections.values());
    }

    getConnectionsForNode(nodeId) {
        return this.getConnections().filter(conn => 
            conn.source.node.id === nodeId || conn.target.node.id === nodeId
        );
    }

    generateConnectionId() {
        return 'conn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    cancelConnection() {
        this.isConnecting = false;
        this.connectionStart = null;
        this.emit('connectionCancelled');
    }

    validateConnection(sourceNode, sourcePort, targetNode, targetPort) {
        // Prevent self-connections
        if (sourceNode.id === targetNode.id) return false;
        
        // Check for existing connection
        const existing = this.getConnections().find(conn => 
            conn.source.node.id === sourceNode.id && 
            conn.source.port === sourcePort &&
            conn.target.node.id === targetNode.id && 
            conn.target.port === targetPort
        );
        
        return !existing;
    }

    clear() {
        this.connections.clear();
        this.isConnecting = false;
        this.connectionStart = null;
        this.emit('connectionsCleared');
    }
}
