import { parseImports } from './parse-imports';
import { parse } from '../utils';

describe('resolveImport', () => {
    it('should count require', () => {
        const result = parseImports(
            parse(
                'filePath',
                `
            const test1 = require('test-file1');
        `,
            ),
        );

        expect(result.staticImports).toEqual([]);
        expect(result.dynamicImports).toEqual(['test-file1']);
    });

    it('should count es6 dynamic import', () => {
        const result = parseImports(
            parse(
                'filePath',
                `
            const test1 = import('test-file1');
        `,
            ),
        );

        expect(result.staticImports).toEqual([]);
        expect(result.dynamicImports).toEqual(['test-file1']);
    });

    it('should count es6 imports', () => {
        const result = parseImports(
            parse(
                'filePath',
                `
            import { default as test1 } from 'test-file1';
            import { test2, test3 } from 'test-file2';
            import test4 from 'test-file3';
            import * as test5 from 'test-file4';
        `,
            ),
        );

        expect(result.staticImports).toEqual([
            'test-file1',
            'test-file2',
            'test-file3',
            'test-file4',
        ]);
        expect(result.dynamicImports).toEqual([]);
    });

    it('should count es6 reexports', () => {
        const result = parseImports(
            parse(
                'filePath',
                `
            export { default as test1 } from 'test-file1';
            export { test2, test3 } from 'test-file2';
            export * from 'test-file3';
        `,
            ),
        );

        expect(result.staticImports).toEqual(['test-file1', 'test-file2', 'test-file3']);
        expect(result.dynamicImports).toEqual([]);
    });

    it('should not count exports', () => {
        const result = parseImports(
            parse(
                'filePath',
                `
            export default () => {};
            export const test = () => {};
        `,
            ),
        );

        expect(result.staticImports).toEqual([]);
        expect(result.dynamicImports).toEqual([]);
    });

    it('should ignore dynamic imports', () => {
        const result = parseImports(
            parse(
                'filePath',
                `
            const test1 = require(foo);
            const test2 = import(foo);
        `,
            ),
        );

        expect(result.staticImports).toEqual([]);
        expect(result.dynamicImports).toEqual([]);
    });

    it('should count TS import equals declaration', () => {
        const result = parseImports(
            parse(
                'filePath.tsx',
                `
            import test1 = require('test-file1');
        `,
            ),
        );

        expect(result.staticImports).toEqual(['test-file1']);
        expect(result.dynamicImports).toEqual([]);
    });

    it('should count jest.requireActual', () => {
        const result = parseImports(
            parse(
                'filePath',
                `
            const test1 = jest.requireActual('test-file1');
        `,
            ),
        );

        expect(result.staticImports).toEqual([]);
        expect(result.dynamicImports).toEqual(['test-file1']);
    });
});
