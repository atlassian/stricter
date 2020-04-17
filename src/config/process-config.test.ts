import { processConfig } from './process-config';

jest.mock('path');
jest.mock('fast-glob');

describe('processConfig', () => {
    beforeAll(() => {
        const { resolve } = require('path');
        jest.restoreAllMocks();
        resolve.mockImplementation((_: string, dir: string) => `resolved_${dir}`);
    });

    it('populates root and rules', () => {
        const result = processConfig({
            config: {
                root: 'test',
                rules: {},
            },
            filePath: '',
        });

        expect(result.root).toBe('test');
        expect(result.rules).toEqual({});
    });

    it('populates rulesDir', () => {
        const result = processConfig({
            config: {
                root: 'test',
                rules: {},
                rulesDir: 'test',
            },
            filePath: '',
        });

        expect(result.rulesDir).toBe('resolved_test');
    });

    it('populates rulesDir when it is an array', () => {
        const result = processConfig({
            config: {
                root: 'test',
                rules: {},
                rulesDir: ['test1', 'test2'],
            },
            filePath: '',
        });

        expect(result.rulesDir).toEqual(['resolved_test1', 'resolved_test2']);
    });

    it('populates rules', () => {
        const rules = {};
        const result = processConfig({
            config: {
                rules,
                root: 'test',
            },
            filePath: '',
        });

        expect(result.rules).toBe(rules);
    });

    it('populates exclude', () => {
        const exclude = new RegExp('');
        const result = processConfig({
            config: {
                exclude,
                root: 'test',
                rules: {},
            },
            filePath: '',
        });

        expect(result.exclude).toBe(exclude);
    });

    it('populates plugins', () => {
        const plugins = ['abc'];
        const result = processConfig({
            config: {
                plugins,
                root: 'test',
                rules: {},
            },
            filePath: '',
        });

        expect(result.plugins).toBe(plugins);
    });
});
