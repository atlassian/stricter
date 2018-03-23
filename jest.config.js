module.exports = {
    "transform": {
        "^.+\\.tsx?$": "<rootDir>/node_modules/ts-jest/preprocessor.js"
    },
    "testRegex": "(\\.|/)test\\.ts$",
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json"
    ],
    "testEnvironment": "node",
    "collectCoverage": true,
    "collectCoverageFrom" : ["src/**/*.ts", "!src/types/**", "!src/*.ts", "!src/**/test.ts"],
};
