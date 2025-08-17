/**
 * A* pathfinding algorithm implementation with improved code quality
 * This version demonstrates best practices in code organization, documentation,
 * error handling, and consistent style.
 */

// Import utilities (in a real project, these would be imported from a utils file)
const { calculateManhattanDistance } = require('./pathfinding-utils');

/**
 * Executes the A* pathfinding algorithm
 * @param {Object} nodes - Dictionary of all nodes in the grid
 * @param {string} start - ID of the start node
 * @param {string} target - ID of the target node
 * @param {Array} nodesToAnimate - Array to populate with nodes in visited order
 * @param {Array} boardArray - 2D array representation of the grid
 * @param {string} name - Name of algorithm variant
 * @param {Function} heuristic - Heuristic function to use (defaults to Manhattan)
 * @returns {string|boolean} "success!" if path found, false otherwise
 */
function astar(nodes, start, target, nodesToAnimate, boardArray, name, heuristic = manhattanDistance) {
  // Input validation
  if (!validateInputs(nodes, start, target, nodesToAnimate, boardArray)) {
    return false;
  }
  
  // Initialize algorithm
  initializeStartNode(nodes, start);
  
  // Process nodes until we find the target or exhaust all options
  let unvisitedNodes = Object.keys(nodes);
  
  while (unvisitedNodes.length > 0) {
    // Get the closest node
    let currentNode = findClosestNode(nodes, unvisitedNodes);
    
    // Skip walls
    if (currentNode.status === "wall") {
      continue;
    }
    
    // Check for impossible path
    if (currentNode.distance === Infinity) {
      return false;
    }
    
    // Add to animation sequence and mark as visited
    nodesToAnimate.push(currentNode);
    currentNode.status = "visited";
    
    // Check if we've reached the target
    if (currentNode.id === target) {
      return "success!";
    }
    
    // Update all neighboring nodes
    updateNeighbors(nodes, currentNode, boardArray, target, name, start, heuristic);
  }
  
  // If we get here, there's no path
  return false;
}

/**
 * Validates input parameters for the algorithm
 * @param {Object} nodes - Dictionary of all nodes
 * @param {string} start - ID of start node
 * @param {string} target - ID of target node
 * @param {Array} nodesToAnimate - Animation sequence array
 * @param {Array} boardArray - 2D grid representation
 * @returns {boolean} True if valid, false otherwise
 */
function validateInputs(nodes, start, target, nodesToAnimate, boardArray) {
  if (!nodes || !start || !target || !nodesToAnimate || !boardArray) {
    console.error("Missing required parameters for A* algorithm");
    return false;
  }
  
  if (!nodes[start] || !nodes[target]) {
    console.error("Start or target node doesn't exist");
    return false;
  }
  
  if (start === target) {
    console.warn("Start and target are the same node");
    return false;
  }
  
  return true;
}

/**
 * Initializes the start node with distance 0 and direction
 * @param {Object} nodes - Dictionary of all nodes
 * @param {string} start - ID of start node
 */
function initializeStartNode(nodes, start) {
  nodes[start].distance = 0;
  nodes[start].totalDistance = 0;
  nodes[start].direction = "up"; // Default direction
}

/**
 * Finds the unvisited node with the lowest totalDistance
 * @param {Object} nodes - Dictionary of all nodes
 * @param {Array} unvisitedNodes - Array of unvisited node IDs
 * @returns {Object} The closest unvisited node
 */
function findClosestNode(nodes, unvisitedNodes) {
  let closestNode = null;
  let closestIndex = 0;
  
  for (let i = 0; i < unvisitedNodes.length; i++) {
    const nodeId = unvisitedNodes[i];
    const node = nodes[nodeId];
    
    // Skip wall nodes
    if (node.status === "wall") {
      continue;
    }
    
    // First node or node with lower totalDistance
    if (!closestNode || closestNode.totalDistance > node.totalDistance) {
      closestNode = node;
      closestIndex = i;
    } 
    // If equal totalDistance, prefer lower heuristic
    else if (closestNode.totalDistance === node.totalDistance &&
             closestNode.heuristicDistance > node.heuristicDistance) {
      closestNode = node;
      closestIndex = i;
    }
  }
  
  // Remove the chosen node from unvisited list
  unvisitedNodes.splice(closestIndex, 1);
  return closestNode;
}

/**
 * Updates all neighbors of a given node
 * @param {Object} nodes - Dictionary of all nodes
 * @param {Object} currentNode - The current node being processed
 * @param {Array} boardArray - 2D grid representation
 * @param {string} targetId - ID of the target node
 * @param {string} name - Algorithm variant name
 * @param {string} startId - ID of the start node
 * @param {Function} heuristicFn - Heuristic function to use
 */
function updateNeighbors(nodes, currentNode, boardArray, targetId, name, startId, heuristicFn) {
  const neighbors = getNeighbors(currentNode.id, nodes, boardArray);
  
  for (const neighborId of neighbors) {
    updateSingleNeighbor(
      nodes,
      currentNode,
      nodes[neighborId],
      nodes[targetId],
      name,
      nodes[startId],
      heuristicFn
    );
  }
}

/**
 * Gets valid neighbors of a node
 * @param {string} nodeId - ID of the node
 * @param {Object} nodes - Dictionary of all nodes
 * @param {Array} boardArray - 2D grid representation
 * @returns {Array} Array of neighbor node IDs
 */
function getNeighbors(nodeId, nodes, boardArray) {
  const [x, y] = nodeId.split("-").map(coord => parseInt(coord));
  const neighbors = [];
  
  // Check in all four cardinal directions
  const directions = [
    [-1, 0], // Up
    [1, 0],  // Down
    [0, -1], // Left
    [0, 1]   // Right
  ];
  
  for (const [dx, dy] of directions) {
    const newX = x + dx;
    const newY = y + dy;
    
    // Check if the neighbor is within bounds
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
 * Updates a single neighbor node
 * @param {Object} nodes - Dictionary of all nodes
 * @param {Object} currentNode - Current node being processed
 * @param {Object} neighborNode - Neighbor node to update
 * @param {Object} targetNode - The target node
 * @param {string} algorithmName - Name of algorithm variant
 * @param {Object} startNode - The starting node
 * @param {Function} heuristicFn - Heuristic function to use
 */
function updateSingleNeighbor(nodes, currentNode, neighborNode, targetNode, algorithmName, startNode, heuristicFn) {
  // Calculate movement cost
  const distance = calculateNodeDistance(currentNode, neighborNode);
  
  // Calculate heuristic if not already calculated
  if (!neighborNode.heuristicDistance) {
    neighborNode.heuristicDistance = heuristicFn(neighborNode, targetNode);
  }
  
  // Calculate new potential distance
  const distanceToCompare = currentNode.distance + neighborNode.weight + distance[0];
  
  // If the new path is better, update the node
  if (distanceToCompare < neighborNode.distance) {
    updateNodeWithNewPath(neighborNode, distanceToCompare, currentNode.id, distance);
  }
}

/**
 * Calculate Manhattan distance between two nodes
 * @param {Object} nodeOne - First node
 * @param {Object} nodeTwo - Second node
 * @returns {number} Manhattan distance
 */
function manhattanDistance(nodeOne, nodeTwo) {
  const [x1, y1] = nodeOne.id.split("-").map(coord => parseInt(coord));
  const [x2, y2] = nodeTwo.id.split("-").map(coord => parseInt(coord));
  
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

/**
 * Calculates distance cost between nodes based on direction
 * @param {Object} nodeOne - Source node
 * @param {Object} nodeTwo - Target node
 * @returns {Array} [cost, path, direction]
 */
function calculateNodeDistance(nodeOne, nodeTwo) {
  const [x1, y1] = nodeOne.id.split("-").map(coord => parseInt(coord));
  const [x2, y2] = nodeTwo.id.split("-").map(coord => parseInt(coord));
  
  // Determine direction of movement
  if (x2 < x1) {
    return [1, ["f"], "up"]; // Simplified version
  } else if (x2 > x1) {
    return [1, ["f"], "down"]; // Simplified version
  } else if (y2 < y1) {
    return [1, ["f"], "left"]; // Simplified version
  } else if (y2 > y1) {
    return [1, ["f"], "right"]; // Simplified version
  }
  
  // Default (should not reach here in a grid)
  return [1, ["f"], nodeOne.direction];
}

/**
 * Updates a node with a new, better path
 * @param {Object} node - The node to update
 * @param {number} newDistance - New distance value
 * @param {string} previousNodeId - ID of the previous node
 * @param {Array} distanceData - [cost, path, direction]
 */
function updateNodeWithNewPath(node, newDistance, previousNodeId, distanceData) {
  node.distance = newDistance;
  node.totalDistance = node.distance + node.heuristicDistance;
  node.previousNode = previousNodeId;
  node.path = distanceData[1];
  node.direction = distanceData[2];
}

// Export for use in other modules
module.exports = {
  astar,
  manhattanDistance
};