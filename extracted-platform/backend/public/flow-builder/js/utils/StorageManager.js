/**
 * StorageManager - Handles data persistence using localStorage and IndexedDB
 */

export class StorageManager {
    constructor() {
        this.storageKey = 'flow-builder';
        this.dbName = 'FlowBuilderDB';
        this.dbVersion = 1;
        this.db = null;
        
        this.init();
    }

    /**
     * Initialize storage manager
     */
    async init() {
        try {
            // Initialize IndexedDB for large data
            await this.initIndexedDB();
            
            // Migrate localStorage data if needed
            await this.migrateLocalStorageData();
            
            console.log('StorageManager initialized');
        } catch (error) {
            console.warn('Failed to initialize IndexedDB, falling back to localStorage:', error);
        }
    }

    /**
     * Initialize IndexedDB
     */
    initIndexedDB() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                reject(new Error('IndexedDB not supported'));
                return;
            }

            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                reject(new Error('Failed to open IndexedDB'));
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores
                if (!db.objectStoreNames.contains('projects')) {
                    const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
                    projectStore.createIndex('name', 'name', { unique: false });
                    projectStore.createIndex('created', 'created', { unique: false });
                    projectStore.createIndex('modified', 'modified', { unique: false });
                }

                if (!db.objectStoreNames.contains('templates')) {
                    const templateStore = db.createObjectStore('templates', { keyPath: 'id' });
                    templateStore.createIndex('name', 'name', { unique: false });
                    templateStore.createIndex('category', 'category', { unique: false });
                }

                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    /**
     * Migrate data from localStorage to IndexedDB
     */
    async migrateLocalStorageData() {
        try {
            // Check for existing localStorage data
            const oldData = localStorage.getItem('chatbot_flow');
            if (oldData && this.db) {
                const parsedData = JSON.parse(oldData);
                
                // Save as 'migrated' project
                await this.saveProject('migrated', {
                    nodes: parsedData,
                    metadata: {
                        name: 'Migrated Project',
                        created: Date.now(),
                        modified: Date.now(),
                        version: '1.0.0'
                    }
                });

                // Remove old data
                localStorage.removeItem('chatbot_flow');
                console.log('Migrated localStorage data to IndexedDB');
            }
        } catch (error) {
            console.warn('Failed to migrate localStorage data:', error);
        }
    }

    /**
     * Save project data
     * @param {string} projectId - Project identifier
     * @param {object} data - Project data
     */
    async saveProject(projectId, data) {
        const projectData = {
            id: projectId,
            ...data,
            modified: Date.now()
        };

        try {
            if (this.db) {
                await this.saveToIndexedDB('projects', projectData);
            } else {
                await this.saveToLocalStorage(`${this.storageKey}:project:${projectId}`, projectData);
            }
        } catch (error) {
            console.error('Failed to save project:', error);
            throw error;
        }
    }

    /**
     * Load project data
     * @param {string} projectId - Project identifier
     * @returns {object|null} Project data or null if not found
     */
    async loadProject(projectId) {
        try {
            if (this.db) {
                return await this.loadFromIndexedDB('projects', projectId);
            } else {
                return await this.loadFromLocalStorage(`${this.storageKey}:project:${projectId}`);
            }
        } catch (error) {
            console.error('Failed to load project:', error);
            return null;
        }
    }

    /**
     * Delete project
     * @param {string} projectId - Project identifier
     */
    async deleteProject(projectId) {
        try {
            if (this.db) {
                await this.deleteFromIndexedDB('projects', projectId);
            } else {
                localStorage.removeItem(`${this.storageKey}:project:${projectId}`);
            }
        } catch (error) {
            console.error('Failed to delete project:', error);
            throw error;
        }
    }

    /**
     * List all projects
     * @returns {array} Array of project metadata
     */
    async listProjects() {
        try {
            if (this.db) {
                return await this.listFromIndexedDB('projects');
            } else {
                return await this.listFromLocalStorage(`${this.storageKey}:project:`);
            }
        } catch (error) {
            console.error('Failed to list projects:', error);
            return [];
        }
    }

    /**
     * Save template
     * @param {string} templateId - Template identifier
     * @param {object} data - Template data
     */
    async saveTemplate(templateId, data) {
        const templateData = {
            id: templateId,
            ...data,
            created: data.created || Date.now(),
            modified: Date.now()
        };

        try {
            if (this.db) {
                await this.saveToIndexedDB('templates', templateData);
            } else {
                await this.saveToLocalStorage(`${this.storageKey}:template:${templateId}`, templateData);
            }
        } catch (error) {
            console.error('Failed to save template:', error);
            throw error;
        }
    }

    /**
     * Load template
     * @param {string} templateId - Template identifier
     * @returns {object|null} Template data or null if not found
     */
    async loadTemplate(templateId) {
        try {
            if (this.db) {
                return await this.loadFromIndexedDB('templates', templateId);
            } else {
                return await this.loadFromLocalStorage(`${this.storageKey}:template:${templateId}`);
            }
        } catch (error) {
            console.error('Failed to load template:', error);
            return null;
        }
    }

    /**
     * List all templates
     * @returns {array} Array of template metadata
     */
    async listTemplates() {
        try {
            if (this.db) {
                return await this.listFromIndexedDB('templates');
            } else {
                return await this.listFromLocalStorage(`${this.storageKey}:template:`);
            }
        } catch (error) {
            console.error('Failed to list templates:', error);
            return [];
        }
    }

    /**
     * Save user settings
     * @param {string} key - Setting key
     * @param {any} value - Setting value
     */
    async saveSetting(key, value) {
        const settingData = {
            key: key,
            value: value,
            modified: Date.now()
        };

        try {
            if (this.db) {
                await this.saveToIndexedDB('settings', settingData);
            } else {
                await this.saveToLocalStorage(`${this.storageKey}:setting:${key}`, settingData);
            }
        } catch (error) {
            console.error('Failed to save setting:', error);
            throw error;
        }
    }

    /**
     * Load user setting
     * @param {string} key - Setting key
     * @param {any} defaultValue - Default value if setting not found
     * @returns {any} Setting value
     */
    async loadSetting(key, defaultValue = null) {
        try {
            const setting = this.db 
                ? await this.loadFromIndexedDB('settings', key)
                : await this.loadFromLocalStorage(`${this.storageKey}:setting:${key}`);
            
            return setting ? setting.value : defaultValue;
        } catch (error) {
            console.error('Failed to load setting:', error);
            return defaultValue;
        }
    }

    /**
     * Export all data
     * @returns {object} Exported data
     */
    async exportData() {
        try {
            const [projects, templates, settings] = await Promise.all([
                this.listProjects(),
                this.listTemplates(),
                this.db ? this.listFromIndexedDB('settings') : []
            ]);

            return {
                version: '1.0.0',
                exported: Date.now(),
                projects,
                templates,
                settings,
                metadata: {
                    totalProjects: projects.length,
                    totalTemplates: templates.length,
                    storageType: this.db ? 'indexeddb' : 'localstorage'
                }
            };
        } catch (error) {
            console.error('Failed to export data:', error);
            throw error;
        }
    }

    /**
     * Import data
     * @param {object} data - Data to import
     */
    async importData(data) {
        try {
            // Validate data format
            if (!data.version || !data.projects) {
                throw new Error('Invalid data format');
            }

            // Import projects
            if (data.projects && Array.isArray(data.projects)) {
                for (const project of data.projects) {
                    await this.saveProject(project.id, project);
                }
            }

            // Import templates
            if (data.templates && Array.isArray(data.templates)) {
                for (const template of data.templates) {
                    await this.saveTemplate(template.id, template);
                }
            }

            // Import settings
            if (data.settings && Array.isArray(data.settings)) {
                for (const setting of data.settings) {
                    await this.saveSetting(setting.key, setting.value);
                }
            }

        } catch (error) {
            console.error('Failed to import data:', error);
            throw error;
        }
    }

    /**
     * Clear all data
     */
    async clearAllData() {
        try {
            if (this.db) {
                const transaction = this.db.transaction(['projects', 'templates', 'settings'], 'readwrite');
                
                await Promise.all([
                    this.clearObjectStore(transaction.objectStore('projects')),
                    this.clearObjectStore(transaction.objectStore('templates')),
                    this.clearObjectStore(transaction.objectStore('settings'))
                ]);
            } else {
                // Clear localStorage
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(this.storageKey)) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));
            }
        } catch (error) {
            console.error('Failed to clear data:', error);
            throw error;
        }
    }

    /**
     * Get storage usage statistics
     * @returns {object} Storage statistics
     */
    async getStorageStats() {
        try {
            const [projects, templates] = await Promise.all([
                this.listProjects(),
                this.listTemplates()
            ]);

            const stats = {
                projects: projects.length,
                templates: templates.length,
                storageType: this.db ? 'IndexedDB' : 'localStorage',
                totalSize: 0
            };

            // Calculate approximate size
            if (this.db) {
                // For IndexedDB, this is an estimate
                stats.totalSize = JSON.stringify({ projects, templates }).length;
            } else {
                // Calculate localStorage usage
                let totalSize = 0;
                for (let key in localStorage) {
                    if (key.startsWith(this.storageKey)) {
                        totalSize += localStorage[key].length;
                    }
                }
                stats.totalSize = totalSize;
            }

            return stats;
        } catch (error) {
            console.error('Failed to get storage stats:', error);
            return {
                projects: 0,
                templates: 0,
                storageType: 'unknown',
                totalSize: 0
            };
        }
    }

    // IndexedDB helper methods

    async saveToIndexedDB(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async loadFromIndexedDB(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteFromIndexedDB(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async listFromIndexedDB(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async clearObjectStore(store) {
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // localStorage helper methods

    async saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                throw new Error('Storage quota exceeded');
            }
            throw error;
        }
    }

    async loadFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn(`Failed to parse localStorage data for key ${key}:`, error);
            return null;
        }
    }

    async listFromLocalStorage(prefix) {
        const items = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                const data = await this.loadFromLocalStorage(key);
                if (data) {
                    items.push(data);
                }
            }
        }
        return items;
    }
}
