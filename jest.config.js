module.exports = {
    testRunner: 'jest-circus/runner',
    testEnvironment: 'node',
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.ts', '!src/types/**'],
};
