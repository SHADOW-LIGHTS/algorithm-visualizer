/**
 * Optimized DOM Manipulation for Pathfinding Visualizer
 * This module demonstrates performance improvements for grid rendering and animations
 */

/**
 * Creates a grid efficiently using DocumentFragment
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @param {Function} cellClickHandler - Function to handle cell clicks
 * @returns {HTMLElement} The created grid element
 */
function createOptimizedGrid(rows, cols, cellClickHandler) {
  const gridElement = document.createElement('table');
  gridElement.id = 'board';
  
  // Use DocumentFragment for batch DOM manipulation
  const fragment = document.createDocumentFragment();
  
  // Pre-create cell class lookup for common cell states
  const cellClasses = {
    'unvisited': 'unvisited',
    'wall': 'wall',
    'visited': 'visited',
    'shortest-path': 'shortest-path',
    'start': 'start',
    'target': 'target'
  };
  
  // Build the table structure
  for (let row = 0; row < rows; row++) {
    const tableRow = document.createElement('tr');
    tableRow.id = `row-${row}`;
    
    for (let col = 0; col < cols; col++) {
      const tableCell = document.createElement('td');
      tableCell.id = `${row}-${col}`;
      tableCell.className = cellClasses.unvisited;
      
      // Use event delegation instead of individual event listeners
      tableCell.dataset.row = row;
      tableCell.dataset.col = col;
      
      tableRow.appendChild(tableCell);
    }
    
    fragment.appendChild(tableRow);
  }
  
  // Single DOM operation to append all cells
  gridElement.appendChild(fragment);
  
  // Add a single event listener with event delegation
  gridElement.addEventListener('click', (event) => {
    const cell = event.target.closest('td');
    if (cell) {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      cellClickHandler(row, col);
    }
  });
  
  // For mouseover/drag events, also use delegation
  let isMouseDown = false;
  document.addEventListener('mousedown', () => { isMouseDown = true; });
  document.addEventListener('mouseup', () => { isMouseDown = false; });
  
  gridElement.addEventListener('mouseover', (event) => {
    if (isMouseDown) {
      const cell = event.target.closest('td');
      if (cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        cellClickHandler(row, col, 'drag');
      }
    }
  });
  
  return gridElement;
}

/**
 * Efficiently update cell status using CSS classes
 * @param {string} cellId - ID of the cell to update
 * @param {string} status - New status/class to apply
 */
function updateCellStatus(cellId, status) {
  const cellElement = document.getElementById(cellId);
  if (!cellElement) return;
  
  // Remove all status classes
  cellElement.classList.remove(
    'unvisited',
    'wall',
    'visited',
    'shortest-path',
    'start',
    'target',
    'weight'
  );
  
  // Add new status class
  cellElement.classList.add(status);
}

/**
 * Batch update multiple cells at once
 * @param {Array} updates - Array of {id, status} objects
 */
function batchUpdateCells(updates) {
  // Group updates by operation to minimize layout thrashing
  requestAnimationFrame(() => {
    for (const { id, status } of updates) {
      updateCellStatus(id, status);
    }
  });
}

/**
 * Optimized animation using requestAnimationFrame and batching
 * @param {Array} nodesToAnimate - Nodes to animate in sequence
 * @param {number} speed - Animation speed (lower = faster)
 * @param {Function} onComplete - Callback when animation completes
 */
function animatePathOptimized(nodesToAnimate, speed, onComplete) {
  if (!nodesToAnimate.length) {
    if (onComplete) onComplete();
    return;
  }
  
  const batchSize = Math.max(1, Math.floor(nodesToAnimate.length / 100));
  let currentIndex = 0;
  const startTime = performance.now();
  
  // Use a time-based approach for smoother animation
  function processFrame(timestamp) {
    // Determine how many nodes to process in this frame
    const elapsed = timestamp - startTime;
    const targetIndex = Math.min(
      nodesToAnimate.length,
      Math.floor((elapsed / speed) * batchSize)
    );
    
    // Process nodes that need to be animated in this frame
    if (currentIndex < targetIndex) {
      const updates = [];
      
      for (let i = currentIndex; i < targetIndex; i++) {
        const node = nodesToAnimate[i];
        updates.push({ id: node.id, status: node.status });
      }
      
      batchUpdateCells(updates);
      currentIndex = targetIndex;
    }
    
    // Continue animation if not done
    if (currentIndex < nodesToAnimate.length) {
      requestAnimationFrame(processFrame);
    } else {
      if (onComplete) onComplete();
    }
  }
  
  // Start the animation loop
  requestAnimationFrame(processFrame);
}

/**
 * Create node objects efficiently without extra properties until needed
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @returns {Object} Map of node objects by ID
 */
function createOptimizedNodes(rows, cols) {
  const nodes = {};
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const id = `${row}-${col}`;
      
      // Use a lightweight initial node representation
      nodes[id] = {
        id,
        status: 'unvisited',
        // Only initialize common properties, others added when needed
        weight: 0
      };
    }
  }
  
  return nodes;
}

/**
 * Lazy initialization of pathfinding properties
 * @param {Object} node - Node to initialize for pathfinding
 */
function initializeNodeForPathfinding(node) {
  if (node.initialized) return;
  
  node.distance = Infinity;
  node.totalDistance = Infinity;
  node.previousNode = null;
  node.heuristicDistance = null;
  node.direction = null;
  node.initialized = true;
}

/**
 * Efficiently reset grid for a new pathfinding operation
 * @param {Object} nodes - All nodes
 * @param {boolean} keepWalls - Whether to preserve walls
 * @param {boolean} keepWeights - Whether to preserve weights
 */
function resetGrid(nodes, keepWalls = false, keepWeights = false) {
  // Use object iteration instead of array methods
  for (const id in nodes) {
    const node = nodes[id];
    
    // Preserve walls if needed
    if (keepWalls && node.status === 'wall') {
      continue;
    }
    
    // Reset status
    node.status = 'unvisited';
    
    // Reset pathfinding properties
    node.distance = Infinity;
    node.totalDistance = Infinity;
    node.previousNode = null;
    node.heuristicDistance = null;
    node.direction = null;
    
    // Reset weight if not keeping
    if (!keepWeights) {
      node.weight = 0;
    }
    
    // Update DOM
    updateCellStatus(id, 'unvisited');
  }
}

// Export the optimized functions
export {
  createOptimizedGrid,
  updateCellStatus,
  batchUpdateCells,
  animatePathOptimized,
  createOptimizedNodes,
  initializeNodeForPathfinding,
  resetGrid
};