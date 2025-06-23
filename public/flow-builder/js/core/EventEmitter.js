/**
 * EventEmitter - Simple event system for communication between modules
 */
export class EventEmitter {
    constructor() {
        this.events = new Map();
    }

    /**
     * Subscribe to an event
     * @param {string} eventName - Name of the event
     * @param {function} callback - Callback function
     * @param {object} options - Options (once, priority)
     * @returns {function} Unsubscribe function
     */
    on(eventName, callback, options = {}) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }

        const listener = {
            callback,
            once: options.once || false,
            priority: options.priority || 0,
            id: Symbol('listener')
        };

        const listeners = this.events.get(eventName);
        
        // Insert based on priority (higher priority first)
        const insertIndex = listeners.findIndex(l => l.priority < listener.priority);
        if (insertIndex === -1) {
            listeners.push(listener);
        } else {
            listeners.splice(insertIndex, 0, listener);
        }

        // Return unsubscribe function
        return () => this.off(eventName, listener.id);
    }

    /**
     * Subscribe to an event once
     * @param {string} eventName - Name of the event
     * @param {function} callback - Callback function
     * @returns {function} Unsubscribe function
     */
    once(eventName, callback) {
        return this.on(eventName, callback, { once: true });
    }

    /**
     * Unsubscribe from an event
     * @param {string} eventName - Name of the event
     * @param {symbol|function} listenerIdOrCallback - Listener ID or callback function
     */
    off(eventName, listenerIdOrCallback) {
        if (!this.events.has(eventName)) {
            return;
        }

        const listeners = this.events.get(eventName);
        
        if (typeof listenerIdOrCallback === 'symbol') {
            // Remove by ID
            const index = listeners.findIndex(l => l.id === listenerIdOrCallback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        } else if (typeof listenerIdOrCallback === 'function') {
            // Remove by callback function
            const index = listeners.findIndex(l => l.callback === listenerIdOrCallback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }

        // Clean up empty event arrays
        if (listeners.length === 0) {
            this.events.delete(eventName);
        }
    }

    /**
     * Emit an event
     * @param {string} eventName - Name of the event
     * @param {...any} args - Arguments to pass to listeners
     */
    emit(eventName, ...args) {
        if (!this.events.has(eventName)) {
            return;
        }

        const listeners = this.events.get(eventName).slice(); // Create copy to avoid issues with modifications during iteration
        const onceListeners = [];

        for (const listener of listeners) {
            try {
                listener.callback(...args);
                
                if (listener.once) {
                    onceListeners.push(listener.id);
                }
            } catch (error) {
                console.error(`Error in event listener for '${eventName}':`, error);
            }
        }

        // Remove 'once' listeners after execution
        onceListeners.forEach(id => this.off(eventName, id));
    }

    /**
     * Remove all listeners for an event or all events
     * @param {string} [eventName] - Optional event name to clear specific event
     */
    removeAllListeners(eventName) {
        if (eventName) {
            this.events.delete(eventName);
        } else {
            this.events.clear();
        }
    }

    /**
     * Get list of event names that have listeners
     * @returns {string[]} Array of event names
     */
    eventNames() {
        return Array.from(this.events.keys());
    }

    /**
     * Get number of listeners for an event
     * @param {string} eventName - Name of the event
     * @returns {number} Number of listeners
     */
    listenerCount(eventName) {
        if (!this.events.has(eventName)) {
            return 0;
        }
        return this.events.get(eventName).length;
    }

    /**
     * Create a promise that resolves when an event is emitted
     * @param {string} eventName - Name of the event
     * @param {number} [timeout] - Optional timeout in milliseconds
     * @returns {Promise} Promise that resolves with event arguments
     */
    waitFor(eventName, timeout) {
        return new Promise((resolve, reject) => {
            let timeoutId;
            
            const unsubscribe = this.once(eventName, (...args) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                resolve(args);
            });

            if (timeout) {
                timeoutId = setTimeout(() => {
                    unsubscribe();
                    reject(new Error(`Event '${eventName}' timeout after ${timeout}ms`));
                }, timeout);
            }
        });
    }

    /**
     * Create a namespaced event emitter
     * @param {string} namespace - Namespace prefix
     * @returns {object} Namespaced event methods
     */
    namespace(namespace) {
        const prefixEvent = (eventName) => `${namespace}:${eventName}`;
        
        return {
            on: (eventName, callback, options) => this.on(prefixEvent(eventName), callback, options),
            once: (eventName, callback) => this.once(prefixEvent(eventName), callback),
            off: (eventName, listenerIdOrCallback) => this.off(prefixEvent(eventName), listenerIdOrCallback),
            emit: (eventName, ...args) => this.emit(prefixEvent(eventName), ...args),
            waitFor: (eventName, timeout) => this.waitFor(prefixEvent(eventName), timeout)
        };
    }
}

// Global event bus instance
export const globalEventBus = new EventEmitter();
