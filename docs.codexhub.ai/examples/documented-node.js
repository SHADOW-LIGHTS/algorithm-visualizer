/**
 * @file Fully documented Node class for pathfinding visualizations
 * @author CodeMentor
 * @version 1.0.0
 * @description
 * This file provides a comprehensive implementation of a Node class for use
 * in pathfinding algorithms. Each node represents a cell in the grid and
 * contains all the necessary properties and methods for algorithm operations.
 */

/**
 * Represents a node (cell) in the pathfinding grid
 * @class
 */
class Node {
  /**
   * Create a new Node instance
   * @param {string} id - Unique identifier in the format "row-column" (e.g., "5-10")
   * @param {string} status - Initial status of the node ("unvisited", "wall", "start", "target", etc.)
   */
  constructor(id, status) {
    /**
     * Unique identifier for the node
     * @type {string}
     */
    this.id = id;

    /**
     * Current status of the node
     * @type {string}
     */
    this.status = status;

    /**
     * Reference to the previous node in the path (used for path reconstruction)
     * @type {string|null}
     */
    this.previousNode = null;

    /**
     * Path information for visualization (e.g., ["f", "r", "f"])
     * @type {Array|null}
     */
    this.path = null;

    /**
     * Current direction the path is moving at this node
     * @type {string|null}
     */
    this.direction = null;

    /**
     * Stored direction for algorithms that need to remember previous directions
     * @type {string|null}
     */
    this.storedDirection = null;

    /**
     * Distance from the start node (g-score in A*)
     * @type {number}
     */
    this.distance = Infinity;

    /**
     * Total distance (f-score in A*): distance from start + heuristic to target
     * @type {number}
     */
    this.totalDistance = Infinity;

    /**
     * Heuristic distance to target node (h-score in A*)
     * @type {number|null}
     */
    this.heuristicDistance = null;

    /**
     * Weight of the node (for weighted algorithms)
     * @type {number}
     */
    this.weight = 0;

    /**
     * Whether this node relates to a special object (like a bomb)
     * @type {boolean}
     */
    this.relatesToObject = false;

    /**
     * Flag to determine if object relation should be overwritten
     * @type {boolean}
     */
    this.overwriteObjectRelation = false;

    // Properties for bidirectional algorithms
    /**
     * Properties used for bidirectional search algorithms
     * These are equivalent to the main properties but used for the reverse search
     * @type {Object}
     */
    this.bidirectional = {
      /**
       * Previous node in the reverse search
       * @type {string|null}
       */
      previousNode: null,
      
      /**
       * Path information for reverse search
       * @type {Array|null}
       */
      path: null,
      
      /**
       * Direction for reverse search
       * @type {string|null}
       */
      direction: null,
      
      /**
       * Stored direction for reverse search
       * @type {string|null}
       */
      storedDirection: null,
      
      /**
       * Distance from target in reverse search
       * @type {number}
       */
      distance: Infinity,
      
      /**
       * Weight in reverse search
       * @type {number}
       */
      weight: 0,
      
      /**
       * Object relation in reverse search
       * @type {boolean}
       */
      relatesToObject: false,
      
      /**
       * Flag for overwriting object relation in reverse search
       * @type {boolean}
       */
      overwriteObjectRelation: false
    };
  }

  /**
   * Check if this node is a wall
   * @returns {boolean} True if the node is a wall, false otherwise
   */
  isWall() {
    return this.status === "wall";
  }

  /**
   * Check if this node has been visited
   * @returns {boolean} True if the node has been visited, false otherwise
   */
  isVisited() {
    return this.status === "visited";
  }

  /**
   * Check if this node is the start node
   * @returns {boolean} True if the node is the start node, false otherwise
   */
  isStart() {
    return this.status === "start";
  }

  /**
   * Check if this node is the target node
   * @returns {boolean} True if the node is the target node, false otherwise
   */
  isTarget() {
    return this.status === "target";
  }

  /**
   * Mark this node as visited
   * @returns {Node} The node instance for method chaining
   */
  markAsVisited() {
    if (!this.isStart() && !this.isTarget()) {
      this.status = "visited";
    }
    return this;
  }

  /**
   * Mark this node as part of the shortest path
   * @returns {Node} The node instance for method chaining
   */
  markAsShortestPath() {
    if (!this.isStart() && !this.isTarget()) {
      this.status = "shortest-path";
    }
    return this;
  }

  /**
   * Mark this node as a wall
   * @returns {Node} The node instance for method chaining
   */
  markAsWall() {
    if (!this.isStart() && !this.isTarget()) {
      this.status = "wall";
    }
    return this;
  }

  /**
   * Reset the node to its initial state
   * @param {boolean} [keepWalls=false] - If true, walls will not be reset
   * @param {boolean} [keepWeights=false] - If true, weights will not be reset
   * @returns {Node} The node instance for method chaining
   */
  reset(keepWalls = false, keepWeights = false) {
    // Don't reset if this is a wall and keepWalls is true
    if (keepWalls && this.isWall()) {
      return this;
    }

    // Reset to unvisited unless this is a start or target node
    if (!this.isStart() && !this.isTarget()) {
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

    // Reset object relation
    this.relatesToObject = false;
    this.overwriteObjectRelation = false;

    // Reset bidirectional properties
    this.bidirectional = {
      previousNode: null,
      path: null,
      direction: null,
      storedDirection: null,
      distance: Infinity,
      weight: keepWeights ? this.weight : 0,
      relatesToObject: false,
      overwriteObjectRelation: false
    };

    return this;
  }

  /**
   * Set the weight of this node
   * @param {number} weight - The new weight value
   * @returns {Node} The node instance for method chaining
   */
  setWeight(weight) {
    this.weight = weight;
    this.bidirectional.weight = weight;
    return this;
  }

  /**
   * Update the node's status
   * @param {string} status - The new status
   * @returns {Node} The node instance for method chaining
   */
  setStatus(status) {
    this.status = status;
    return this;
  }

  /**
   * Get the node's row and column coordinates
   * @returns {number[]} Array containing [row, column]
   */
  getCoordinates() {
    return this.id.split("-").map(coord => parseInt(coord));
  }

  /**
   * Calculate the Manhattan distance to another node
   * @param {Node} otherNode - The other node
   * @returns {number} The Manhattan distance
   */
  manhattanDistanceTo(otherNode) {
    const [row1, col1] = this.getCoordinates();
    const [row2, col2] = otherNode.getCoordinates();
    return Math.abs(row1 - row2) + Math.abs(col1 - col2);
  }

  /**
   * Calculate the Euclidean distance to another node
   * @param {Node} otherNode - The other node
   * @returns {number} The Euclidean distance
   */
  euclideanDistanceTo(otherNode) {
    const [row1, col1] = this.getCoordinates();
    const [row2, col2] = otherNode.getCoordinates();
    return Math.sqrt(Math.pow(row1 - row2, 2) + Math.pow(col1 - col2, 2));
  }

  /**
   * Update the node with information from a better path
   * @param {number} distance - New distance from start
   * @param {string} previousNodeId - ID of the previous node in the path
   * @param {Array} path - Path information
   * @param {string} direction - Direction of travel
   * @returns {Node} The node instance for method chaining
   */
  updateWithBetterPath(distance, previousNodeId, path, direction) {
    this.distance = distance;
    this.previousNode = previousNodeId;
    this.path = path;
    this.direction = direction;
    return this;
  }
}

/**
 * Example usage:
 * 
 * ```javascript
 * // Create a start node
 * const startNode = new Node("5-5", "start");
 * 
 * // Create a target node
 * const targetNode = new Node("10-10", "target");
 * 
 * // Create a regular node and make it a wall
 * const wallNode = new Node("7-7", "unvisited").markAsWall();
 * 
 * // Calculate distance between nodes
 * const distance = startNode.manhattanDistanceTo(targetNode);
 * console.log(`Distance between start and target: ${distance}`);
 * ```
 */

// Export the Node class for use in other modules
export default Node;