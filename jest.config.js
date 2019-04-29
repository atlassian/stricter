module.exports = {
    testEnvironment: 'node',
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.ts', '!src/types/**'],
    testPathIgnorePatterns: ['<rootDir>/src/__tests__/__fixtures__'],
};
