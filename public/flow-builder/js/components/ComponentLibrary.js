/**
 * ComponentLibrary - Manages the component sidebar and drag-and-drop functionality
 */
import { EventEmitter } from '../core/EventEmitter.js';
import { NODE_CONFIGS, NODE_CATEGORIES, getNodeTypesByCategory, searchNodes } from '../utils/NodeConfigs.js';

export class ComponentLibrary extends EventEmitter {
    constructor(container) {
        super();
        this.container = container;
        this.searchInput = null;
        this.categories = new Map();
        this.isInitialized = false;
    }

    /**
     * Initialize the component library
     */
    async init() {
        try {
            this.render();
            this.setupEventHandlers();
            this.isInitialized = true;
            console.log('ComponentLibrary initialized');
        } catch (error) {
            console.error('Failed to initialize ComponentLibrary:', error);
            throw error;
        }
    }

    /**
     * Render the component library UI
     */
    render() {
        this.container.innerHTML = `
            ${this.renderHeader()}
            ${this.renderSearchBar()}
            ${this.renderCategories()}
        `;
    }

    /**
     * Render the header section
     */
    renderHeader() {
        return `
            <div class="sidebar-header">
                <div class="sidebar-title">Components</div>
                <div class="sidebar-subtitle">Drag to add to flow</div>
            </div>
        `;
    }

    /**
     * Render the search bar
     */
    renderSearchBar() {
        return `
            <div class="component-search">
                <input 
                    type="text" 
                    placeholder="Search components..." 
                    class="form-control"
                    id="component-search-input"
                    autocomplete="off"
                >
            </div>
        `;
    }

    /**
     * Render all categories and their components
     */
    renderCategories() {
        const categoriesHtml = Object.entries(NODE_CATEGORIES)
            .map(([categoryId, category]) => this.renderCategory(categoryId, category))
            .join('');

        return `
            <div class="sidebar-content">
                ${categoriesHtml}
            </div>
        `;
    }

    /**
     * Render a single category
     */
    renderCategory(categoryId, category) {
        const nodeTypes = getNodeTypesByCategory(categoryId);
        const componentsHtml = nodeTypes
            .map(type => this.renderComponent(type, NODE_CONFIGS[type]))
            .join('');

        return `
            <div class="component-category" data-category="${categoryId}">
                <div class="category-header" onclick="componentLibrary.toggleCategory('${categoryId}')">
                    <span>
                        <i class="${category.icon}"></i>
                        ${category.name}
                    </span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="category-content" data-category-content="${categoryId}">
                    ${componentsHtml}
                </div>
            </div>
        `;
    }

    /**
     * Render a single component item
     */
    renderComponent(type, config) {
        return `
            <div 
                class="component-item" 
                draggable="true" 
                data-component="${type}"
                data-name="${config.name}"
                data-description="${config.description}"
                title="${config.description}"
            >
                <div class="component-icon ${config.iconClass}">
                    ${config.icon}
                </div>
                <div class="component-info">
                    <h4>${config.name}</h4>
                    <p>${config.description}</p>
                </div>
            </div>
        `;
    }

    /**
     * Set up event handlers
     */
    setupEventHandlers() {
        // Search functionality
        this.searchInput = this.container.querySelector('#component-search-input');
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });

            this.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.clearSearch();
                }
            });
        }

        // Component drag handlers
        this.setupDragAndDrop();

        // Global methods for category toggle
        window.componentLibrary = window.componentLibrary || {};
        window.componentLibrary.toggleCategory = (categoryId) => this.toggleCategory(categoryId);
    }

    /**
     * Set up drag and drop functionality
     */
    setupDragAndDrop() {
        const componentItems = this.container.querySelectorAll('.component-item');
        
        componentItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                const componentType = item.dataset.component;
                const componentName = item.dataset.name;
                
                // Set drag data in consistent format
                const dragData = {
                    type: 'component',
                    componentType: componentType,
                    name: componentName
                };
                
                e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
                e.dataTransfer.setData('application/json', JSON.stringify(dragData));
                e.dataTransfer.effectAllowed = 'copy';
                
                // Add visual feedback
                item.classList.add('dragging');
                
                // Emit event
                this.emit('component:drag:start', {
                    type: componentType,
                    name: componentName,
                    element: item
                });
            });

            item.addEventListener('dragend', (e) => {
                // Remove visual feedback
                item.classList.remove('dragging');
                
                // Emit event
                this.emit('component:drag:end', {
                    type: item.dataset.component,
                    element: item
                });
            });

            // Add hover effects
            item.addEventListener('mouseenter', () => {
                this.showComponentPreview(item);
            });

            item.addEventListener('mouseleave', () => {
                this.hideComponentPreview();
            });
        });
    }

    /**
     * Toggle category open/closed state
     */
    toggleCategory(categoryId) {
        const categoryElement = this.container.querySelector(`[data-category="${categoryId}"]`);
        const contentElement = this.container.querySelector(`[data-category-content="${categoryId}"]`);
        const headerElement = categoryElement?.querySelector('.category-header');
        const chevronIcon = headerElement?.querySelector('.fa-chevron-down');

        if (!categoryElement || !contentElement) return;

        const isOpen = !contentElement.classList.contains('collapsed');
        
        if (isOpen) {
            // Close category
            contentElement.classList.add('collapsed');
            headerElement?.classList.add('collapsed');
            if (chevronIcon) {
                chevronIcon.style.transform = 'rotate(-90deg)';
            }
        } else {
            // Open category
            contentElement.classList.remove('collapsed');
            headerElement?.classList.remove('collapsed');
            if (chevronIcon) {
                chevronIcon.style.transform = 'rotate(0deg)';
            }
        }

        // Save state to localStorage
        this.saveCategoryState(categoryId, !isOpen);
    }

    /**
     * Handle search input
     */
    handleSearch(query) {
        const trimmedQuery = query.trim().toLowerCase();
        
        if (trimmedQuery === '') {
            this.clearSearch();
            return;
        }

        // Find matching components
        const matchingTypes = searchNodes(trimmedQuery);
        
        // Hide all components first
        const allComponents = this.container.querySelectorAll('.component-item');
        allComponents.forEach(item => {
            item.style.display = 'none';
        });

        // Show matching components and their categories
        const visibleCategories = new Set();
        
        matchingTypes.forEach(type => {
            const component = this.container.querySelector(`[data-component="${type}"]`);
            if (component) {
                component.style.display = 'flex';
                
                // Find parent category
                const category = component.closest('.component-category');
                if (category) {
                    const categoryId = category.dataset.category;
                    visibleCategories.add(categoryId);
                }
            }
        });

        // Show categories with matches, hide others
        const allCategories = this.container.querySelectorAll('.component-category');
        allCategories.forEach(category => {
            const categoryId = category.dataset.category;
            const content = category.querySelector('.category-content');
            
            if (visibleCategories.has(categoryId)) {
                category.style.display = 'block';
                content.classList.remove('collapsed');
            } else {
                category.style.display = 'none';
            }
        });

        // Show "no results" if nothing found
        if (matchingTypes.length === 0) {
            this.showNoResults(trimmedQuery);
        } else {
            this.hideNoResults();
        }
    }

    /**
     * Clear search and show all components
     */
    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
        }

        // Show all components and categories
        const allItems = this.container.querySelectorAll('.component-item, .component-category');
        allItems.forEach(item => {
            item.style.display = '';
        });

        // Restore category states
        this.restoreCategoryStates();
        
        this.hideNoResults();
    }

    /**
     * Show no results message
     */
    showNoResults(query) {
        this.hideNoResults(); // Remove existing
        
        const noResultsHtml = `
            <div class="component-empty" id="no-search-results">
                <i class="fas fa-search"></i>
                <h4>No components found</h4>
                <p>No components match "${query}"</p>
            </div>
        `;
        
        this.container.querySelector('.sidebar-content').insertAdjacentHTML('beforeend', noResultsHtml);
    }

    /**
     * Hide no results message
     */
    hideNoResults() {
        const noResults = this.container.querySelector('#no-search-results');
        if (noResults) {
            noResults.remove();
        }
    }

    /**
     * Show component preview (tooltip or sidebar)
     */
    showComponentPreview(componentElement) {
        const componentType = componentElement.dataset.component;
        const config = NODE_CONFIGS[componentType];
        
        // You could implement a detailed preview here
        // For now, we'll just rely on the title attribute
    }

    /**
     * Hide component preview
     */
    hideComponentPreview() {
        // Implementation for hiding preview
    }

    /**
     * Save category state to localStorage
     */
    saveCategoryState(categoryId, isOpen) {
        try {
            const states = JSON.parse(localStorage.getItem('componentLibrary:categoryStates') || '{}');
            states[categoryId] = isOpen;
            localStorage.setItem('componentLibrary:categoryStates', JSON.stringify(states));
        } catch (error) {
            console.warn('Failed to save category state:', error);
        }
    }

    /**
     * Restore category states from localStorage
     */
    restoreCategoryStates() {
        try {
            const states = JSON.parse(localStorage.getItem('componentLibrary:categoryStates') || '{}');
            
            Object.entries(states).forEach(([categoryId, isOpen]) => {
                const categoryElement = this.container.querySelector(`[data-category="${categoryId}"]`);
                const contentElement = this.container.querySelector(`[data-category-content="${categoryId}"]`);
                const headerElement = categoryElement?.querySelector('.category-header');
                const chevronIcon = headerElement?.querySelector('.fa-chevron-down');

                if (!categoryElement || !contentElement) return;

                if (isOpen) {
                    contentElement.classList.remove('collapsed');
                    headerElement?.classList.remove('collapsed');
                    if (chevronIcon) {
                        chevronIcon.style.transform = 'rotate(0deg)';
                    }
                } else {
                    contentElement.classList.add('collapsed');
                    headerElement?.classList.add('collapsed');
                    if (chevronIcon) {
                        chevronIcon.style.transform = 'rotate(-90deg)';
                    }
                }
            });
        } catch (error) {
            console.warn('Failed to restore category states:', error);
        }
    }

    /**
     * Filter components by category
     */
    filterByCategory(categoryId) {
        const allCategories = this.container.querySelectorAll('.component-category');
        
        allCategories.forEach(category => {
            if (category.dataset.category === categoryId) {
                category.style.display = 'block';
            } else {
                category.style.display = 'none';
            }
        });
    }

    /**
     * Show all categories
     */
    showAllCategories() {
        const allCategories = this.container.querySelectorAll('.component-category');
        allCategories.forEach(category => {
            category.style.display = 'block';
        });
    }

    /**
     * Get component count by category
     */
    getComponentCount(categoryId) {
        return getNodeTypesByCategory(categoryId).length;
    }

    /**
     * Refresh the component library
     */
    refresh() {
        this.render();
        this.setupEventHandlers();
        this.restoreCategoryStates();
    }

    /**
     * Destroy the component library
     */
    destroy() {
        this.removeAllListeners();
        
        // Clean up global methods
        if (window.componentLibrary) {
            delete window.componentLibrary.toggleCategory;
        }
        
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
