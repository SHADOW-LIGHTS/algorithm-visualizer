const Node = require("../public/browser/node");

describe("Node Class", () => {
  // Setup
  let testNode;
  
  beforeEach(() => {
    testNode = new Node("1-1", "unvisited");
  });
  
  // Test cases
  test("should initialize with correct id and status", () => {
    // Arrange (done in beforeEach)
    
    // Act & Assert
    expect(testNode.id).toBe("1-1");
    expect(testNode.status).toBe("unvisited");
  });
  
  test("should initialize with default values", () => {
    // Arrange (done in beforeEach)
    
    // Act & Assert
    expect(testNode.previousNode).toBeNull();
    expect(testNode.path).toBeNull();
    expect(testNode.direction).toBeNull();
    expect(testNode.storedDirection).toBeNull();
    expect(testNode.distance).toBe(Infinity);
    expect(testNode.totalDistance).toBe(Infinity);
    expect(testNode.heuristicDistance).toBeNull();
    expect(testNode.weight).toBe(0);
    expect(testNode.relatesToObject).toBe(false);
    expect(testNode.overwriteObjectRelation).toBe(false);
  });
  
  test("should initialize with the correct 'other' properties", () => {
    // Arrange (done in beforeEach)
    
    // Act & Assert
    expect(testNode.otherid).toBe("1-1");
    expect(testNode.otherstatus).toBe("unvisited");
    expect(testNode.otherpreviousNode).toBeNull();
    expect(testNode.otherpath).toBeNull();
    expect(testNode.otherdirection).toBeNull();
    expect(testNode.otherstoredDirection).toBeNull();
    expect(testNode.otherdistance).toBe(Infinity);
    expect(testNode.otherweight).toBe(0);
    expect(testNode.otherrelatesToObject).toBe(false);
    expect(testNode.otheroverwriteObjectRelation).toBe(false);
  });
  
  test("should be able to update properties", () => {
    // Arrange
    const updatedNode = testNode;
    
    // Act
    updatedNode.status = "visited";
    updatedNode.previousNode = "0-1";
    updatedNode.distance = 5;
    updatedNode.weight = 10;
    
    // Assert
    expect(updatedNode.status).toBe("visited");
    expect(updatedNode.previousNode).toBe("0-1");
    expect(updatedNode.distance).toBe(5);
    expect(updatedNode.weight).toBe(10);
  });

  test("should create different instances with different properties", () => {
    // Arrange
    const node1 = new Node("1-1", "unvisited");
    const node2 = new Node("2-2", "wall");
    
    // Act
    node1.distance = 5;
    
    // Assert
    expect(node1.id).toBe("1-1");
    expect(node2.id).toBe("2-2");
    expect(node1.status).toBe("unvisited");
    expect(node2.status).toBe("wall");
    expect(node1.distance).toBe(5);
    expect(node2.distance).toBe(Infinity); // Should still be default
  });
});