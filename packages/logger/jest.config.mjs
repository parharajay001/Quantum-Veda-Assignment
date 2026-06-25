/** @type {import('jest').Config} */
export default {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.ts$": ["@swc/jest"],
  },
  // NodeNext source uses explicit ".js" extensions on relative imports; map
  // them back to the ".ts" sources so Jest can resolve them.
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
