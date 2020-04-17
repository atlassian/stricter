/**
 * Integration tests
 */

import { getStricter } from '../factory';

describe("Stricter's ", () => {
    const stricterConfigPath = `${__dirname}/__fixtures__/stricter.config.js`;
    const defaultParams = {
        reporter: undefined,
        rulesToVerify: undefined,
        clearCache: undefined,
        fix: undefined,
    };

    beforeEach(() => {
        // Comment out the mockImplementation to debug issues
        jest.spyOn(console, 'log').mockImplementation(() => null);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.resetModules();
    });

    describe('rules should', () => {
        it('report no errors when no rules or rulesDir specified', () => {
            jest.doMock(stricterConfigPath, () => ({
                root: 'project/src',
                rules: {},
            }));
            const stricter = getStricter({
                ...defaultParams,
                config: stricterConfigPath,
            });

            stricter();
            expect(console.log).toHaveBeenCalledTimes(1);
            expect(console.log).toHaveBeenCalledWith('No errors');
        });

        it('report no errors when default rules and rulesDir are specified', () => {
            jest.doMock(stricterConfigPath, () => ({
                root: 'project/src',
                rulesDir: 'project/rules',
                exclude: [/.*\.json/],
                rules: {
                    'stricter/unused-files': [
                        {
                            level: 'error',
                            config: {
                                entry: [/.*\/src\/index\.js/],
                            },
                        },
                    ],
                },
            }));
            const stricter = getStricter({
                ...defaultParams,
                config: stricterConfigPath,
            });

            stricter();
            expect(console.log).toHaveBeenCalledTimes(1);
            expect(console.log).toHaveBeenCalledWith('No errors');
        });

        it('report no errors when default rules and multiple rulesDir are specified', () => {
            jest.doMock(stricterConfigPath, () => ({
                root: 'project/src',
                rulesDir: ['project/rules', 'project/another_rules'],
                exclude: [/.*\.json/],
                rules: {
                    'stricter/unused-files': [
                        {
                            level: 'error',
                            config: {
                                entry: [/.*\/src\/index\.js/],
                            },
                        },
                    ],
                },
            }));
            const stricter = getStricter({
                ...defaultParams,
                config: stricterConfigPath,
            });

            stricter();
            expect(console.log).toHaveBeenCalledTimes(1);
            expect(console.log).toHaveBeenCalledWith('No errors');
        });
    });

    describe('stricter/unused-files rule should', () => {
        it('report errors when a rule violation occurs', () => {
            jest.doMock(stricterConfigPath, () => ({
                root: 'project/src',
                rulesDir: 'project/rules',
                exclude: [/.*\.json/],
                rules: {
                    'stricter/unused-files': [
                        {
                            level: 'error',
                            config: {
                                entry: [/\/src\/bar\/index.js/],
                            },
                        },
                    ],
                },
            }));
            const stricter = getStricter({
                ...defaultParams,
                config: stricterConfigPath,
            });

            stricter();
            expect(console.log).toHaveBeenCalledTimes(4);
            expect(console.log).toHaveBeenNthCalledWith(
                1,
                expect.stringMatching(
                    /.*error:.*stricter\/unused-files.*__fixtures__\/project\/src\/foo\/index.js/,
                ),
            );
            expect(console.log).toHaveBeenNthCalledWith(
                2,
                expect.stringMatching(
                    /.*error:.*stricter\/unused-files.*__fixtures__\/project\/src\/index.js/,
                ),
            );
            expect(console.log).toHaveBeenNthCalledWith(3, '2 errors');
            expect(console.log).toHaveBeenNthCalledWith(
                4,
                'Fixes are available. Run "stricter --fix" to apply them.',
            );
        });
    });

    describe('stricter/circular-dependencies rule should', () => {
        it("report no errors when a rule violation doesn't occur", () => {
            jest.doMock(stricterConfigPath, () => ({
                root: 'project/src',
                rules: {
                    'stricter/circular-dependencies': [
                        {
                            level: 'error',
                        },
                    ],
                },
            }));
            const stricter = getStricter({
                ...defaultParams,
                config: stricterConfigPath,
            });
            console.log(stricter());
            expect(console.log).toHaveBeenCalledTimes(2);
            expect(console.log).toHaveBeenCalledWith('No errors');
        });

        it('report no errors when a checkSubTreeCycle option is off and there are folder level cycles', () => {
            jest.doMock(stricterConfigPath, () => ({
                root: 'project-with-sub-tree-cycle/src',
                rules: {
                    'stricter/circular-dependencies': [
                        {
                            level: 'error',
                            config: {
                                checkSubTreeCycle: false,
                            },
                        },
                    ],
                },
            }));
            const stricter = getStricter({
                ...defaultParams,
                config: stricterConfigPath,
            });
            console.log(stricter());
            expect(console.log).toHaveBeenCalledTimes(2);
            expect(console.log).toHaveBeenNthCalledWith(1, 'No errors');
        });

        it('report no errors when a checkSubTreeCycle option is on registries is set and there are folder level cycles in registries folder', () => {
            jest.doMock(stricterConfigPath, () => ({
                root: 'project-with-nested-sub-tree-cycle/src',
                rules: {
                    'stricter/circular-dependencies': [
                        {
                            level: 'error',
                            config: {
                                checkSubTreeCycle: true,
                                registries: ['**/src', '**/src/B'],
                            },
                        },
                    ],
                },
            }));
            const stricter = getStricter({
                ...defaultParams,
                config: stricterConfigPath,
            });
            console.log(stricter());
            expect(console.log).toHaveBeenCalledTimes(2);
            expect(console.log).toHaveBeenNthCalledWith(1, 'No errors');
        });

        it('report errors when there are cyclic dependencies', () => {
            jest.doMock(stricterConfigPath, () => ({
                root: 'project-with-cyclic-dependencies/src',
                rules: {
                    'stricter/circular-dependencies': [
                        {
                            level: 'error',
                            config: {
                                checkSubTreeCycle: true,
                            },
                        },
                    ],
                },
            }));
            const stricter = getStricter({
                ...defaultParams,
                config: stricterConfigPath,
            });
            console.log(stricter());
            expect(console.log).toHaveBeenCalledTimes(3);
            expect(console.log).toHaveBeenNthCalledWith(
                1,
                expect.stringMatching(/.*error:.*stricter\/circular-dependencies.*/),
            );
            expect(console.log).toHaveBeenNthCalledWith(2, '1 error');
        });

        it('report errors when a checkSubTreeCycle option is on and there are folder level cycles', () => {
            jest.doMock(stricterConfigPath, () => ({
                root: 'project-with-sub-tree-cycle/src',
                rules: {
                    'stricter/circular-dependencies': [
                        {
                            level: 'error',
                            config: {
                                checkSubTreeCycle: true,
                            },
                        },
                    ],
                },
            }));
            const stricter = getStricter({
                ...defaultParams,
                config: stricterConfigPath,
            });
            console.log(stricter());
            expect(console.log).toHaveBeenCalledTimes(3);
            expect(console.log).toHaveBeenNthCalledWith(
                1,
                expect.stringMatching(/.*error:.*stricter\/circular-dependencies.*/),
            );
            expect(console.log).toHaveBeenNthCalledWith(2, '1 error');
        });

        it('report errors when a checkSubTreeCycle option is on registries is not set and there are folder level cycles in registered folder', () => {
            jest.doMock(stricterConfigPath, () => ({
                root: 'project-with-sub-tree-cycle-and-nested-sub-tree-cycle/src',
                rules: {
                    'stricter/circular-dependencies': [
                        {
                            level: 'error',
                            config: {
                                checkSubTreeCycle: true,
                            },
                        },
                    ],
                },
            }));
            const stricter = getStricter({
                ...defaultParams,
                config: stricterConfigPath,
            });
            console.log(stricter());
            expect(console.log).toHaveBeenCalledTimes(3);
            expect(console.log).toHaveBeenNthCalledWith(
                1,
                expect.stringMatching(/.*error:.*stricter\/circular-dependencies.*/),
            );
            expect(console.log).toHaveBeenNthCalledWith(2, '1 error');
        });

        it('report errors when a checkSubTreeCycle option is on registries is set and there are folder level cycles in registered folder and outside registered folder', () => {
            jest.doMock(stricterConfigPath, () => ({
                root: 'project-with-sub-tree-cycle-and-nested-sub-tree-cycle/src',
                rules: {
                    'stricter/circular-dependencies': [
                        {
                            level: 'error',
                            config: {
                                checkSubTreeCycle: true,
                                registries: ['**/src', '**/src/B'],
                            },
                        },
                    ],
                },
            }));
            const stricter = getStricter({
                ...defaultParams,
                config: stricterConfigPath,
            });
            console.log(stricter());
            expect(console.log).toHaveBeenCalledTimes(3);
            expect(console.log).toHaveBeenNthCalledWith(
                1,
                expect.stringMatching(/.*error:.*stricter\/circular-dependencies.*/),
            );
            expect(console.log).toHaveBeenNthCalledWith(2, '1 error');
        });

        it('report errors when a checkSubTreeCycle option is on registries is set and there are folder level cycles inside registered folder and outside registered folder', () => {
            jest.doMock(stricterConfigPath, () => ({
                root: 'project-with-sub-tree-cycle-and-double-nested-sub-tree-cycle/src',
                rules: {
                    'stricter/circular-dependencies': [
                        {
                            level: 'error',
                            config: {
                                checkSubTreeCycle: true,
                                registries: ['**/src', '**/src/B'],
                            },
                        },
                    ],
                },
            }));
            const stricter = getStricter({
                ...defaultParams,
                config: stricterConfigPath,
            });
            console.log(stricter());
            expect(console.log).toHaveBeenCalledTimes(3);
            expect(console.log).toHaveBeenNthCalledWith(
                1,
                expect.stringMatching(/.*error:.*stricter\/circular-dependencies.*/),
            );
            expect(console.log).toHaveBeenNthCalledWith(2, '1 error');
        });

        it('report errors when a checkSubTreeCycle option is on registry is invalid: number', () => {
            jest.doMock(stricterConfigPath, () => ({
                root: 'project-with-sub-tree-cycle-and-double-nested-sub-tree-cycle/src',
                rules: {
                    'stricter/circular-dependencies': [
                        {
                            level: 'error',
                            config: {
                                checkSubTreeCycle: true,
                                registries: 42,
                            },
                        },
                    ],
                },
            }));
            const stricter = getStricter({
                ...defaultParams,
                config: stricterConfigPath,
            });
            expect(() => {
                console.log(stricter());
            }).toThrow(new Error('Invalid config: registries should be an array or a string'));
        });

        it('report errors when a checkSubTreeCycle option is on registry is invalid: array contains non string entities', () => {
            jest.doMock(stricterConfigPath, () => ({
                root: 'project-with-sub-tree-cycle-and-double-nested-sub-tree-cycle/src',
                rules: {
                    'stricter/circular-dependencies': [
                        {
                            level: 'error',
                            config: {
                                checkSubTreeCycle: true,
                                registries: ['/B', 42],
                            },
                        },
                    ],
                },
            }));
            const stricter = getStricter({
                ...defaultParams,
                config: stricterConfigPath,
            });
            expect(() => {
                console.log(stricter());
            }).toThrow(new Error('Invalid config: registries should be an array or a string'));
        });
    });

    describe('rules config should work with', () => {
        it('function', () => {
            jest.doMock(stricterConfigPath, () => ({
                root: 'project/src',
                rulesDir: 'project/rules',
                exclude: [/.*\.json/],
                rules: {
                    'stricter/unused-files': ({ packages }: { packages: string[] }) =>
                        packages.map((pkg: string) => ({
                            level: 'error',
                            config: {
                                entry: [new RegExp(`${pkg}/index.js`)],
                            },
                        })),
                },
            }));
            const stricter = getStricter({
                ...defaultParams,
                config: stricterConfigPath,
            });

            stricter();
            expect(console.log).toHaveBeenCalledTimes(6);
            expect(console.log).toHaveBeenNthCalledWith(
                1,
                expect.stringMatching(
                    /.*error:.*stricter\/unused-files.*__fixtures__\/project\/src\/foo\/index.js/,
                ),
            );
            expect(console.log).toHaveBeenNthCalledWith(
                2,
                expect.stringMatching(
                    /.*error:.*stricter\/unused-files.*__fixtures__\/project\/src\/index.js/,
                ),
            );
            expect(console.log).toHaveBeenNthCalledWith(
                3,
                expect.stringMatching(
                    /.*error:.*stricter\/unused-files.*__fixtures__\/project\/src\/bar\/index.js/,
                ),
            );
            expect(console.log).toHaveBeenNthCalledWith(
                4,
                expect.stringMatching(
                    /.*error:.*stricter\/unused-files.*__fixtures__\/project\/src\/index.js/,
                ),
            );
            expect(console.log).toHaveBeenNthCalledWith(5, '4 errors');
            expect(console.log).toHaveBeenNthCalledWith(
                6,
                'Fixes are available. Run "stricter --fix" to apply them.',
            );
        });

        it('function and custom packages array', () => {
            jest.doMock(stricterConfigPath, () => ({
                root: 'project/src',
                rulesDir: 'project/rules',
                exclude: [/.*\.json/],
                rules: {
                    'stricter/unused-files': ({ packages }: { packages: string[] }) =>
                        packages.map((pkg: string) => ({
                            level: 'error',
                            config: {
                                entry: [new RegExp(`${pkg}/index.js`)],
                            },
                        })),
                },
                packages: ['f*'],
            }));
            const stricter = getStricter({
                ...defaultParams,
                config: stricterConfigPath,
            });

            stricter();
            expect(console.log).toHaveBeenCalledTimes(4);
            expect(console.log).toHaveBeenNthCalledWith(
                1,
                expect.stringMatching(
                    /.*error:.*stricter\/unused-files.*__fixtures__\/project\/src\/bar\/index.js/,
                ),
            );
            expect(console.log).toHaveBeenNthCalledWith(
                2,
                expect.stringMatching(
                    /.*error:.*stricter\/unused-files.*__fixtures__\/project\/src\/index.js/,
                ),
            );
            expect(console.log).toHaveBeenNthCalledWith(3, '2 errors');
            expect(console.log).toHaveBeenNthCalledWith(
                4,
                'Fixes are available. Run "stricter --fix" to apply them.',
            );
        });
    });

    describe('plugins should', () => {
        it('add rule definitions available to be used in `rules`', () => {
            const ruleSpy = jest.fn(() => []);
            jest.doMock(
                'stricter-plugin-abc',
                () => ({
                    rules: {
                        'some-rule': {
                            onProject: ruleSpy,
                        },
                    },
                }),
                { virtual: true },
            );
            jest.doMock(stricterConfigPath, () => ({
                root: 'project/src',
                rulesDir: 'project/rules',
                rules: {
                    'abc/some-rule': [
                        {
                            level: 'error',
                        },
                    ],
                },
                plugins: ['abc'],
            }));
            const stricter = getStricter({
                ...defaultParams,
                config: stricterConfigPath,
            });
            stricter();
            expect(console.log).toHaveBeenCalledTimes(1);
            expect(console.log).toHaveBeenCalledWith('No errors');
            expect(ruleSpy).toHaveBeenCalledTimes(1);
        });

        it('not enable rules by default', () => {
            const ruleSpy = jest.fn(() => []);
            jest.doMock(
                'stricter-plugin-abc',
                () => ({
                    rules: {
                        'some-rule': {
                            onProject: ruleSpy,
                        },
                    },
                }),
                { virtual: true },
            );
            jest.doMock(stricterConfigPath, () => ({
                root: 'project/src',
                rulesDir: 'project/rules',
                rules: {},
                plugins: ['abc'],
            }));
            const stricter = getStricter({
                ...defaultParams,
                config: stricterConfigPath,
            });
            stricter();
            expect(console.log).toHaveBeenCalledTimes(1);
            expect(console.log).toHaveBeenCalledWith('No errors');
            expect(ruleSpy).not.toHaveBeenCalled();
        });
    });
});
