import * as path from 'path';
import fastGlob from 'fast-glob';
import processConfig, { getDirResolver } from './process-config';

jest.mock('path');
jest.mock('fast-glob');

describe('getDirResolver', () => {
    const mockDirname = 'mockDirname';

    beforeAll(() => {
        const { dirname, resolve } = require('path');

        dirname.mockImplementation((dirName: string) => {
            if (dirName === mockDirname) {
                return mockDirname;
            }
        });
        resolve.mockImplementation((dirName: string, dir: string) => {
            if (dirName === mockDirname) {
                return dir;
            }
        });
    });

    it('runs consmiconfig based on cwd', () => {
        const dirResolver = getDirResolver(mockDirname);

        expect(dirResolver('test')).toBe('test');
    });
});

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

        expect(result.root).toBe('resolved_test');
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

    it('resolves rules functions', () => {
        const fastGlobSpy = jest
            .spyOn(fastGlob, 'sync')
            .mockImplementation(() => ['foo/package.json', 'bar/package.json']);
        const dirnameSpy = jest
            .spyOn(path, 'dirname')
            .mockImplementation((path: string) => path.split('/')[0]);

        const result = processConfig({
            config: {
                root: 'test',
                rules: ({ packages }) => ({
                    'my-rule': packages.map(pkg => ({
                        include: [new RegExp(`${pkg}/.*\.js`)],
                    })),
                }),
            },
            filePath: '',
        });

        expect(fastGlobSpy).toHaveBeenCalledWith(['*/**/package.json', '!**/node_modules/**'], {
            cwd: 'resolved_test',
        });

        expect(result.rules).toEqual({
            'my-rule': [
                {
                    include: [/foo\/.*.js/],
                },
                {
                    include: [/bar\/.*.js/],
                },
            ],
        });

        fastGlobSpy.mockRestore();
        dirnameSpy.mockRestore();
    });

    it('resolves rules functions with custom packages arg', () => {
        const fastGlobSpy = jest
            .spyOn(fastGlob, 'sync')
            .mockImplementation(() => ['foo/package.json']);
        const dirnameSpy = jest
            .spyOn(path, 'dirname')
            .mockImplementation((path: string) => path.split('/')[0]);

        const result = processConfig({
            config: {
                root: 'test',
                rules: ({ packages }) => ({
                    'my-rule': packages.map(pkg => ({
                        include: [new RegExp(`${pkg}/.*\.js`)],
                    })),
                }),
                packages: ['f*'],
            },
            filePath: '',
        });

        expect(fastGlobSpy).toHaveBeenCalledWith(['f*/package.json', '!**/node_modules/**'], {
            cwd: 'resolved_test',
        });

        expect(result.rules).toEqual({
            'my-rule': [
                {
                    include: [/foo\/.*.js/],
                },
            ],
        });

        fastGlobSpy.mockRestore();
        dirnameSpy.mockRestore();
    });
});
