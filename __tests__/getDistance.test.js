const getDistance = require("../public/browser/getDistance");
const Node = require("../public/browser/node");

describe("getDistance Function", () => {
  // Test cases for moving up (x2 < x1)
  describe("when target is above current node", () => {
    test("should return correct values when current direction is up", () => {
      // Arrange
      const nodeOne = new Node("2-1", "unvisited");
      nodeOne.direction = "up";
      const nodeTwo = new Node("1-1", "unvisited");
      
      // Act
      const result = getDistance(nodeOne, nodeTwo);
      
      // Assert
      expect(result[0]).toBe(1); // distance value
      expect(result[1]).toEqual(["f"]); // path instructions
      expect(result[2]).toBe("up"); // new direction
    });
    
    test("should return correct values when current direction is right", () => {
      // Arrange
      const nodeOne = new Node("2-1", "unvisited");
      nodeOne.direction = "right";
      const nodeTwo = new Node("1-1", "unvisited");
      
      // Act
      const result = getDistance(nodeOne, nodeTwo);
      
      // Assert
      expect(result[0]).toBe(2);
      expect(result[1]).toEqual(["l", "f"]);
      expect(result[2]).toBe("up");
    });
    
    test("should return correct values when current direction is left", () => {
      // Arrange
      const nodeOne = new Node("2-1", "unvisited");
      nodeOne.direction = "left";
      const nodeTwo = new Node("1-1", "unvisited");
      
      // Act
      const result = getDistance(nodeOne, nodeTwo);
      
      // Assert
      expect(result[0]).toBe(2);
      expect(result[1]).toEqual(["r", "f"]);
      expect(result[2]).toBe("up");
    });
    
    test("should return correct values when current direction is down", () => {
      // Arrange
      const nodeOne = new Node("2-1", "unvisited");
      nodeOne.direction = "down";
      const nodeTwo = new Node("1-1", "unvisited");
      
      // Act
      const result = getDistance(nodeOne, nodeTwo);
      
      // Assert
      expect(result[0]).toBe(3);
      expect(result[1]).toEqual(["r", "r", "f"]);
      expect(result[2]).toBe("up");
    });
  });
  
  // Test cases for moving down (x2 > x1)
  describe("when target is below current node", () => {
    test("should return correct values when current direction is up", () => {
      // Arrange
      const nodeOne = new Node("1-1", "unvisited");
      nodeOne.direction = "up";
      const nodeTwo = new Node("2-1", "unvisited");
      
      // Act
      const result = getDistance(nodeOne, nodeTwo);
      
      // Assert
      expect(result[0]).toBe(3);
      expect(result[1]).toEqual(["r", "r", "f"]);
      expect(result[2]).toBe("down");
    });
    
    // Add tests for other directions similar to the above...
  });
  
  // Test cases for moving left (y2 < y1)
  describe("when target is to the left of current node", () => {
    test("should return correct values when current direction is up", () => {
      // Arrange
      const nodeOne = new Node("1-2", "unvisited");
      nodeOne.direction = "up";
      const nodeTwo = new Node("1-1", "unvisited");
      
      // Act
      const result = getDistance(nodeOne, nodeTwo);
      
      // Assert
      expect(result[0]).toBe(2);
      expect(result[1]).toEqual(["l", "f"]);
      expect(result[2]).toBe("left");
    });
    
    // Add tests for other directions similar to the above...
  });
  
  // Test cases for moving right (y2 > y1)
  describe("when target is to the right of current node", () => {
    test("should return correct values when current direction is up", () => {
      // Arrange
      const nodeOne = new Node("1-1", "unvisited");
      nodeOne.direction = "up";
      const nodeTwo = new Node("1-2", "unvisited");
      
      // Act
      const result = getDistance(nodeOne, nodeTwo);
      
      // Assert
      expect(result[0]).toBe(2);
      expect(result[1]).toEqual(["r", "f"]);
      expect(result[2]).toBe("right");
    });
    
    test("should return correct values when current direction is right", () => {
      // Arrange
      const nodeOne = new Node("1-1", "unvisited");
      nodeOne.direction = "right";
      const nodeTwo = new Node("1-2", "unvisited");
      
      // Act
      const result = getDistance(nodeOne, nodeTwo);
      
      // Assert
      expect(result[0]).toBe(1);
      expect(result[1]).toEqual(["f"]);
      expect(result[2]).toBe("right");
    });
    
    // Add tests for other directions similar to the above...
  });
});