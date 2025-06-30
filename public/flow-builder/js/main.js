/**
 * Main entry point for the Flow Builder application
 * This file initializes and coordinates all modules
 */

// Import core modules
import { FlowBuilder } from './FlowBuilder.js';
import { NotificationManager } from './components/NotificationManager.js';

// Application state
let app = null;
let isInitialized = false;

/**
 * Initialize the application
 */
async function initializeApp() {
    try {
        console.log('Initializing Flow Builder app...');
        showLoadingScreen();
        
        // Initialize the main FlowBuilder application
        console.log('Creating FlowBuilder instance...');
        app = new FlowBuilder();
        console.log('FlowBuilder instance created');
        
        // Wait for initialization to complete
        console.log('Waiting for FlowBuilder to initialize...');
        await app.init();
        console.log('FlowBuilder initialization complete');
        
        // Set up global event handlers
        setupGlobalEventHandlers();
        
        // Hide loading screen
        hideLoadingScreen();
        
        isInitialized = true;
        
        console.log('Flow Builder initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize Flow Builder:', error);
        
        // Show error notification
        const notification = new NotificationManager();
        notification.show('Failed to initialize Flow Builder. Please refresh the page.', 'error');
        
        hideLoadingScreen();
    }
}

/**
 * Show loading screen
 */
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
}

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

/**
 * Set up global event handlers
 */
function setupGlobalEventHandlers() {
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Window events
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('resize', handleWindowResize);
    
    // Modal events
    setupModalEventHandlers();
    
    // Header button events
    setupHeaderEventHandlers();
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(event) {
    if (!app || !isInitialized) return;
    
    // Ctrl/Cmd + S: Save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        app.save();
    }
    
    // Ctrl/Cmd + Z: Undo
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        app.undo();
    }
    
    // Ctrl/Cmd + Shift + Z: Redo
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && event.shiftKey) {
        event.preventDefault();
        app.redo();
    }
    
    // Delete: Delete selected node
    if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNode = app.nodeManager.getSelectedNode();
        if (selectedNode && selectedNode.type !== 'start') {
            app.nodeManager.deleteNode(selectedNode.id);
        }
    }
    
    // Escape: Deselect all
    if (event.key === 'Escape') {
        app.nodeManager.deselectAll();
        app.propertiesPanel.clear();
    }
}

/**
 * Handle before unload
 */
function handleBeforeUnload(event) {
    if (app && app.isDirty) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return event.returnValue;
    }
}

/**
 * Handle window resize
 */
function handleWindowResize() {
    if (app && app.workspace) {
        app.workspace.handleResize();
    }
}

/**
 * Set up modal event handlers
 */
function setupModalEventHandlers() {
    // Close modal when clicking outside
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });
    
    // Close modal buttons
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', (event) => {
            const modalId = button.getAttribute('data-modal');
            if (modalId) {
                closeModal(modalId);
            } else {
                const modal = button.closest('.modal');
                if (modal) {
                    closeModal(modal.id);
                }
            }
        });
    });
}

/**
 * Set up header event handlers
 */
function setupHeaderEventHandlers() {
    // Save button
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if (app) app.save();
        });
    }
    
    // Test button
    const testBtn = document.getElementById('test-btn');
    if (testBtn) {
        testBtn.addEventListener('click', () => {
            openModal('test-modal');
            if (app) app.startTest();
        });
    }
    
    // Export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            openModal('export-modal');
        });
    }
    
    // Publish button
    const publishBtn = document.getElementById('publish-btn');
    if (publishBtn) {
        publishBtn.addEventListener('click', () => {
            if (app) app.publish();
        });
    }
    
    // Zoom controls
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    const zoomFit = document.getElementById('zoom-fit');
    
    if (zoomIn) {
        zoomIn.addEventListener('click', () => {
            if (app && app.workspace) app.workspace.zoomIn();
        });
    }
    
    if (zoomOut) {
        zoomOut.addEventListener('click', () => {
            if (app && app.workspace) app.workspace.zoomOut();
        });
    }
    
    if (zoomFit) {
        zoomFit.addEventListener('click', () => {
            if (app && app.workspace) app.workspace.fitToScreen();
        });
    }
    
    // Canvas controls
    const centerCanvas = document.getElementById('center-canvas');
    const toggleGrid = document.getElementById('toggle-grid');
    const toggleMinimap = document.getElementById('toggle-minimap');
    
    if (centerCanvas) {
        centerCanvas.addEventListener('click', () => {
            if (app && app.workspace) app.workspace.centerCanvas();
        });
    }
    
    if (toggleGrid) {
        toggleGrid.addEventListener('click', () => {
            if (app && app.workspace) app.workspace.toggleGrid();
        });
    }
    
    if (toggleMinimap) {
        toggleMinimap.addEventListener('click', () => {
            if (app && app.workspace) app.workspace.toggleMinimap();
        });
    }
    
    // Export options
    document.querySelectorAll('.export-option').forEach(button => {
        button.addEventListener('click', (event) => {
            const format = button.getAttribute('data-format');
            if (app) {
                app.export(format);
                closeModal('export-modal');
            }
        });
    });
}

/**
 * Open modal
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    }
}

/**
 * Close modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

/**
 * Export app instance for debugging
 */
window.flowBuilderApp = () => app;

// Initialize the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
