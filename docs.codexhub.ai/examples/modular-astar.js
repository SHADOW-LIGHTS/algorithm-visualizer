// Base Algorithm class for all pathfinding algorithms
class Algorithm {
  constructor(nodes, boardArray) {
    this.nodes = nodes;
    this.boardArray = boardArray;
    this.nodesToAnimate = [];
  }
  
  execute(start, target) {
    throw new Error("Method 'execute' must be implemented by subclass");
  }
  
  // Common methods shared by multiple algorithms
  getNeighbors(id) {
    let coordinates = id.split("-");
    let x = parseInt(coordinates[0]);
    let y = parseInt(coordinates[1]);
    let neighbors = [];
    
    // Check all four directions (up, right, down, left)
    const directions = [
      [-1, 0], // up
      [0, 1],  // right
      [1, 0],  // down
      [0, -1]  // left
    ];
    
    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;
      
      if (this.boardArray[newX] && this.boardArray[newX][newY]) {
        const neighborId = `${newX}-${newY}`;
        if (this.nodes[neighborId].status !== "wall") {
          neighbors.push(neighborId);
        }
      }
    }
    
    return neighbors;
  }
  
  // Common utility for Manhattan distance heuristic
  calculateManhattanDistance(nodeId1, nodeId2) {
    const coordinates1 = nodeId1.split("-").map(num => parseInt(num));
    const coordinates2 = nodeId2.split("-").map(num => parseInt(num));
    
    return Math.abs(coordinates1[0] - coordinates2[0]) + 
           Math.abs(coordinates1[1] - coordinates2[1]);
  }
}

// AStar algorithm implementation
class AStar extends Algorithm {
  constructor(nodes, boardArray) {
    super(nodes, boardArray);
  }
  
  execute(start, target) {
    if (!start || !target || start === target) {
      return false;
    }
    
    // Initialize start node
    this.nodes[start].distance = 0;
    this.nodes[start].totalDistance = 0;
    this.nodes[start].direction = "up";
    
    let unvisitedNodes = Object.keys(this.nodes);
    
    while (unvisitedNodes.length) {
      // Find the node with the lowest totalDistance
      let currentNode = this.findClosestNode(unvisitedNodes);
      
      // Skip walls
      while (currentNode.status === "wall" && unvisitedNodes.length) {
        currentNode = this.findClosestNode(unvisitedNodes);
      }
      
      // If we can't find any non-wall node, no path exists
      if (currentNode.distance === Infinity) return false;
      
      // Add to animation queue and mark as visited
      this.nodesToAnimate.push(currentNode);
      currentNode.status = "visited";
      
      // Check if we reached the target
      if (currentNode.id === target) {
        return "success!";
      }
      
      // Update all neighboring nodes
      this.updateNeighbors(currentNode, target, start);
    }
  }
  
  findClosestNode(unvisitedNodes) {
    let currentClosest, index;
    
    for (let i = 0; i < unvisitedNodes.length; i++) {
      const nodeId = unvisitedNodes[i];
      const node = this.nodes[nodeId];
      
      // If no current closest or this node has lower totalDistance
      if (!currentClosest || currentClosest.totalDistance > node.totalDistance) {
        currentClosest = node;
        index = i;
      } 
      // If totalDistance is equal, choose the one with lower heuristic
      else if (currentClosest.totalDistance === node.totalDistance) {
        if (currentClosest.heuristicDistance > node.heuristicDistance) {
          currentClosest = node;
          index = i;
        }
      }
    }
    
    // Remove the node from unvisited list
    unvisitedNodes.splice(index, 1);
    return currentClosest;
  }
  
  updateNeighbors(node, target, start) {
    const neighbors = this.getNeighbors(node.id);
    
    for (const neighborId of neighbors) {
      this.updateNode(
        node, 
        this.nodes[neighborId], 
        this.nodes[target], 
        this.nodes[start]
      );
    }
  }
  
  updateNode(currentNode, targetNode, actualTargetNode, startNode) {
    // Calculate the appropriate distance between nodes
    const distance = this.getDistance(currentNode, targetNode);
    
    // Calculate heuristic if not already done
    if (!targetNode.heuristicDistance) {
      targetNode.heuristicDistance = this.calculateManhattanDistance(
        targetNode.id, 
        actualTargetNode.id
      );
    }
    
    // Calculate new potential distance
    const distanceToCompare = currentNode.distance + targetNode.weight + distance[0];
    
    // If new path is better, update the node
    if (distanceToCompare < targetNode.distance) {
      targetNode.distance = distanceToCompare;
      targetNode.totalDistance = targetNode.distance + targetNode.heuristicDistance;
      targetNode.previousNode = currentNode.id;
      targetNode.path = distance[1];
      targetNode.direction = distance[2];
    }
  }
  
  getDistance(nodeOne, nodeTwo) {
    // This is a simplified version - in a real implementation,
    // you would include the full logic for calculating distances based on direction
    
    const currentCoordinates = nodeOne.id.split("-");
    const targetCoordinates = nodeTwo.id.split("-");
    const x1 = parseInt(currentCoordinates[0]);
    const y1 = parseInt(currentCoordinates[1]);
    const x2 = parseInt(targetCoordinates[0]);
    const y2 = parseInt(targetCoordinates[1]);
    
    // Determine the direction and appropriate cost
    if (x2 < x1 && y1 === y2) {
      // Going up
      const cost = nodeOne.direction === "up" ? 1 : 2;
      return [cost, ["f"], "up"];
    } else if (x2 > x1 && y1 === y2) {
      // Going down
      const cost = nodeOne.direction === "down" ? 1 : 2;
      return [cost, ["f"], "down"];
    } else if (y2 < y1 && x1 === x2) {
      // Going left
      const cost = nodeOne.direction === "left" ? 1 : 2;
      return [cost, ["f"], "left"];
    } else if (y2 > y1 && x1 === x2) {
      // Going right
      const cost = nodeOne.direction === "right" ? 1 : 2;
      return [cost, ["f"], "right"];
    }
    
    // Default return - should not reach here in a grid-based implementation
    return [1, ["f"], nodeOne.direction];
  }
}

// Example usage
function visualizeAStar(grid, startId, targetId) {
  const { nodes, boardArray } = grid;
  const astar = new AStar(nodes, boardArray);
  const result = astar.execute(startId, targetId);
  
  if (result === "success!") {
    console.log("Path found!");
    return astar.nodesToAnimate;
  } else {
    console.log("No path found!");
    return [];
  }
}

// Export for use in other modules
export { Algorithm, AStar, visualizeAStar };