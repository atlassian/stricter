import * as path from 'path';
import fastGlob from 'fast-glob';
import { preprocessConfig } from './preprocess-config';

jest.mock('path');
jest.mock('fast-glob');

describe('preprocessConfig', () => {
    beforeAll(() => {
        const { resolve } = require('path');
        jest.restoreAllMocks();
        resolve.mockImplementation((_: string, dir: string) => `resolved_${dir}`);
    });

    it('resolves root to a full path', () => {
        const result = preprocessConfig({
            config: {
                root: 'test',
                rules: {},
            },
            filePath: '',
        });

        expect(result.root).toBe('resolved_test');
        expect(result.rules).toEqual({});
    });

    it('does not modify non-function rules', () => {
        const rules = {
            foo: {
                include: [/foo/],
            },
            bar: [
                {
                    include: [/bar/],
                },
                {
                    include: [/baz/],
                },
            ],
        };
        const result = preprocessConfig({
            config: {
                rules,
                root: 'test',
            },
            filePath: '',
        });

        expect(result.rules).toEqual(rules);
    });

    it('keeps other config props', () => {
        const result = preprocessConfig({
            config: {
                root: 'test',
                rules: {},
                rulesDir: 'testdir',
                exclude: /exclude/,
                plugins: ['foo'],
                packages: ['packages/**'],
            },
            filePath: '',
        });
        expect(result).toMatchObject({
            rulesDir: 'testdir',
            exclude: /exclude/,
            plugins: ['foo'],
            packages: ['packages/**'],
        });
    });

    it('resolves rules functions', () => {
        const fastGlobSpy = jest
            .spyOn(fastGlob, 'sync')
            .mockImplementation(() => ['foo/package.json', 'bar/package.json']);
        const dirnameSpy = jest
            .spyOn(path, 'dirname')
            .mockImplementation((path: string) => path.split('/')[0]);

        const result = preprocessConfig({
            config: {
                root: 'test',
                rules: {
                    'my-rule': ({ packages }) =>
                        packages.map((pkg) => ({
                            include: [new RegExp(`${pkg}/.*\.js`)],
                        })),
                    'another-pkg-rule': ({ packages }) =>
                        packages.map((pkg) => ({
                            exclude: [new RegExp(`${pkg}/.*\.js`)],
                        })),
                    'normal-rule': {
                        include: /another/,
                    },
                },
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
            'another-pkg-rule': [
                {
                    exclude: [/foo\/.*.js/],
                },
                {
                    exclude: [/bar\/.*.js/],
                },
            ],
            'normal-rule': {
                include: /another/,
            },
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

        const result = preprocessConfig({
            config: {
                root: 'test',
                rules: {
                    'my-rule': ({ packages }) =>
                        packages.map((pkg) => ({
                            include: [new RegExp(`${pkg}/.*\.js`)],
                        })),
                    'another-pkg-rule': ({ packages }) =>
                        packages.map((pkg) => ({
                            exclude: [new RegExp(`${pkg}/.*\.js`)],
                        })),
                    'normal-rule': {
                        include: /another/,
                    },
                },
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
            'another-pkg-rule': [
                {
                    exclude: [/foo\/.*.js/],
                },
            ],
            'normal-rule': {
                include: /another/,
            },
        });

        fastGlobSpy.mockRestore();
        dirnameSpy.mockRestore();
    });

    it('should not coerce invalid rule types to an object', () => {
        const invalidRulesFn: any = () => {};
        const fnResult = preprocessConfig({
            config: {
                root: 'test',
                rules: invalidRulesFn,
            },
            filePath: '',
        });

        expect(fnResult).toEqual({
            root: 'resolved_test',
            rules: invalidRulesFn,
        });

        const undefinedResult = preprocessConfig({
            config: {
                root: 'test',
                rules: undefined as any,
            },
            filePath: '',
        });

        expect(undefinedResult).toEqual({
            root: 'resolved_test',
            rules: undefined,
        });
    });

    it('should only search for packages once regardless of how many rules are functions', () => {
        const fastGlobSpy = jest
            .spyOn(fastGlob, 'sync')
            .mockImplementation(() => ['foo/package.json']);

        preprocessConfig({
            config: {
                root: 'test',
                rules: {
                    'my-rule': ({ packages }) =>
                        packages.map((pkg) => ({
                            include: [new RegExp(`${pkg}/.*\.js`)],
                        })),
                    'another-rule': ({ packages }) =>
                        packages.map((pkg) => ({
                            include: [new RegExp(`${pkg}/.*\.js`)],
                        })),
                },
            },
            filePath: '',
        });

        expect(fastGlobSpy).toHaveBeenCalledTimes(1);

        fastGlobSpy.mockRestore();
    });
});
