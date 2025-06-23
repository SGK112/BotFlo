import { EventEmitter } from '../core/EventEmitter.js';

export class DragDropHandler extends EventEmitter {
    constructor() {
        super();
        this.draggedElement = null;
        this.draggedData = null;
        this.dropZones = new Set();
        this.init();
    }

    init() {
        this.setupGlobalListeners();
    }

    setupGlobalListeners() {
        document.addEventListener('dragstart', this.handleDragStart.bind(this));
        document.addEventListener('dragend', this.handleDragEnd.bind(this));
        document.addEventListener('dragover', this.handleDragOver.bind(this));
        document.addEventListener('drop', this.handleDrop.bind(this));
        document.addEventListener('dragenter', this.handleDragEnter.bind(this));
        document.addEventListener('dragleave', this.handleDragLeave.bind(this));
    }

    makeDraggable(element, data) {
        element.draggable = true;
        element.dataset.dragData = JSON.stringify(data);
        
        element.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', JSON.stringify(data));
            event.dataTransfer.effectAllowed = 'copy';
            this.emit('dragStarted', { element, data });
        });
    }

    makeDropZone(element, options = {}) {
        this.dropZones.add(element);
        element.classList.add('drop-zone');
        
        if (options.acceptTypes) {
            element.dataset.acceptTypes = JSON.stringify(options.acceptTypes);
        }

        element.addEventListener('dragover', (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
        });

        element.addEventListener('drop', (event) => {
            event.preventDefault();
            const data = event.dataTransfer.getData('text/plain');
            
            try {
                const dropData = JSON.parse(data);
                
                if (this.canAcceptDrop(element, dropData)) {
                    this.emit('dropped', {
                        dropZone: element,
                        data: dropData,
                        position: {
                            x: event.offsetX,
                            y: event.offsetY
                        }
                    });
                }
            } catch (error) {
                console.warn('Invalid drop data:', error);
            }
        });
    }

    handleDragStart(event) {
        this.draggedElement = event.target;
        try {
            this.draggedData = JSON.parse(event.target.dataset.dragData || '{}');
        } catch (error) {
            this.draggedData = {};
        }

        // Add visual feedback
        event.target.classList.add('dragging');
        this.addDropZoneHighlights();
    }

    handleDragEnd(event) {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
            this.removeDropZoneHighlights();
            this.draggedElement = null;
            this.draggedData = null;
        }
    }

    handleDragOver(event) {
        event.preventDefault();
    }

    handleDrop(event) {
        event.preventDefault();
        this.removeDropZoneHighlights();
    }

    handleDragEnter(event) {
        if (this.isDropZone(event.target)) {
            event.target.classList.add('drag-over');
        }
    }

    handleDragLeave(event) {
        if (this.isDropZone(event.target)) {
            // Check if we're actually leaving the drop zone
            const rect = event.target.getBoundingClientRect();
            const x = event.clientX;
            const y = event.clientY;
            
            if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                event.target.classList.remove('drag-over');
            }
        }
    }

    addDropZoneHighlights() {
        this.dropZones.forEach(dropZone => {
            if (this.canAcceptDrop(dropZone, this.draggedData)) {
                dropZone.classList.add('can-drop');
            }
        });
    }

    removeDropZoneHighlights() {
        this.dropZones.forEach(dropZone => {
            dropZone.classList.remove('can-drop', 'drag-over');
        });
    }

    canAcceptDrop(dropZone, data) {
        const acceptTypes = dropZone.dataset.acceptTypes;
        if (!acceptTypes) return true;

        try {
            const types = JSON.parse(acceptTypes);
            return types.includes(data.type);
        } catch (error) {
            return true;
        }
    }

    isDropZone(element) {
        return this.dropZones.has(element) || element.classList.contains('drop-zone');
    }

    setDragImage(element, image, offsetX = 0, offsetY = 0) {
        element.addEventListener('dragstart', (event) => {
            if (image) {
                event.dataTransfer.setDragImage(image, offsetX, offsetY);
            }
        });
    }

    createDragGhost(content, className = 'drag-ghost') {
        const ghost = document.createElement('div');
        ghost.className = className;
        ghost.innerHTML = content;
        ghost.style.position = 'absolute';
        ghost.style.top = '-1000px';
        ghost.style.pointerEvents = 'none';
        document.body.appendChild(ghost);
        
        return ghost;
    }

    removeDragGhost(ghost) {
        if (ghost && ghost.parentElement) {
            ghost.parentElement.removeChild(ghost);
        }
    }

    enableSortable(container, options = {}) {
        let draggedItem = null;
        let placeholder = null;

        container.addEventListener('dragstart', (event) => {
            if (event.target.classList.contains(options.itemClass || 'sortable-item')) {
                draggedItem = event.target;
                event.target.classList.add('dragging');
                
                // Create placeholder
                placeholder = document.createElement('div');
                placeholder.className = 'sort-placeholder';
                placeholder.style.height = draggedItem.offsetHeight + 'px';
            }
        });

        container.addEventListener('dragover', (event) => {
            event.preventDefault();
            if (!draggedItem) return;

            const afterElement = this.getDragAfterElement(container, event.clientY);
            if (afterElement == null) {
                container.appendChild(placeholder);
            } else {
                container.insertBefore(placeholder, afterElement);
            }
        });

        container.addEventListener('dragend', (event) => {
            if (draggedItem) {
                draggedItem.classList.remove('dragging');
                
                if (placeholder && placeholder.parentElement) {
                    placeholder.parentElement.insertBefore(draggedItem, placeholder);
                    placeholder.remove();
                    
                    this.emit('sorted', {
                        item: draggedItem,
                        container: container,
                        newIndex: Array.from(container.children).indexOf(draggedItem)
                    });
                }
                
                draggedItem = null;
                placeholder = null;
            }
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.sortable-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    destroy() {
        document.removeEventListener('dragstart', this.handleDragStart.bind(this));
        document.removeEventListener('dragend', this.handleDragEnd.bind(this));
        document.removeEventListener('dragover', this.handleDragOver.bind(this));
        document.removeEventListener('drop', this.handleDrop.bind(this));
        document.removeEventListener('dragenter', this.handleDragEnter.bind(this));
        document.removeEventListener('dragleave', this.handleDragLeave.bind(this));
        
        this.dropZones.clear();
    }
}
