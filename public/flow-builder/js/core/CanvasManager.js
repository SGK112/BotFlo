import { EventEmitter } from './EventEmitter.js';

export class CanvasManager extends EventEmitter {
    constructor(canvasElement) {
        super();
        this.canvas = canvasElement;
        this.context = null;
        this.scale = 1;
        this.offset = { x: 0, y: 0 };
        this.isPanning = false;
        this.lastPanPoint = { x: 0, y: 0 };
        
        this.init();
    }

    init() {
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'flow-canvas';
            this.canvas.className = 'flow-canvas';
        }

        this.context = this.canvas.getContext('2d');
        this.setupEventListeners();
        this.resize();
    }

    setupEventListeners() {
        // Mouse events for panning and zooming
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));

        // Window resize
        window.addEventListener('resize', this.resize.bind(this));
    }

    handleMouseDown(event) {
        if (event.button === 1 || (event.button === 0 && event.ctrlKey)) {
            this.startPanning(event.clientX, event.clientY);
        }
    }

    handleMouseMove(event) {
        if (this.isPanning) {
            this.updatePanning(event.clientX, event.clientY);
        }
    }

    handleMouseUp(event) {
        if (this.isPanning) {
            this.stopPanning();
        }
    }

    handleWheel(event) {
        event.preventDefault();
        const delta = event.deltaY > 0 ? 0.9 : 1.1;
        this.zoom(delta, event.clientX, event.clientY);
    }

    handleTouchStart(event) {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.startPanning(touch.clientX, touch.clientY);
        }
    }

    handleTouchMove(event) {
        event.preventDefault();
        if (event.touches.length === 1 && this.isPanning) {
            const touch = event.touches[0];
            this.updatePanning(touch.clientX, touch.clientY);
        }
    }

    handleTouchEnd(event) {
        if (this.isPanning) {
            this.stopPanning();
        }
    }

    startPanning(x, y) {
        this.isPanning = true;
        this.lastPanPoint = { x, y };
        this.canvas.style.cursor = 'grabbing';
    }

    updatePanning(x, y) {
        const deltaX = x - this.lastPanPoint.x;
        const deltaY = y - this.lastPanPoint.y;
        
        this.offset.x += deltaX;
        this.offset.y += deltaY;
        
        this.lastPanPoint = { x, y };
        this.emit('canvasUpdated');
    }

    stopPanning() {
        this.isPanning = false;
        this.canvas.style.cursor = 'default';
    }

    zoom(factor, centerX = 0, centerY = 0) {
        const newScale = Math.max(0.1, Math.min(3, this.scale * factor));
        
        if (newScale !== this.scale) {
            const rect = this.canvas.getBoundingClientRect();
            const x = centerX - rect.left;
            const y = centerY - rect.top;
            
            const scaleChange = newScale / this.scale;
            this.offset.x = x - (x - this.offset.x) * scaleChange;
            this.offset.y = y - (y - this.offset.y) * scaleChange;
            
            this.scale = newScale;
            this.emit('canvasUpdated');
        }
    }

    resize() {
        const parent = this.canvas.parentElement;
        if (parent) {
            this.canvas.width = parent.clientWidth;
            this.canvas.height = parent.clientHeight;
            this.emit('canvasResized');
        }
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        const ctx = this.context;
        const gridSize = 20 * this.scale;
        const offsetX = this.offset.x % gridSize;
        const offsetY = this.offset.y % gridSize;

        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;

        // Vertical lines
        for (let x = offsetX; x < this.canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = offsetY; y < this.canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }

        ctx.globalAlpha = 1;
    }

    worldToCanvas(worldPos) {
        return {
            x: (worldPos.x * this.scale) + this.offset.x,
            y: (worldPos.y * this.scale) + this.offset.y
        };
    }

    canvasToWorld(canvasPos) {
        return {
            x: (canvasPos.x - this.offset.x) / this.scale,
            y: (canvasPos.y - this.offset.y) / this.scale
        };
    }

    getCanvas() {
        return this.canvas;
    }

    getContext() {
        return this.context;
    }

    resetView() {
        this.scale = 1;
        this.offset = { x: 0, y: 0 };
        this.emit('canvasUpdated');
    }

    centerView() {
        this.offset.x = this.canvas.width / 2;
        this.offset.y = this.canvas.height / 2;
        this.emit('canvasUpdated');
    }
}
