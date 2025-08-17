const recursiveDivisionMaze = require("../public/browser/mazeAlgorithms/recursiveDivisionMaze");

describe("Maze Generation Algorithms", () => {
  describe("Recursive Division Maze Algorithm", () => {
    // Test that the module exports a function
    test("should export a function", () => {
      expect(typeof recursiveDivisionMaze).toBe("function");
    });
  });
});