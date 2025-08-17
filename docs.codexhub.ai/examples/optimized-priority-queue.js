/**
 * Binary Heap based PriorityQueue implementation for pathfinding algorithms
 * This is much more efficient than the array+sort approach for repeated operations
 */
class PriorityQueue {
  /**
   * Initialize an empty priority queue
   * @param {Function} compareFunction - Custom compare function (defaults to min-heap)
   */
  constructor(compareFunction = (a, b) => a.priority - b.priority) {
    this.values = [];
    this.compare = compareFunction;
  }
  
  /**
   * Add an element to the queue with a priority
   * @param {any} element - Element to add
   * @param {number} priority - Priority value (lower = higher priority by default)
   * @return {PriorityQueue} - Returns this for chaining
   */
  enqueue(element, priority) {
    const item = { element, priority };
    this.values.push(item);
    this._bubbleUp();
    return this;
  }
  
  /**
   * Remove and return the highest priority element
   * @return {any} The highest priority element
   */
  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    
    // Swap first and last element
    const max = this.values[0];
    const end = this.values.pop();
    
    // Re-establish heap property if there are elements left
    if (this.values.length > 0) {
      this.values[0] = end;
      this._sinkDown();
    }
    
    return max.element;
  }
  
  /**
   * Look at the highest priority element without removing it
   * @return {any} The highest priority element
   */
  peek() {
    return this.isEmpty() ? null : this.values[0].element;
  }
  
  /**
   * Check if the queue is empty
   * @return {boolean} True if empty, false otherwise
   */
  isEmpty() {
    return this.values.length === 0;
  }
  
  /**
   * Get the size of the queue
   * @return {number} The number of elements in the queue
   */
  size() {
    return this.values.length;
  }
  
  /**
   * Move a newly added element up to its correct position
   * @private
   */
  _bubbleUp() {
    let idx = this.values.length - 1;
    const element = this.values[idx];
    
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      const parent = this.values[parentIdx];
      
      // If we've reached the correct spot, break
      if (this.compare(element, parent) >= 0) break;
      
      // Otherwise, swap and continue
      this.values[parentIdx] = element;
      this.values[idx] = parent;
      idx = parentIdx;
    }
  }
  
  /**
   * Move an element down to its correct position
   * @private
   */
  _sinkDown() {
    let idx = 0;
    const length = this.values.length;
    const element = this.values[0];
    
    while (true) {
      const leftChildIdx = 2 * idx + 1;
      const rightChildIdx = 2 * idx + 2;
      let leftChild, rightChild;
      let swap = null;
      
      // Check if left child exists and should be swapped
      if (leftChildIdx < length) {
        leftChild = this.values[leftChildIdx];
        if (this.compare(leftChild, element) < 0) {
          swap = leftChildIdx;
        }
      }
      
      // Check if right child exists and should be swapped
      if (rightChildIdx < length) {
        rightChild = this.values[rightChildIdx];
        if (
          (swap === null && this.compare(rightChild, element) < 0) || 
          (swap !== null && this.compare(rightChild, leftChild) < 0)
        ) {
          swap = rightChildIdx;
        }
      }
      
      // If no swaps needed, we're done
      if (swap === null) break;
      
      // Otherwise, swap and continue
      this.values[idx] = this.values[swap];
      this.values[swap] = element;
      idx = swap;
    }
  }
}

/**
 * Optimized A* algorithm using priority queue
 * @param {Object} nodes - All nodes in the grid
 * @param {string} start - ID of the starting node
 * @param {string} target - ID of the target node
 * @param {Array} nodesToAnimate - Array to store animation sequence
 * @param {Array} boardArray - 2D representation of the grid
 * @returns {string|boolean} "success!" if path found, false otherwise
 */
function optimizedAStar(nodes, start, target, nodesToAnimate, boardArray) {
  if (!start || !target || start === target) {
    return false;
  }
  
  // Initialize start node
  nodes[start].distance = 0;
  nodes[start].totalDistance = 0;
  nodes[start].direction = "up";
  
  // Create a priority queue sorted by totalDistance
  const unvisitedQueue = new PriorityQueue((a, b) => {
    // First compare by totalDistance
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    // If totalDistance is equal, use heuristic as tiebreaker
    return nodes[a.element].heuristicDistance - nodes[b.element].heuristicDistance;
  });
  
  // Enqueue the start node
  unvisitedQueue.enqueue(start, 0);
  
  // Keep track of visited nodes to avoid re-processing
  const visited = new Set();
  
  // Process nodes until queue is empty
  while (!unvisitedQueue.isEmpty()) {
    // Get the node with lowest totalDistance
    const currentId = unvisitedQueue.dequeue();
    const currentNode = nodes[currentId];
    
    // Skip if already visited
    if (visited.has(currentId)) continue;
    
    // Skip walls
    if (currentNode.status === "wall") continue;
    
    // Mark as visited
    visited.add(currentId);
    nodesToAnimate.push(currentNode);
    currentNode.status = "visited";
    
    // Check if we've reached the target
    if (currentId === target) {
      return "success!";
    }
    
    // Get neighbors
    const neighbors = getNeighbors(currentId, nodes, boardArray);
    
    // Process each neighbor
    for (const neighborId of neighbors) {
      const neighbor = nodes[neighborId];
      
      // Skip visited nodes and walls
      if (visited.has(neighborId) || neighbor.status === "wall") continue;
      
      // Calculate Manhattan distance if not already done
      if (!neighbor.heuristicDistance) {
        neighbor.heuristicDistance = manhattanDistance(neighbor, nodes[target]);
      }
      
      // Calculate new distance to this neighbor
      const distance = getDistance(currentNode, neighbor);
      const newDistance = currentNode.distance + neighbor.weight + distance[0];
      
      // Update neighbor if this path is better
      if (newDistance < neighbor.distance) {
        neighbor.distance = newDistance;
        neighbor.totalDistance = newDistance + neighbor.heuristicDistance;
        neighbor.previousNode = currentId;
        neighbor.path = distance[1];
        neighbor.direction = distance[2];
        
        // Add to queue with new priority
        unvisitedQueue.enqueue(neighborId, neighbor.totalDistance);
      }
    }
  }
  
  // No path found
  return false;
}

/**
 * Calculate Manhattan distance between two nodes
 * @param {Object} nodeOne - First node
 * @param {Object} nodeTwo - Second node
 * @returns {number} The Manhattan distance
 */
function manhattanDistance(nodeOne, nodeTwo) {
  const [x1, y1] = nodeOne.id.split("-").map(coord => parseInt(coord));
  const [x2, y2] = nodeTwo.id.split("-").map(coord => parseInt(coord));
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

/**
 * Get valid neighbors for a node
 * @param {string} id - Node ID
 * @param {Object} nodes - All nodes
 * @param {Array} boardArray - 2D grid
 * @returns {Array} Array of neighbor node IDs
 */
function getNeighbors(id, nodes, boardArray) {
  const [x, y] = id.split("-").map(coord => parseInt(coord));
  const neighbors = [];
  
  // Check in all four cardinal directions
  const directions = [
    [-1, 0],  // Up
    [1, 0],   // Down
    [0, -1],  // Left
    [0, 1]    // Right
  ];
  
  for (const [dx, dy] of directions) {
    const newX = x + dx;
    const newY = y + dy;
    
    // Check if in bounds
    if (boardArray[newX] && boardArray[newX][newY]) {
      const neighborId = `${newX}-${newY}`;
      // Only add non-wall neighbors
      if (nodes[neighborId].status !== "wall") {
        neighbors.push(neighborId);
      }
    }
  }
  
  return neighbors;
}

/**
 * Calculate distance between nodes
 * @param {Object} nodeOne - Source node
 * @param {Object} nodeTwo - Target node
 * @returns {Array} [cost, path, direction]
 */
function getDistance(nodeOne, nodeTwo) {
  // Simplified implementation
  const [x1, y1] = nodeOne.id.split("-").map(coord => parseInt(coord));
  const [x2, y2] = nodeTwo.id.split("-").map(coord => parseInt(coord));
  
  // Determine direction
  if (x2 < x1) return [1, ["f"], "up"];
  if (x2 > x1) return [1, ["f"], "down"];
  if (y2 < y1) return [1, ["f"], "left"];
  if (y2 > y1) return [1, ["f"], "right"];
  
  return [1, ["f"], nodeOne.direction];
}

// Export for use in other modules
export { PriorityQueue, optimizedAStar };