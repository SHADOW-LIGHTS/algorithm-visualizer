/**
 * Modern ES6+ implementation of A* algorithm for pathfinding
 * Demonstrates modern JavaScript features including:
 * - ES6 Classes
 * - Arrow Functions
 * - Destructuring
 * - Default Parameters
 * - Template Literals
 * - Enhanced Object Literals
 * - Map/Set data structures
 */

/**
 * A* pathfinding algorithm implementation using modern JavaScript
 */
export class AStar {
  /**
   * Create a new AStar algorithm instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    // Use default parameters and object spread for options
    this.options = {
      allowDiagonal: false,
      heuristicFunction: 'manhattan',
      weight: 1,
      ...options
    };
    
    this.nodesToAnimate = [];
  }
  
  /**
   * Execute the algorithm to find a path
   * @param {Object} nodes - Map of all nodes in the grid
   * @param {string} startId - ID of the start node
   * @param {string} targetId - ID of the target node
   * @param {Array} boardArray - 2D array representation of the grid
   * @returns {boolean|string} Result of the pathfinding attempt
   */
  execute(nodes, startId, targetId, boardArray) {
    // Input validation with early return
    if (!startId || !targetId || startId === targetId) {
      return false;
    }
    
    // Clear animation frames from previous runs
    this.nodesToAnimate = [];
    
    // Initialize the start node using object spread for clarity
    nodes[startId] = {
      ...nodes[startId],
      distance: 0,
      totalDistance: 0,
      direction: 'up'
    };
    
    // Use Set for visited nodes (more appropriate than array/object)
    const visited = new Set();
    
    // Use Map for unvisited nodes (better than plain object for this use case)
    // Maps node ID to its totalDistance for efficient priority management
    const unvisitedMap = new Map();
    unvisitedMap.set(startId, 0); // Add start node
    
    // Main algorithm loop
    while (unvisitedMap.size > 0) {
      // Find the unvisited node with lowest totalDistance
      // Using destructuring and spread operator with Map entries
      const currentId = this.#findNodeWithLowestDistance(unvisitedMap);
      unvisitedMap.delete(currentId); // Remove from unvisited
      
      const currentNode = nodes[currentId];
      
      // Skip walls and already visited nodes
      if (currentNode.status === 'wall' || visited.has(currentId)) {
        continue;
      }
      
      // If no path is possible
      if (currentNode.distance === Infinity) {
        return false;
      }
      
      // Add to animation sequence and mark as visited
      this.nodesToAnimate.push(currentNode);
      currentNode.status = 'visited';
      visited.add(currentId);
      
      // Check if we've reached the target
      if (currentId === targetId) {
        return 'success!';
      }
      
      // Process all neighbors
      this.#updateNeighbors({
        currentId,
        nodes,
        boardArray,
        targetId,
        unvisitedMap,
        visited
      });
    }
    
    // No path found
    return false;
  }
  
  /**
   * Find the node with the lowest total distance in the unvisited map
   * @param {Map} unvisitedMap - Map of unvisited nodes (id -> totalDistance)
   * @returns {string} ID of the node with lowest distance
   * @private
   */
  #findNodeWithLowestDistance(unvisitedMap) {
    // Use array destructuring with Map entries and reduce
    return [...unvisitedMap.entries()]
      .reduce((lowest, [nodeId, distance]) => 
        distance < unvisitedMap.get(lowest) ? nodeId : lowest, 
        [...unvisitedMap.keys()][0]
      );
  }
  
  /**
   * Update all neighbors of the current node
   * @param {Object} params - Parameters object
   * @private
   */
  #updateNeighbors({currentId, nodes, boardArray, targetId, unvisitedMap, visited}) {
    // Use destructuring in function parameters
    const currentNode = nodes[currentId];
    const neighbors = this.#getNeighbors(currentId, nodes, boardArray);
    
    // Use forEach with arrow function for concise iteration
    neighbors.forEach(neighborId => {
      // Skip already visited
      if (visited.has(neighborId)) return;
      
      const neighborNode = nodes[neighborId];
      
      // Calculate new potential distance
      // Use destructuring for cleaner code
      const [distance, path, direction] = this.#getDistance(currentNode, neighborNode);
      const distanceToCompare = currentNode.distance + neighborNode.weight + distance;
      
      // Update neighbor if we found a better path
      if (distanceToCompare < neighborNode.distance) {
        // Use object spread to update node
        nodes[neighborId] = {
          ...neighborNode,
          distance: distanceToCompare,
          previousNode: currentId,
          path,
          direction
        };
        
        // Calculate heuristic if needed
        if (neighborNode.heuristicDistance === undefined) {
          nodes[neighborId].heuristicDistance = 
            this.#calculateHeuristic(neighborNode, nodes[targetId]);
        }
        
        // Update total distance and add to unvisited map
        nodes[neighborId].totalDistance = 
          nodes[neighborId].distance + nodes[neighborId].heuristicDistance;
        
        unvisitedMap.set(neighborId, nodes[neighborId].totalDistance);
      }
    });
  }
  
  /**
   * Get valid neighbors for a node
   * @param {string} nodeId - ID of the node
   * @param {Object} nodes - All nodes in the grid
   * @param {Array} boardArray - 2D grid representation
   * @returns {Array} Array of neighbor node IDs
   * @private
   */
  #getNeighbors(nodeId, nodes, boardArray) {
    // Use array destructuring and template literals
    const [x, y] = nodeId.split('-').map(Number);
    const neighbors = [];
    
    // Define directions - use array of arrays for clarity
    const directions = [
      [-1, 0],  // Up
      [1, 0],   // Down
      [0, -1],  // Left
      [0, 1]    // Right
    ];
    
    // Add diagonals if allowed
    if (this.options.allowDiagonal) {
      directions.push(
        [-1, -1],  // Up-left
        [-1, 1],   // Up-right
        [1, -1],   // Down-left
        [1, 1]     // Down-right
      );
    }
    
    // Use for-of loop with array destructuring for cleaner iteration
    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;
      
      // Check bounds and skip out-of-bounds
      if (!boardArray[newX] || !boardArray[newX][newY]) {
        continue;
      }
      
      // Use template literals for string creation
      const neighborId = `${newX}-${newY}`;
      
      // Skip walls
      if (nodes[neighborId].status === 'wall') {
        continue;
      }
      
      // Check for diagonal wall blocking
      if (Math.abs(dx) === 1 && Math.abs(dy) === 1) {
        // Use template literals for diagonal neighbors
        const horizontalNeighbor = `${x}-${newY}`;
        const verticalNeighbor = `${newX}-${y}`;
        
        // Skip if both adjacent cells are walls (can't squeeze through)
        if (nodes[horizontalNeighbor].status === 'wall' && 
            nodes[verticalNeighbor].status === 'wall') {
          continue;
        }
      }
      
      neighbors.push(neighborId);
    }
    
    return neighbors;
  }
  
  /**
   * Calculate distance between two nodes
   * @param {Object} nodeA - Source node
   * @param {Object} nodeB - Target node
   * @returns {Array} [distance, path, direction]
   * @private
   */
  #getDistance(nodeA, nodeB) {
    // Use array destructuring
    const [x1, y1] = nodeA.id.split('-').map(Number);
    const [x2, y2] = nodeB.id.split('-').map(Number);
    
    // Simplified implementation using ternary operators
    if (x1 === x2) {
      return y2 > y1 ? [1, ['f'], 'right'] : [1, ['f'], 'left'];
    } else {
      return x2 > x1 ? [1, ['f'], 'down'] : [1, ['f'], 'up'];
    }
  }
  
  /**
   * Calculate heuristic distance
   * @param {Object} node - Current node
   * @param {Object} targetNode - Goal node
   * @returns {number} Heuristic value
   * @private
   */
  #calculateHeuristic(node, targetNode) {
    // Use destructuring to get coordinates
    const [x1, y1] = node.id.split('-').map(Number);
    const [x2, y2] = targetNode.id.split('-').map(Number);
    
    // Use switch with different heuristic options
    switch (this.options.heuristicFunction) {
      case 'manhattan':
        return this.options.weight * (Math.abs(x1 - x2) + Math.abs(y1 - y2));
      
      case 'euclidean':
        return this.options.weight * 
          Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
      
      case 'chebyshev':
        return this.options.weight * 
          Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
      
      default:
        return this.options.weight * (Math.abs(x1 - x2) + Math.abs(y1 - y2));
    }
  }
  
  /**
   * Get the sequence of nodes to animate
   * @returns {Array} Nodes in animation sequence
   */
  getAnimationFrames() {
    return this.nodesToAnimate;
  }
  
  /**
   * Get the shortest path from start to target
   * @param {Object} nodes - All nodes in the grid
   * @param {string} targetId - ID of the target node
   * @returns {Array} Nodes in the shortest path
   */
  getShortestPath(nodes, targetId) {
    const path = [];
    let currentNodeId = targetId;
    
    // Trace back from target to start
    while (currentNodeId) {
      // Add to beginning of path
      path.unshift(nodes[currentNodeId]);
      currentNodeId = nodes[currentNodeId].previousNode;
    }
    
    return path;
  }
}

/**
 * Example usage of the modern A* implementation
 */
const runAStarExample = async () => {
  // Create nodes and board
  const nodes = {};
  const boardArray = Array(50).fill().map(() => Array(50).fill(null));
  
  // Initialize nodes
  for (let row = 0; row < 50; row++) {
    for (let col = 0; col < 50; col++) {
      const id = `${row}-${col}`;
      nodes[id] = {
        id,
        status: 'unvisited',
        distance: Infinity,
        totalDistance: Infinity,
        weight: 0,
        previousNode: null
      };
      boardArray[row][col] = id;
    }
  }
  
  // Create A* instance with options
  const astar = new AStar({
    allowDiagonal: true,
    heuristicFunction: 'manhattan',
    weight: 1.2
  });
  
  // Run algorithm
  const startTime = performance.now();
  const result = astar.execute(nodes, '10-10', '40-40', boardArray);
  const endTime = performance.now();
  
  console.log(`A* execution time: ${endTime - startTime}ms`);
  console.log(`Result: ${result}`);
  
  if (result === 'success!') {
    const path = astar.getShortestPath(nodes, '40-40');
    console.log(`Path length: ${path.length}`);
  }
  
  // Get animation frames
  const frames = astar.getAnimationFrames();
  console.log(`Nodes visited: ${frames.length}`);
};

// Export the class for use in other modules
export default AStar;