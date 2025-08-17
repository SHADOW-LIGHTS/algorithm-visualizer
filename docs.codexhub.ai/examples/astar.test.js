/**
 * Unit tests for A* algorithm implementation
 * Shows how to effectively test pathfinding algorithms using Jest
 */

// Import the algorithm and test utilities
import { astar } from '../pathfindingAlgorithms/astar.js';
import { createTestGrid, createWallGrid, verifyPath } from './test-utils.js';

describe('A* Algorithm', () => {
  // Test basic pathfinding capabilities
  describe('Basic pathfinding', () => {
    test('should find path when start and target are adjacent', () => {
      const { nodes, boardArray } = createTestGrid(5, 5);
      const start = '0-0';
      const target = '0-1';
      const nodesToAnimate = [];
      
      const result = astar(nodes, start, target, nodesToAnimate, boardArray);
      
      expect(result).toBe('success!');
      expect(nodes[target].previousNode).toBe(start);
      
      // Verify the path is just the start and target
      const path = verifyPath(nodes, start, target);
      expect(path).toEqual([start, target]);
    });
    
    test('should find the shortest path in an open grid', () => {
      const { nodes, boardArray } = createTestGrid(10, 10);
      const start = '1-1';
      const target = '8-8';
      const nodesToAnimate = [];
      
      const result = astar(nodes, start, target, nodesToAnimate, boardArray);
      
      expect(result).toBe('success!');
      
      // Verify the path follows a diagonal (shortest path)
      const path = verifyPath(nodes, start, target);
      expect(path.length).toBe(8); // Should be a diagonal path
    });
    
    test('should handle when start and target are the same', () => {
      const { nodes, boardArray } = createTestGrid(5, 5);
      const start = '2-2';
      const target = '2-2';
      const nodesToAnimate = [];
      
      const result = astar(nodes, start, target, nodesToAnimate, boardArray);
      
      expect(result).toBe(false); // By convention, returns false when start=target
    });
  });
  
  // Test behavior with walls and obstacles
  describe('Walls and obstacles', () => {
    test('should navigate around a simple wall', () => {
      const { nodes, boardArray } = createTestGrid(5, 5);
      const start = '0-0';
      const target = '4-0';
      const nodesToAnimate = [];
      
      // Create a vertical wall
      nodes['2-0'].status = 'wall';
      nodes['2-1'].status = 'wall';
      nodes['2-2'].status = 'wall';
      
      const result = astar(nodes, start, target, nodesToAnimate, boardArray);
      
      expect(result).toBe('success!');
      
      // Verify the path goes around the wall
      const path = verifyPath(nodes, start, target);
      expect(path.length).toBeGreaterThan(5); // Longer than straight line
    });
    
    test('should return false when no path exists', () => {
      const { nodes, boardArray } = createTestGrid(5, 5);
      const start = '0-0';
      const target = '4-4';
      const nodesToAnimate = [];
      
      // Create a wall that completely blocks the path
      for (let i = 0; i < 5; i++) {
        nodes[`2-${i}`].status = 'wall';
        nodes[`${i}-2`].status = 'wall';
      }
      
      const result = astar(nodes, start, target, nodesToAnimate, boardArray);
      
      expect(result).toBe(false);
    });
    
    test('should find path through a maze', () => {
      // Create a grid with a maze-like pattern
      const { nodes, boardArray } = createTestGrid(7, 7);
      const start = '0-0';
      const target = '6-6';
      const nodesToAnimate = [];
      
      // Create horizontal walls with gaps
      for (let i = 1; i < 6; i += 2) {
        for (let j = 0; j < 7; j++) {
          if (j !== i) nodes[`${i}-${j}`].status = 'wall';
        }
      }
      
      const result = astar(nodes, start, target, nodesToAnimate, boardArray);
      
      expect(result).toBe('success!');
      
      // Verify a path exists
      const path = verifyPath(nodes, start, target);
      expect(path.length).toBeGreaterThan(0);
    });
  });
  
  // Test weighted nodes
  describe('Weighted nodes', () => {
    test('should prefer unweighted path when weights are present', () => {
      const { nodes, boardArray } = createTestGrid(5, 5);
      const start = '0-0';
      const target = '4-4';
      const nodesToAnimate = [];
      
      // Add weights to the diagonal path
      nodes['1-1'].weight = 5;
      nodes['2-2'].weight = 5;
      nodes['3-3'].weight = 5;
      
      const result = astar(nodes, start, target, nodesToAnimate, boardArray);
      
      expect(result).toBe('success!');
      
      // Verify the path avoids the weighted nodes
      const path = verifyPath(nodes, start, target);
      expect(path.includes('1-1')).toBe(false);
      expect(path.includes('2-2')).toBe(false);
      expect(path.includes('3-3')).toBe(false);
    });
    
    test('should find path through weighted nodes when no alternative', () => {
      const { nodes, boardArray } = createTestGrid(3, 3);
      const start = '0-0';
      const target = '2-2';
      const nodesToAnimate = [];
      
      // Add walls to force path through weighted node
      nodes['0-1'].status = 'wall';
      nodes['1-0'].status = 'wall';
      
      // Add weight to the only possible path
      nodes['1-1'].weight = 10;
      
      const result = astar(nodes, start, target, nodesToAnimate, boardArray);
      
      expect(result).toBe('success!');
      
      // Verify path goes through weighted node
      const path = verifyPath(nodes, start, target);
      expect(path.includes('1-1')).toBe(true);
    });
  });
  
  // Test animation sequence
  describe('Animation frames', () => {
    test('should generate correct animation sequence', () => {
      const { nodes, boardArray } = createTestGrid(3, 3);
      const start = '0-0';
      const target = '2-2';
      const nodesToAnimate = [];
      
      astar(nodes, start, target, nodesToAnimate, boardArray);
      
      // Verify animation sequence includes visited nodes
      expect(nodesToAnimate.length).toBeGreaterThan(0);
      
      // First node should be adjacent to start
      const firstAnimatedId = nodesToAnimate[0].id;
      expect(['0-1', '1-0', '1-1'].includes(firstAnimatedId)).toBe(true);
      
      // Last node should be the target
      expect(nodesToAnimate[nodesToAnimate.length - 1].id).toBe(target);
    });
  });
  
  // Test performance
  describe('Performance', () => {
    test('should handle large grids efficiently', () => {
      const { nodes, boardArray } = createTestGrid(50, 50);
      const start = '0-0';
      const target = '49-49';
      const nodesToAnimate = [];
      
      const startTime = performance.now();
      const result = astar(nodes, start, target, nodesToAnimate, boardArray);
      const endTime = performance.now();
      
      expect(result).toBe('success!');
      
      const executionTime = endTime - startTime;
      console.log(`A* execution time for 50x50 grid: ${executionTime}ms`);
      
      // Should execute in reasonable time (adjust threshold as needed)
      expect(executionTime).toBeLessThan(1000);
    });
  });
});

// Mock implementation of test utilities
function createTestGrid(rows, cols) {
  const nodes = {};
  const boardArray = [];
  
  for (let i = 0; i < rows; i++) {
    boardArray[i] = [];
    for (let j = 0; j < cols; j++) {
      const id = `${i}-${j}`;
      boardArray[i][j] = id;
      nodes[id] = {
        id,
        status: 'unvisited',
        previousNode: null,
        path: null,
        direction: null,
        storedDirection: null,
        distance: Infinity,
        totalDistance: Infinity,
        heuristicDistance: null,
        weight: 0,
        relatesToObject: false,
        overwriteObjectRelation: false,
      };
    }
  }
  
  return { nodes, boardArray };
}

function verifyPath(nodes, start, target) {
  const path = [];
  let currentNodeId = target;
  
  // Reconstruct the path from target back to start
  while (currentNodeId !== null && currentNodeId !== start) {
    path.unshift(currentNodeId);
    currentNodeId = nodes[currentNodeId].previousNode;
    
    // Detect cycles (shouldn't happen in correct implementation)
    if (path.includes(currentNodeId)) {
      throw new Error('Cycle detected in path');
    }
    
    // Prevent infinite loops
    if (path.length > 1000) {
      throw new Error('Path reconstruction exceeded maximum length');
    }
  }
  
  // Add the start node
  if (currentNodeId === start) {
    path.unshift(start);
  }
  
  return path;
}