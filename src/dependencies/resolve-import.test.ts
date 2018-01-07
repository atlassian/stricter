import { default as resolveImport } from './resolve-import';

jest.mock('path');
jest.mock('fs');

describe('resolveImport', () => {
    const mockExistsExpectedResult = (expectedResult: string) => {
        const { existsSync } = require('fs');

        existsSync.mockImplementation((path: string) => path === expectedResult);
    };

    beforeEach(() => {
        jest.restoreAllMocks();
        const { lstatSync } = require('fs');

        lstatSync.mockImplementation(() => ({
            isDirectory: () => false,
        }));
    });

    it('attempts as is', () => {
        const importPath = 'test1.js';

        mockExistsExpectedResult(importPath);

        const result = resolveImport([importPath]);

        expect(result).toBe(importPath);
    });

    it('attempts js', () => {
        const importPath = 'test2';
        const expectedResult = 'test2.js';

        mockExistsExpectedResult(expectedResult);

        const result = resolveImport([importPath]);

        expect(result).toBe(expectedResult);
    });

    it('attempts custom extension', () => {
        const importPath = 'test3';
        const expectedResult = 'test3.jsx';

        mockExistsExpectedResult(expectedResult);
        const result = resolveImport([importPath], ['jsx']);

        expect(result).toBe(expectedResult);
    });

    it('attempts index.js', () => {
        const importPath = 'test4';
        const expectedResult = 'test4\\index.js';

        const { join } = require('path');

        join.mockImplementation((path: string) => {
            if (path === importPath) return expectedResult;
        });

        mockExistsExpectedResult(expectedResult);

        const result = resolveImport([importPath]);

        expect(result).toBe(expectedResult);
    });

    it('returns null in case of directory', () => {
        const importPath = 'test5';
        mockExistsExpectedResult(importPath);
        const { lstatSync } = require('fs');

        lstatSync.mockImplementation(() => ({
            isDirectory: () => true,
        }));

        const result = resolveImport([importPath]);

        expect(result).toBe(undefined);
    });

    it('attempts all paths', () => {
        const importPath1 = 'test6';
        const importPath2 = 'test7';
        const expectedResult = 'test7.js';

        mockExistsExpectedResult(expectedResult);
        const result = resolveImport([importPath1, importPath2]);

        expect(result).toBe(expectedResult);
    });
});
