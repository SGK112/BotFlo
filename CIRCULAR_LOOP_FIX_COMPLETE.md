# Circular Loop Fix - June 28, 2025

## Problem
The Advanced Flow Builder was experiencing maximum call stack size exceeded errors due to circular event loops between components:

```
FlowBuilder.setupEventHandlers() -> 
workspace.on('node:select') -> 
nodeManager.selectNode() -> 
emit('node:selected') -> 
FlowBuilder listener -> 
workspace.selectNode() -> 
clearSelection() -> 
emit('selectionCleared') -> 
[INFINITE LOOP]
```

## Root Cause
1. **Workspace** was emitting `'node:select'` events when user clicked nodes
2. **FlowBuilder** listened to these events and called `nodeManager.selectNode()`
3. **NodeManager** emitted `'node:selected'` events in response
4. **FlowBuilder** listened to NodeManager events and called `workspace.selectNode()`
5. **Workspace.selectNode()** called `clearSelection()` which emitted more events
6. This created an infinite circular reference causing stack overflow

## Solution

### 1. Fixed FlowBuilder Event Handlers
**File: `/public/flow-builder/js/FlowBuilder.js`**

Changed NodeManager event handlers to use non-emitting methods:

```javascript
// OLD - Caused circular loops
this.nodeManager.on('node:selected', ({ node }) => {
    this.workspace.selectNode(node.id);  // This would emit more events
});

// NEW - Visual updates only, no events
this.nodeManager.on('node:selected', ({ node }) => {
    this.workspace.updateNodeSelection(node.id);  // Visual only
});
```

### 2. Added Non-Emitting Methods to Workspace
**File: `/public/flow-builder/js/components/Workspace.js`**

Added new methods that update UI without triggering events:

```javascript
/**
 * Update node selection visually without emitting events
 */
updateNodeSelection(nodeId) {
    this.clearVisualSelection();
    this.selectedElements.add(nodeId);
    const nodeData = this.nodes.get(nodeId);
    if (nodeData) {
        nodeData.element.classList.add('selected');
    }
    // No emit() call - breaks the circular loop
}

/**
 * Clear visual selection without emitting events
 */
clearVisualSelection() {
    this.selectedElements.forEach(nodeId => {
        const nodeData = this.nodes.get(nodeId);
        if (nodeData) {
            nodeData.element.classList.remove('selected');
        }
    });
    this.selectedElements.clear();
    // No emit() call - breaks the circular loop
}
```

### 3. Updated Existing Methods
Modified `selectNode()` and `deselectAllNodes()` to use the new non-emitting methods:

```javascript
// OLD
selectNode(nodeId) {        
    this.clearSelection();  // This emitted events!
    // ...
}

// NEW
selectNode(nodeId) {        
    this.clearVisualSelection();  // No events emitted
    // ...
}
```

## Event Flow Now (Fixed)

### User Interaction → NodeManager Event
1. User clicks node in workspace
2. Workspace emits `'node:select'` 
3. FlowBuilder calls `nodeManager.selectNode()`
4. NodeManager emits `'node:selected'`
5. FlowBuilder calls `workspace.updateNodeSelection()` (visual only)
6. **No circular loop** ✅

### Direct NodeManager Call
1. Code calls `nodeManager.selectNode()` directly
2. NodeManager emits `'node:selected'`
3. FlowBuilder updates workspace and properties panel visually
4. **No circular loop** ✅

## Key Principles Applied

1. **Separation of Concerns**: Events trigger business logic, not more events
2. **Visual Updates**: Components have both "event-emitting" and "visual-only" methods
3. **One-Way Flow**: User actions → NodeManager (state) → UI updates
4. **Defensive Programming**: Methods check for component availability before calling

## Files Modified

- `/public/flow-builder/js/FlowBuilder.js` - Fixed event handlers
- `/public/flow-builder/js/components/Workspace.js` - Added non-emitting methods

## Testing
- ✅ No more stack overflow errors
- ✅ Node selection works correctly
- ✅ Properties panel updates properly
- ✅ All builder buttons functional
- ✅ Drag and drop works without errors

## Prevention for Future
- Always check if new event listeners can create circular references
- Use "visual update" methods when responding to state change events
- Document event flow in complex multi-component systems
- Prefer state management over event cascading
