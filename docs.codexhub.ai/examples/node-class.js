/**
 * Node class representing a cell in the pathfinding grid
 * 
 * This class encapsulates all node-related functionality with proper
 * methods and a cleaner OOP approach compared to the original implementation.
 */
class Node {
  /**
   * Create a new Node
   * @param {string} id - The node's identifier (e.g., "5-10" for row 5, col 10)
   * @param {string} status - The node's initial status ("unvisited", "wall", etc.)
   */
  constructor(id, status = "unvisited") {
    // Basic properties
    this.id = id;
    this.status = status;
    this.previousNode = null;
    this.path = null;
    
    // Direction-related properties (for algorithms that use directions)
    this.direction = null;
    this.storedDirection = null;
    
    // Distance properties (for weighted algorithms)
    this.distance = Infinity;
    this.totalDistance = Infinity;
    this.heuristicDistance = null;
    this.weight = 0;
    
    // Object relation properties (for special algorithms)
    this.relatesToObject = false;
    this.overwriteObjectRelation = false;
    
    // Bidirectional algorithm properties - simplified with proper naming
    this.reverseData = {
      previousNode: null,
      path: null,
      direction: null,
      storedDirection: null,
      distance: Infinity,
      weight: 0,
      relatesToObject: false,
      overwriteObjectRelation: false
    };
  }
  
  /**
   * Reset the node to its initial state
   * @param {boolean} keepWalls - Whether to maintain wall status
   * @param {boolean} keepWeights - Whether to maintain weight values
   */
  reset(keepWalls = false, keepWeights = false) {
    // Keep walls if specified
    if (keepWalls && this.status === "wall") {
      // Do nothing - keep the wall
    } else {
      this.status = "unvisited";
    }
    
    // Reset pathfinding properties
    this.previousNode = null;
    this.path = null;
    this.direction = null;
    this.storedDirection = null;
    this.distance = Infinity;
    this.totalDistance = Infinity;
    this.heuristicDistance = null;
    
    // Reset weight if not keeping weights
    if (!keepWeights) {
      this.weight = 0;
    }
    
    // Reset object relations
    this.relatesToObject = false;
    this.overwriteObjectRelation = false;
    
    // Reset bidirectional data
    this.reverseData = {
      previousNode: null,
      path: null,
      direction: null,
      storedDirection: null,
      distance: Infinity,
      weight: this.weight, // Maintain weight consistency
      relatesToObject: false,
      overwriteObjectRelation: false
    };
  }
  
  /**
   * Mark the node with a specific status
   * @param {string} status - The new status
   */
  setStatus(status) {
    this.status = status;
    return this; // Enable method chaining
  }
  
  /**
   * Mark the node as a wall
   */
  markAsWall() {
    this.status = "wall";
    return this;
  }
  
  /**
   * Mark the node as visited
   */
  markAsVisited() {
    this.status = "visited";
    return this;
  }
  
  /**
   * Mark the node as part of the shortest path
   */
  markAsShortestPath() {
    this.status = "shortest-path";
    return this;
  }
  
  /**
   * Check if the node is a wall
   * @return {boolean}
   */
  isWall() {
    return this.status === "wall";
  }
  
  /**
   * Check if the node is visited
   * @return {boolean}
   */
  isVisited() {
    return this.status === "visited";
  }
  
  /**
   * Check if the node is unvisited
   * @return {boolean}
   */
  isUnvisited() {
    return this.status === "unvisited";
  }
  
  /**
   * Set the weight of the node
   * @param {number} weight - The weight value
   */
  setWeight(weight) {
    this.weight = weight;
    this.reverseData.weight = weight; // Keep consistent
    return this;
  }
  
  /**
   * Get the coordinates of the node as [row, column]
   * @return {number[]} Array with [row, column]
   */
  getCoordinates() {
    return this.id.split("-").map(coord => parseInt(coord));
  }
  
  /**
   * Calculate Manhattan distance to another node
   * @param {Node} otherNode - The target node
   * @return {number} The Manhattan distance
   */
  manhattanDistanceTo(otherNode) {
    const [row1, col1] = this.getCoordinates();
    const [row2, col2] = otherNode.getCoordinates();
    return Math.abs(row1 - row2) + Math.abs(col1 - col2);
  }
}

// Export the class for use in other modules
export default Node;