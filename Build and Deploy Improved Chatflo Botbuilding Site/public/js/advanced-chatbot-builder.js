class AdvancedChatbotBuilder {
  constructor() {
    this.nodes = new Map();
    this.connections = [];
    this.selectedNode = null;
    this.draggedNode = null;
    this.canvas = null;
    this.ctx = null;
    this.scale = 1;
    this.panX = 0;
    this.panY = 0;
    this.nodeIdCounter = 0;
    this.history = [];
    this.historyIndex = -1;
    this.clipboard = null;
    
    this.nodeTypes = {
      start: { color: '#4CAF50', icon: '▶️', title: 'Start' },
      message: { color: '#2196F3', icon: '💬', title: 'Message' },
      question: { color: '#FF9800', icon: '❓', title: 'Question' },
      condition: { color: '#9C27B0', icon: '🔀', title: 'Condition' },
      api: { color: '#607D8B', icon: '🔗', title: 'API Call' },
      webhook: { color: '#795548', icon: '📡', title: 'Webhook' },
      database: { color: '#3F51B5', icon: '💾', title: 'Database' },
      ai: { color: '#E91E63', icon: '🤖', title: 'AI Response' },
      delay: { color: '#009688', icon: '⏰', title: 'Delay' },
      end: { color: '#F44336', icon: '🛑', title: 'End' }
    };
    
    this.init();
  }

  init() {
    this.canvas = document.getElementById('chatbot-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.setupCanvas();
    this.setupEventListeners();
    this.setupToolbar();
    this.addStartNode();
  }

  setupCanvas() {
    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
    
    // Enable high DPI support
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }

  setupEventListeners() {
    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
    this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));

    // Keyboard events
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    
    // Context menu
    this.canvas.addEventListener('contextmenu', (e) => this.handleContextMenu(e));

    // Window resize
    window.addEventListener('resize', () => this.setupCanvas());
  }

  setupToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'chatbot-toolbar';
    toolbar.innerHTML = `
      <div class="toolbar-section">
        <h3>Node Types</h3>
        ${Object.entries(this.nodeTypes).map(([type, config]) => `
          <button class="node-button" data-type="${type}">
            <span class="node-icon">${config.icon}</span>
            <span class="node-label">${config.title}</span>
          </button>
        `).join('')}
      </div>
      <div class="toolbar-section">
        <h3>Actions</h3>
        <button id="undo-btn">↶ Undo</button>
        <button id="redo-btn">↷ Redo</button>
        <button id="copy-btn">📋 Copy</button>
        <button id="paste-btn">📄 Paste</button>
        <button id="delete-btn">🗑️ Delete</button>
        <button id="test-btn">▶️ Test</button>
        <button id="export-btn">💾 Export</button>
        <button id="import-btn">📁 Import</button>
      </div>
      <div class="toolbar-section">
        <h3>View</h3>
        <button id="zoom-in-btn">🔍+ Zoom In</button>
        <button id="zoom-out-btn">🔍- Zoom Out</button>
        <button id="fit-canvas-btn">📐 Fit All</button>
        <button id="grid-toggle-btn">⚏ Toggle Grid</button>
      </div>
    `;

    // Insert toolbar into the page
    const container = document.querySelector('.builder-container') || document.body;
    container.insertBefore(toolbar, container.firstChild);

    // Add event listeners for toolbar buttons
    this.setupToolbarEvents();
  }

  setupToolbarEvents() {
    // Node type buttons
    document.querySelectorAll('.node-button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.currentTarget.dataset.type;
        this.addNode(type, 100, 100);
      });
    });

    // Action buttons
    document.getElementById('undo-btn')?.addEventListener('click', () => this.undo());
    document.getElementById('redo-btn')?.addEventListener('click', () => this.redo());
    document.getElementById('copy-btn')?.addEventListener('click', () => this.copy());
    document.getElementById('paste-btn')?.addEventListener('click', () => this.paste());
    document.getElementById('delete-btn')?.addEventListener('click', () => this.deleteSelected());
    document.getElementById('test-btn')?.addEventListener('click', () => this.testChatbot());
    document.getElementById('export-btn')?.addEventListener('click', () => this.exportChatbot());
    document.getElementById('import-btn')?.addEventListener('click', () => this.importChatbot());

    // View buttons
    document.getElementById('zoom-in-btn')?.addEventListener('click', () => this.zoomIn());
    document.getElementById('zoom-out-btn')?.addEventListener('click', () => this.zoomOut());
    document.getElementById('fit-canvas-btn')?.addEventListener('click', () => this.fitToCanvas());
    document.getElementById('grid-toggle-btn')?.addEventListener('click', () => this.toggleGrid());
  }

  addNode(type, x = 0, y = 0, data = {}) {
    const nodeId = `node_${this.nodeIdCounter++}`;
    const node = {
      id: nodeId,
      type: type,
      x: x,
      y: y,
      width: 150,
      height: 80,
      data: {
        title: this.nodeTypes[type].title,
        message: '',
        conditions: [],
        apiUrl: '',
        variables: {},
        ...data
      },
      inputs: type !== 'start' ? [{ id: 'input', connected: false }] : [],
      outputs: type !== 'end' ? [{ id: 'output', connected: false }] : []
    };

    // Add multiple outputs for condition nodes
    if (type === 'condition') {
      node.outputs = [
        { id: 'true', connected: false, label: 'True' },
        { id: 'false', connected: false, label: 'False' }
      ];
    }

    this.nodes.set(nodeId, node);
    this.saveState();
    this.draw();
    return node;
  }

  addStartNode() {
    if (!Array.from(this.nodes.values()).some(node => node.type === 'start')) {
      this.addNode('start', 50, 50);
    }
  }

  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.panX) / this.scale;
    const y = (e.clientY - rect.top - this.panY) / this.scale;

    const clickedNode = this.getNodeAt(x, y);
    
    if (clickedNode) {
      this.selectedNode = clickedNode;
      this.draggedNode = clickedNode;
      this.dragOffset = {
        x: x - clickedNode.x,
        y: y - clickedNode.y
      };
    } else {
      this.selectedNode = null;
    }

    this.draw();
  }

  handleMouseMove(e) {
    if (this.draggedNode) {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - this.panX) / this.scale;
      const y = (e.clientY - rect.top - this.panY) / this.scale;

      this.draggedNode.x = x - this.dragOffset.x;
      this.draggedNode.y = y - this.dragOffset.y;
      this.draw();
    }
  }

  handleMouseUp(e) {
    if (this.draggedNode) {
      this.saveState();
      this.draggedNode = null;
    }
  }

  handleDoubleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.panX) / this.scale;
    const y = (e.clientY - rect.top - this.panY) / this.scale;

    const clickedNode = this.getNodeAt(x, y);
    if (clickedNode) {
      this.editNode(clickedNode);
    }
  }

  handleWheel(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(3, this.scale * zoomFactor));

    // Zoom towards mouse position
    this.panX = mouseX - (mouseX - this.panX) * (newScale / this.scale);
    this.panY = mouseY - (mouseY - this.panY) * (newScale / this.scale);
    this.scale = newScale;

    this.draw();
  }

  handleKeyDown(e) {
    if (e.ctrlKey || e.metaKey) {
      switch(e.key) {
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
          this.copy();
          break;
        case 'v':
          e.preventDefault();
          this.paste();
          break;
        case 's':
          e.preventDefault();
          this.exportChatbot();
          break;
      }
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      this.deleteSelected();
    }
  }

  getNodeAt(x, y) {
    for (let node of this.nodes.values()) {
      if (x >= node.x && x <= node.x + node.width &&
          y >= node.y && y <= node.y + node.height) {
        return node;
      }
    }
    return null;
  }

  editNode(node) {
    const modal = this.createEditModal(node);
    document.body.appendChild(modal);
  }

  createEditModal(node) {
    const modal = document.createElement('div');
    modal.className = 'node-edit-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Edit ${this.nodeTypes[node.type].title} Node</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          ${this.getEditForm(node)}
        </div>
        <div class="modal-footer">
          <button id="save-node-btn" class="btn-primary">Save</button>
          <button id="cancel-node-btn" class="btn-secondary">Cancel</button>
        </div>
      </div>
    `;

    // Event listeners
    modal.querySelector('.close-btn').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.querySelector('#cancel-node-btn').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.querySelector('#save-node-btn').addEventListener('click', () => {
      this.saveNodeEdit(node, modal);
      document.body.removeChild(modal);
    });

    return modal;
  }

  getEditForm(node) {
    switch(node.type) {
      case 'message':
        return `
          <label>Message Text:</label>
          <textarea id="message-text" rows="4">${node.data.message || ''}</textarea>
          <label>Variables (JSON):</label>
          <textarea id="variables" rows="2">${JSON.stringify(node.data.variables || {}, null, 2)}</textarea>
        `;
      case 'question':
        return `
          <label>Question Text:</label>
          <textarea id="question-text" rows="3">${node.data.message || ''}</textarea>
          <label>Input Type:</label>
          <select id="input-type">
            <option value="text" ${node.data.inputType === 'text' ? 'selected' : ''}>Text</option>
            <option value="number" ${node.data.inputType === 'number' ? 'selected' : ''}>Number</option>
            <option value="email" ${node.data.inputType === 'email' ? 'selected' : ''}>Email</option>
            <option value="choice" ${node.data.inputType === 'choice' ? 'selected' : ''}>Multiple Choice</option>
          </select>
          <label>Choices (one per line):</label>
          <textarea id="choices" rows="3">${(node.data.choices || []).join('\n')}</textarea>
        `;
      case 'condition':
        return `
          <label>Variable to Check:</label>
          <input type="text" id="condition-variable" value="${node.data.variable || ''}" placeholder="user.age">
          <label>Condition:</label>
          <select id="condition-operator">
            <option value="equals" ${node.data.operator === 'equals' ? 'selected' : ''}>Equals</option>
            <option value="greater" ${node.data.operator === 'greater' ? 'selected' : ''}>Greater Than</option>
            <option value="less" ${node.data.operator === 'less' ? 'selected' : ''}>Less Than</option>
            <option value="contains" ${node.data.operator === 'contains' ? 'selected' : ''}>Contains</option>
          </select>
          <label>Value:</label>
          <input type="text" id="condition-value" value="${node.data.value || ''}" placeholder="18">
        `;
      case 'api':
        return `
          <label>API URL:</label>
          <input type="url" id="api-url" value="${node.data.apiUrl || ''}" placeholder="https://api.example.com/data">
          <label>Method:</label>
          <select id="api-method">
            <option value="GET" ${node.data.method === 'GET' ? 'selected' : ''}>GET</option>
            <option value="POST" ${node.data.method === 'POST' ? 'selected' : ''}>POST</option>
            <option value="PUT" ${node.data.method === 'PUT' ? 'selected' : ''}>PUT</option>
            <option value="DELETE" ${node.data.method === 'DELETE' ? 'selected' : ''}>DELETE</option>
          </select>
          <label>Headers (JSON):</label>
          <textarea id="api-headers" rows="3">${JSON.stringify(node.data.headers || {}, null, 2)}</textarea>
          <label>Body (JSON):</label>
          <textarea id="api-body" rows="3">${JSON.stringify(node.data.body || {}, null, 2)}</textarea>
        `;
      case 'ai':
        return `
          <label>AI Prompt:</label>
          <textarea id="ai-prompt" rows="4">${node.data.prompt || ''}</textarea>
          <label>Model:</label>
          <select id="ai-model">
            <option value="gpt-4" ${node.data.model === 'gpt-4' ? 'selected' : ''}>GPT-4</option>
            <option value="gpt-3.5-turbo" ${node.data.model === 'gpt-3.5-turbo' ? 'selected' : ''}>GPT-3.5 Turbo</option>
            <option value="claude" ${node.data.model === 'claude' ? 'selected' : ''}>Claude</option>
          </select>
          <label>Temperature:</label>
          <input type="range" id="ai-temperature" min="0" max="1" step="0.1" value="${node.data.temperature || 0.7}">
          <span id="temp-value">${node.data.temperature || 0.7}</span>
        `;
      case 'delay':
        return `
          <label>Delay Duration (seconds):</label>
          <input type="number" id="delay-duration" value="${node.data.duration || 1}" min="0.1" step="0.1">
        `;
      default:
        return `
          <label>Title:</label>
          <input type="text" id="node-title" value="${node.data.title || ''}" placeholder="Node Title">
        `;
    }
  }

  saveNodeEdit(node, modal) {
    const modalContent = modal.querySelector('.modal-content');
    
    switch(node.type) {
      case 'message':
        node.data.message = modalContent.querySelector('#message-text')?.value || '';
        try {
          node.data.variables = JSON.parse(modalContent.querySelector('#variables')?.value || '{}');
        } catch(e) {
          node.data.variables = {};
        }
        break;
      case 'question':
        node.data.message = modalContent.querySelector('#question-text')?.value || '';
        node.data.inputType = modalContent.querySelector('#input-type')?.value || 'text';
        node.data.choices = modalContent.querySelector('#choices')?.value.split('\n').filter(c => c.trim()) || [];
        break;
      case 'condition':
        node.data.variable = modalContent.querySelector('#condition-variable')?.value || '';
        node.data.operator = modalContent.querySelector('#condition-operator')?.value || 'equals';
        node.data.value = modalContent.querySelector('#condition-value')?.value || '';
        break;
      case 'api':
        node.data.apiUrl = modalContent.querySelector('#api-url')?.value || '';
        node.data.method = modalContent.querySelector('#api-method')?.value || 'GET';
        try {
          node.data.headers = JSON.parse(modalContent.querySelector('#api-headers')?.value || '{}');
          node.data.body = JSON.parse(modalContent.querySelector('#api-body')?.value || '{}');
        } catch(e) {
          node.data.headers = {};
          node.data.body = {};
        }
        break;
      case 'ai':
        node.data.prompt = modalContent.querySelector('#ai-prompt')?.value || '';
        node.data.model = modalContent.querySelector('#ai-model')?.value || 'gpt-3.5-turbo';
        node.data.temperature = parseFloat(modalContent.querySelector('#ai-temperature')?.value || 0.7);
        break;
      case 'delay':
        node.data.duration = parseFloat(modalContent.querySelector('#delay-duration')?.value || 1);
        break;
      default:
        node.data.title = modalContent.querySelector('#node-title')?.value || '';
        break;
    }

    this.saveState();
    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.save();
    this.ctx.translate(this.panX, this.panY);
    this.ctx.scale(this.scale, this.scale);

    // Draw grid if enabled
    if (this.showGrid) {
      this.drawGrid();
    }

    // Draw connections
    this.drawConnections();

    // Draw nodes
    for (let node of this.nodes.values()) {
      this.drawNode(node);
    }

    this.ctx.restore();
  }

  drawNode(node) {
    const config = this.nodeTypes[node.type];
    const isSelected = node === this.selectedNode;

    // Node background
    this.ctx.fillStyle = config.color;
    this.ctx.fillRect(node.x, node.y, node.width, node.height);

    // Selection highlight
    if (isSelected) {
      this.ctx.strokeStyle = '#FFD700';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(node.x - 2, node.y - 2, node.width + 4, node.height + 4);
    }

    // Node border
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(node.x, node.y, node.width, node.height);

    // Node icon and title
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(config.icon, node.x + 20, node.y + 25);
    this.ctx.fillText(node.data.title, node.x + node.width/2, node.y + 25);

    // Node description
    if (node.data.message) {
      this.ctx.font = '10px Arial';
      const truncated = node.data.message.length > 30 ? 
        node.data.message.substring(0, 30) + '...' : 
        node.data.message;
      this.ctx.fillText(truncated, node.x + node.width/2, node.y + 45);
    }

    // Input/Output connection points
    this.drawConnectionPoints(node);
  }

  drawConnectionPoints(node) {
    const pointSize = 8;

    // Input points
    node.inputs.forEach((input, index) => {
      const x = node.x - pointSize/2;
      const y = node.y + 20 + (index * 20);
      
      this.ctx.fillStyle = input.connected ? '#4CAF50' : '#ccc';
      this.ctx.beginPath();
      this.ctx.arc(x, y, pointSize/2, 0, 2 * Math.PI);
      this.ctx.fill();
    });

    // Output points
    node.outputs.forEach((output, index) => {
      const x = node.x + node.width + pointSize/2;
      const y = node.y + 20 + (index * 20);
      
      this.ctx.fillStyle = output.connected ? '#4CAF50' : '#ccc';
      this.ctx.beginPath();
      this.ctx.arc(x, y, pointSize/2, 0, 2 * Math.PI);
      this.ctx.fill();

      // Output label
      if (output.label) {
        this.ctx.fillStyle = '#333';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(output.label, x + 10, y + 3);
      }
    });
  }

  drawConnections() {
    this.connections.forEach(connection => {
      const fromNode = this.nodes.get(connection.from.nodeId);
      const toNode = this.nodes.get(connection.to.nodeId);
      
      if (fromNode && toNode) {
        const fromPoint = this.getConnectionPoint(fromNode, connection.from.outputIndex, true);
        const toPoint = this.getConnectionPoint(toNode, connection.to.inputIndex, false);

        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(fromPoint.x, fromPoint.y);
        
        // Bezier curve for smooth connections
        const cp1x = fromPoint.x + 50;
        const cp1y = fromPoint.y;
        const cp2x = toPoint.x - 50;
        const cp2y = toPoint.y;
        
        this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, toPoint.x, toPoint.y);
        this.ctx.stroke();

        // Arrow head
        this.drawArrowHead(toPoint.x, toPoint.y, Math.atan2(toPoint.y - cp2y, toPoint.x - cp2x));
      }
    });
  }

  drawArrowHead(x, y, angle) {
    const headSize = 10;
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(angle);
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(-headSize, -headSize/2);
    this.ctx.lineTo(-headSize, headSize/2);
    this.ctx.closePath();
    this.ctx.fillStyle = '#666';
    this.ctx.fill();
    this.ctx.restore();
  }

  getConnectionPoint(node, index, isOutput) {
    const pointSize = 8;
    if (isOutput) {
      return {
        x: node.x + node.width + pointSize/2,
        y: node.y + 20 + (index * 20)
      };
    } else {
      return {
        x: node.x - pointSize/2,
        y: node.y + 20 + (index * 20)
      };
    }
  }

  // State management
  saveState() {
    const state = {
      nodes: Array.from(this.nodes.entries()),
      connections: [...this.connections]
    };
    
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(JSON.stringify(state));
    this.historyIndex++;
    
    // Limit history size
    if (this.history.length > 50) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.loadState(this.history[this.historyIndex]);
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.loadState(this.history[this.historyIndex]);
    }
  }

  loadState(stateString) {
    const state = JSON.parse(stateString);
    this.nodes = new Map(state.nodes);
    this.connections = state.connections;
    this.draw();
  }

  // Copy/Paste functionality
  copy() {
    if (this.selectedNode) {
      this.clipboard = JSON.stringify(this.selectedNode);
    }
  }

  paste() {
    if (this.clipboard) {
      const node = JSON.parse(this.clipboard);
      node.id = `node_${this.nodeIdCounter++}`;
      node.x += 20;
      node.y += 20;
      this.nodes.set(node.id, node);
      this.selectedNode = node;
      this.saveState();
      this.draw();
    }
  }

  deleteSelected() {
    if (this.selectedNode && this.selectedNode.type !== 'start') {
      this.nodes.delete(this.selectedNode.id);
      this.connections = this.connections.filter(conn => 
        conn.from.nodeId !== this.selectedNode.id && 
        conn.to.nodeId !== this.selectedNode.id
      );
      this.selectedNode = null;
      this.saveState();
      this.draw();
    }
  }

  // Export/Import functionality
  exportChatbot() {
    const data = {
      nodes: Array.from(this.nodes.entries()),
      connections: this.connections,
      metadata: {
        name: prompt('Chatbot Name:', 'My Chatbot') || 'My Chatbot',
        created: new Date().toISOString(),
        version: '1.0'
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.metadata.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importChatbot() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            this.nodes = new Map(data.nodes);
            this.connections = data.connections;
            this.nodeIdCounter = Math.max(...Array.from(this.nodes.keys()).map(id => 
              parseInt(id.replace('node_', ''))
            )) + 1;
            this.saveState();
            this.draw();
          } catch (error) {
            alert('Error importing chatbot: ' + error.message);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  // Test functionality
  testChatbot() {
    const testWindow = window.open('', '_blank', 'width=400,height=600');
    testWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Chatbot Test</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .chat-container { border: 1px solid #ccc; height: 400px; overflow-y: auto; padding: 10px; margin-bottom: 10px; }
          .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
          .bot-message { background: #e3f2fd; }
          .user-message { background: #f3e5f5; text-align: right; }
          #input { width: 70%; padding: 10px; }
          #send { width: 25%; padding: 10px; }
        </style>
      </head>
      <body>
        <h3>Chatbot Test</h3>
        <div class="chat-container" id="chat"></div>
        <input type="text" id="input" placeholder="Type your message...">
        <button id="send">Send</button>
        <script>
          const chatData = ${JSON.stringify({
            nodes: Array.from(this.nodes.entries()),
            connections: this.connections
          })};
          // Test chatbot logic would go here
          document.getElementById('send').onclick = () => {
            const input = document.getElementById('input');
            const chat = document.getElementById('chat');
            chat.innerHTML += '<div class="message user-message">' + input.value + '</div>';
            chat.innerHTML += '<div class="message bot-message">This is a test response</div>';
            input.value = '';
            chat.scrollTop = chat.scrollHeight;
          };
        </script>
      </body>
      </html>
    `);
  }

  // View controls
  zoomIn() {
    this.scale = Math.min(3, this.scale * 1.2);
    this.draw();
  }

  zoomOut() {
    this.scale = Math.max(0.1, this.scale * 0.8);
    this.draw();
  }

  fitToCanvas() {
    if (this.nodes.size === 0) return;

    const bounds = this.getNodesBounds();
    const padding = 50;
    
    const scaleX = (this.canvas.width - padding * 2) / (bounds.maxX - bounds.minX);
    const scaleY = (this.canvas.height - padding * 2) / (bounds.maxY - bounds.minY);
    
    this.scale = Math.min(scaleX, scaleY, 1);
    this.panX = padding - bounds.minX * this.scale;
    this.panY = padding - bounds.minY * this.scale;
    
    this.draw();
  }

  getNodesBounds() {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    for (let node of this.nodes.values()) {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    }
    
    return { minX, minY, maxX, maxY };
  }

  toggleGrid() {
    this.showGrid = !this.showGrid;
    this.draw();
  }

  drawGrid() {
    const gridSize = 20;
    this.ctx.strokeStyle = '#f0f0f0';
    this.ctx.lineWidth = 1;

    const startX = Math.floor(-this.panX / this.scale / gridSize) * gridSize;
    const startY = Math.floor(-this.panY / this.scale / gridSize) * gridSize;
    const endX = startX + (this.canvas.width / this.scale) + gridSize;
    const endY = startY + (this.canvas.height / this.scale) + gridSize;

    for (let x = startX; x < endX; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, startY);
      this.ctx.lineTo(x, endY);
      this.ctx.stroke();
    }

    for (let y = startY; y < endY; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(startX, y);
      this.ctx.lineTo(endX, y);
      this.ctx.stroke();
    }
  }
}

// Initialize the builder when the page loads
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('chatbot-canvas')) {
    new AdvancedChatbotBuilder();
  }
});
