/**
 * Utility functions for pathfinding algorithms
 * This module contains shared functions used across different algorithm implementations.
 */

/**
 * Calculates the Manhattan distance between two points
 * @param {Object} nodeA - First node with id property (format: "x-y")
 * @param {Object} nodeB - Second node with id property (format: "x-y")
 * @returns {number} - Manhattan distance value
 */
function calculateManhattanDistance(nodeA, nodeB) {
  const [x1, y1] = nodeA.id.split('-').map(Number);
  const [x2, y2] = nodeB.id.split('-').map(Number);
  
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

/**
 * Calculates the Euclidean distance between two points
 * @param {Object} nodeA - First node with id property (format: "x-y")
 * @param {Object} nodeB - Second node with id property (format: "x-y")
 * @returns {number} - Euclidean distance value
 */
function calculateEuclideanDistance(nodeA, nodeB) {
  const [x1, y1] = nodeA.id.split('-').map(Number);
  const [x2, y2] = nodeB.id.split('-').map(Number);
  
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

/**
 * Gets valid neighbors of a node in a grid
 * @param {string} nodeId - ID of the node
 * @param {Object} nodes - Dictionary of all nodes
 * @param {Array} boardArray - 2D grid representation
 * @param {boolean} allowDiagonal - Whether diagonal movement is allowed
 * @returns {Array} - Array of neighbor node IDs
 */
function getNeighbors(nodeId, nodes, boardArray, allowDiagonal = false) {
  const coordinates = nodeId.split('-');
  const x = parseInt(coordinates[0]);
  const y = parseInt(coordinates[1]);
  const neighbors = [];
  
  // Define directions (cardinal)
  const directions = [
    [-1, 0],  // Up
    [1, 0],   // Down
    [0, -1],  // Left
    [0, 1]    // Right
  ];
  
  // Add diagonal directions if allowed
  if (allowDiagonal) {
    directions.push(
      [-1, -1],  // Up-left
      [-1, 1],   // Up-right
      [1, -1],   // Down-left
      [1, 1]     // Down-right
    );
  }
  
  // Check each direction
  for (const [dx, dy] of directions) {
    const newX = x + dx;
    const newY = y + dy;
    
    // Check if neighbor is within board boundaries
    if (boardArray[newX] && boardArray[newX][newY]) {
      const neighborId = `${newX}-${newY}`;
      
      // If diagonal movement, ensure path isn't blocked by walls
      if (Math.abs(dx) === 1 && Math.abs(dy) === 1) {
        const adjacentX = `${x}-${newY}`;
        const adjacentY = `${newX}-${y}`;
        
        // Only allow diagonal if not blocked by walls
        if (nodes[adjacentX].status !== "wall" || nodes[adjacentY].status !== "wall") {
          if (nodes[neighborId].status !== "wall") {
            neighbors.push(neighborId);
          }
        }
      } else {
        // For cardinal directions, just check if not a wall
        if (nodes[neighborId].status !== "wall") {
          neighbors.push(neighborId);
        }
      }
    }
  }
  
  return neighbors;
}

/**
 * Reconstructs the shortest path from start to target
 * @param {Object} nodes - Dictionary of all nodes
 * @param {string} targetId - ID of target node
 * @returns {Array} - Array of nodes in the path, from start to target
 */
function getShortestPath(nodes, targetId) {
  const path = [];
  let currentNodeId = targetId;
  
  // Trace back from target to start
  while (currentNodeId !== null) {
    path.unshift(nodes[currentNodeId]); // Add to beginning of array
    currentNodeId = nodes[currentNodeId].previousNode;
  }
  
  return path;
}

/**
 * Creates a 2D grid representation from a list of nodes
 * @param {Object} nodes - Dictionary of all nodes
 * @param {number} width - Width of the grid
 * @param {number} height - Height of the grid
 * @returns {Array} - 2D array representation of the grid
 */
function createBoardArray(nodes, width, height) {
  const boardArray = [];
  
  // Initialize 2D array
  for (let i = 0; i < height; i++) {
    boardArray[i] = [];
    for (let j = 0; j < width; j++) {
      boardArray[i][j] = nodes[`${i}-${j}`];
    }
  }
  
  return boardArray;
}

/**
 * Calculates the appropriate distance between nodes based on direction
 * @param {Object} nodeOne - Current node
 * @param {Object} nodeTwo - Target node
 * @returns {Array} - [cost, path, direction]
 */
function calculateNodeDistance(nodeOne, nodeTwo) {
  const currentCoordinates = nodeOne.id.split('-').map(Number);
  const targetCoordinates = nodeTwo.id.split('-').map(Number);
  
  const x1 = currentCoordinates[0];
  const y1 = currentCoordinates[1];
  const x2 = targetCoordinates[0];
  const y2 = targetCoordinates[1];
  
  // Determine movement direction and cost based on current direction
  // This is a simplified version
  if (x2 < x1 && y1 === y2) {
    // Moving up
    const turnCost = nodeOne.direction === "up" ? 0 : 1;
    return [1 + turnCost, ["f"], "up"];
  } else if (x2 > x1 && y1 === y2) {
    // Moving down
    const turnCost = nodeOne.direction === "down" ? 0 : 1;
    return [1 + turnCost, ["f"], "down"];
  } else if (y2 < y1 && x1 === x2) {
    // Moving left
    const turnCost = nodeOne.direction === "left" ? 0 : 1;
    return [1 + turnCost, ["f"], "left"];
  } else if (y2 > y1 && x1 === x2) {
    // Moving right
    const turnCost = nodeOne.direction === "right" ? 0 : 1;
    return [1 + turnCost, ["f"], "right"];
  }
  
  // Default return - shouldn't reach here in a grid-based implementation
  return [1, ["f"], nodeOne.direction];
}

// Export all utilities for use in other modules
module.exports = {
  calculateManhattanDistance,
  calculateEuclideanDistance,
  getNeighbors,
  getShortestPath,
  createBoardArray,
  calculateNodeDistance
};