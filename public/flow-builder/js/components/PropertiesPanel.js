import { EventEmitter } from '../core/EventEmitter.js';

export class PropertiesPanel extends EventEmitter {
    constructor(containerElement) {
        super();
        this.container = containerElement;
        this.selectedNode = null;
        this.init();
    }

    init() {
        this.setupPanelHTML();
        this.setupEventListeners();
    }

    setupPanelHTML() {
        this.container.innerHTML = `
            <div class="properties-header">
                <h3>Properties</h3>
                <div class="properties-actions">
                    <button class="btn btn-sm" id="collapseProperties" title="Collapse">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
            <div class="properties-content" id="properties-content">
                <div class="no-selection">
                    <div class="no-selection-icon">
                        <i class="fas fa-mouse-pointer"></i>
                    </div>
                    <p>Select a node to edit its properties</p>
                </div>
            </div>
        `;

        this.content = this.container.querySelector('#properties-content');
    }

    setupEventListeners() {
        const collapseBtn = this.container.querySelector('#collapseProperties');
        collapseBtn.addEventListener('click', () => {
            this.toggleCollapse();
        });
    }

    showNodeProperties(nodeConfig) {
        this.selectedNode = nodeConfig;
        this.content.innerHTML = this.generatePropertiesForm(nodeConfig);
        this.setupFormEventListeners();
    }

    generatePropertiesForm(nodeConfig) {
        const properties = nodeConfig.properties || {};
        
        let formHTML = `
            <div class="properties-form">
                <div class="property-section">
                    <h4>Basic Information</h4>
                    <div class="property-group">
                        <label for="node-title">Title</label>
                        <input type="text" id="node-title" value="${nodeConfig.title || ''}" 
                               class="property-input" data-property="title">
                    </div>
                    <div class="property-group">
                        <label for="node-description">Description</label>
                        <textarea id="node-description" class="property-input" 
                                data-property="description" rows="3">${nodeConfig.description || ''}</textarea>
                    </div>
                </div>
        `;

        // Generate form fields based on node type
        switch (nodeConfig.type) {
            case 'trigger':
                formHTML += this.generateTriggerProperties(properties);
                break;
            case 'condition':
                formHTML += this.generateConditionProperties(properties);
                break;
            case 'action':
                formHTML += this.generateActionProperties(properties);
                break;
            case 'response':
                formHTML += this.generateResponseProperties(properties);
                break;
            default:
                formHTML += this.generateGenericProperties(properties);
        }

        formHTML += `
                <div class="property-section">
                    <h4>Advanced</h4>
                    <div class="property-group">
                        <label for="node-id">Node ID</label>
                        <input type="text" id="node-id" value="${nodeConfig.id}" 
                               class="property-input" readonly>
                    </div>
                    <div class="property-group">
                        <label for="node-type">Type</label>
                        <input type="text" id="node-type" value="${nodeConfig.type}" 
                               class="property-input" readonly>
                    </div>
                </div>
                <div class="properties-actions">
                    <button class="btn btn-danger btn-sm" id="delete-node">
                        <i class="fas fa-trash"></i> Delete Node
                    </button>
                    <button class="btn btn-secondary btn-sm" id="duplicate-node">
                        <i class="fas fa-copy"></i> Duplicate
                    </button>
                </div>
            </div>
        `;

        return formHTML;
    }

    generateTriggerProperties(properties) {
        return `
            <div class="property-section">
                <h4>Trigger Settings</h4>
                <div class="property-group">
                    <label for="trigger-type">Trigger Type</label>
                    <select id="trigger-type" class="property-input" data-property="triggerType">
                        <option value="message" ${properties.triggerType === 'message' ? 'selected' : ''}>Message Received</option>
                        <option value="keyword" ${properties.triggerType === 'keyword' ? 'selected' : ''}>Keyword Match</option>
                        <option value="intent" ${properties.triggerType === 'intent' ? 'selected' : ''}>Intent Recognition</option>
                        <option value="time" ${properties.triggerType === 'time' ? 'selected' : ''}>Time Based</option>
                        <option value="event" ${properties.triggerType === 'event' ? 'selected' : ''}>Custom Event</option>
                    </select>
                </div>
                <div class="property-group">
                    <label for="trigger-value">Trigger Value</label>
                    <input type="text" id="trigger-value" value="${properties.triggerValue || ''}" 
                           class="property-input" data-property="triggerValue" 
                           placeholder="Enter trigger condition...">
                </div>
            </div>
        `;
    }

    generateConditionProperties(properties) {
        return `
            <div class="property-section">
                <h4>Condition Settings</h4>
                <div class="property-group">
                    <label for="condition-type">Condition Type</label>
                    <select id="condition-type" class="property-input" data-property="conditionType">
                        <option value="equals" ${properties.conditionType === 'equals' ? 'selected' : ''}>Equals</option>
                        <option value="contains" ${properties.conditionType === 'contains' ? 'selected' : ''}>Contains</option>
                        <option value="greater" ${properties.conditionType === 'greater' ? 'selected' : ''}>Greater Than</option>
                        <option value="less" ${properties.conditionType === 'less' ? 'selected' : ''}>Less Than</option>
                        <option value="regex" ${properties.conditionType === 'regex' ? 'selected' : ''}>Regular Expression</option>
                    </select>
                </div>
                <div class="property-group">
                    <label for="condition-value">Condition Value</label>
                    <input type="text" id="condition-value" value="${properties.conditionValue || ''}" 
                           class="property-input" data-property="conditionValue" 
                           placeholder="Enter condition value...">
                </div>
                <div class="property-group">
                    <label>
                        <input type="checkbox" id="case-sensitive" 
                               ${properties.caseSensitive ? 'checked' : ''} 
                               data-property="caseSensitive">
                        Case Sensitive
                    </label>
                </div>
            </div>
        `;
    }

    generateActionProperties(properties) {
        return `
            <div class="property-section">
                <h4>Action Settings</h4>
                <div class="property-group">
                    <label for="action-type">Action Type</label>
                    <select id="action-type" class="property-input" data-property="actionType">
                        <option value="send-message" ${properties.actionType === 'send-message' ? 'selected' : ''}>Send Message</option>
                        <option value="set-variable" ${properties.actionType === 'set-variable' ? 'selected' : ''}>Set Variable</option>
                        <option value="call-api" ${properties.actionType === 'call-api' ? 'selected' : ''}>Call API</option>
                        <option value="wait" ${properties.actionType === 'wait' ? 'selected' : ''}>Wait/Delay</option>
                        <option value="redirect" ${properties.actionType === 'redirect' ? 'selected' : ''}>Redirect to Node</option>
                    </select>
                </div>
                <div class="property-group">
                    <label for="action-config">Configuration</label>
                    <textarea id="action-config" class="property-input" data-property="actionConfig" 
                              rows="4" placeholder="Enter action configuration...">${properties.actionConfig || ''}</textarea>
                </div>
            </div>
        `;
    }

    generateResponseProperties(properties) {
        return `
            <div class="property-section">
                <h4>Response Settings</h4>
                <div class="property-group">
                    <label for="response-text">Response Text</label>
                    <textarea id="response-text" class="property-input" data-property="responseText" 
                              rows="4" placeholder="Enter response message...">${properties.responseText || ''}</textarea>
                </div>
                <div class="property-group">
                    <label for="response-type">Response Type</label>
                    <select id="response-type" class="property-input" data-property="responseType">
                        <option value="text" ${properties.responseType === 'text' ? 'selected' : ''}>Text</option>
                        <option value="quick-reply" ${properties.responseType === 'quick-reply' ? 'selected' : ''}>Quick Reply</option>
                        <option value="card" ${properties.responseType === 'card' ? 'selected' : ''}>Card</option>
                        <option value="image" ${properties.responseType === 'image' ? 'selected' : ''}>Image</option>
                        <option value="file" ${properties.responseType === 'file' ? 'selected' : ''}>File</option>
                    </select>
                </div>
                <div class="property-group">
                    <label>
                        <input type="checkbox" id="typing-indicator" 
                               ${properties.showTypingIndicator ? 'checked' : ''} 
                               data-property="showTypingIndicator">
                        Show Typing Indicator
                    </label>
                </div>
                <div class="property-group">
                    <label for="delay-before">Delay Before (ms)</label>
                    <input type="number" id="delay-before" value="${properties.delayBefore || 0}" 
                           class="property-input" data-property="delayBefore" min="0">
                </div>
            </div>
        `;
    }

    generateGenericProperties(properties) {
        let genericHTML = `
            <div class="property-section">
                <h4>Custom Properties</h4>
        `;

        Object.entries(properties).forEach(([key, value]) => {
            genericHTML += `
                <div class="property-group">
                    <label for="prop-${key}">${this.formatPropertyName(key)}</label>
                    <input type="text" id="prop-${key}" value="${value}" 
                           class="property-input" data-property="${key}">
                </div>
            `;
        });

        genericHTML += `
                <div class="property-group">
                    <button class="btn btn-sm btn-secondary" id="add-property">
                        <i class="fas fa-plus"></i> Add Property
                    </button>
                </div>
            </div>
        `;

        return genericHTML;
    }

    setupFormEventListeners() {
        // Property input changes
        const inputs = this.content.querySelectorAll('.property-input');
        inputs.forEach(input => {
            input.addEventListener('change', (event) => {
                this.handlePropertyChange(event.target);
            });

            input.addEventListener('input', (event) => {
                if (event.target.type === 'text' || event.target.tagName === 'TEXTAREA') {
                    this.handlePropertyChange(event.target);
                }
            });
        });

        // Action buttons
        const deleteBtn = this.content.querySelector('#delete-node');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.emit('deleteNode', this.selectedNode.id);
            });
        }

        const duplicateBtn = this.content.querySelector('#duplicate-node');
        if (duplicateBtn) {
            duplicateBtn.addEventListener('click', () => {
                this.emit('duplicateNode', this.selectedNode.id);
            });
        }

        const addPropertyBtn = this.content.querySelector('#add-property');
        if (addPropertyBtn) {
            addPropertyBtn.addEventListener('click', () => {
                this.addCustomProperty();
            });
        }
    }

    handlePropertyChange(inputElement) {
        const property = inputElement.dataset.property;
        let value = inputElement.value;

        // Handle different input types
        if (inputElement.type === 'checkbox') {
            value = inputElement.checked;
        } else if (inputElement.type === 'number') {
            value = parseFloat(value) || 0;
        }

        // Update the selected node
        if (this.selectedNode) {
            if (property === 'title' || property === 'description') {
                this.selectedNode[property] = value;
            } else {
                if (!this.selectedNode.properties) {
                    this.selectedNode.properties = {};
                }
                this.selectedNode.properties[property] = value;
            }

            this.emit('propertyChanged', {
                nodeId: this.selectedNode.id,
                property: property,
                value: value
            });
        }
    }

    addCustomProperty() {
        const propertyName = prompt('Enter property name:');
        if (propertyName && propertyName.trim()) {
            const propertyValue = prompt('Enter property value:') || '';
            
            if (this.selectedNode) {
                if (!this.selectedNode.properties) {
                    this.selectedNode.properties = {};
                }
                this.selectedNode.properties[propertyName.trim()] = propertyValue;
                
                // Refresh the properties panel
                this.showNodeProperties(this.selectedNode);
                
                this.emit('propertyAdded', {
                    nodeId: this.selectedNode.id,
                    property: propertyName.trim(),
                    value: propertyValue
                });
            }
        }
    }

    formatPropertyName(name) {
        return name
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    clearProperties() {
        this.selectedNode = null;
        this.content.innerHTML = `
            <div class="no-selection">
                <div class="no-selection-icon">
                    <i class="fas fa-mouse-pointer"></i>
                </div>
                <p>Select a node to edit its properties</p>
            </div>
        `;
    }

    toggleCollapse() {
        const icon = this.container.querySelector('#collapseProperties i');
        this.container.classList.toggle('collapsed');
        
        if (this.container.classList.contains('collapsed')) {
            icon.className = 'fas fa-chevron-left';
        } else {
            icon.className = 'fas fa-chevron-right';
        }
        
        this.emit('panelToggled', this.container.classList.contains('collapsed'));
    }

    updateNodeProperty(nodeId, property, value) {
        if (this.selectedNode && this.selectedNode.id === nodeId) {
            const input = this.content.querySelector(`[data-property="${property}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = value;
                } else {
                    input.value = value;
                }
            }
        }
    }

    getSelectedNodeId() {
        return this.selectedNode ? this.selectedNode.id : null;
    }
}
