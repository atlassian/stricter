import { validateRegistries, createNodeName } from './index';

describe('circular-dependencies', () => {
    describe('createNodeName', () => {
        it('should use commonPrefix as name when node is root', () => {
            expect(createNodeName('prefix/', 'prefix/')).toBe('prefix/');
        });
        it('should use node without commonPrefix if present', () => {
            expect(createNodeName('prefix/node', 'prefix/')).toBe('node');
        });
        it('should use node as name when commonPrefix is not set', () => {
            expect(createNodeName('prefix/node', '')).toBe('prefix/node');
        });
    });
    describe('validateRegistries', () => {
        it('should return array when string is set', () => {
            expect(validateRegistries('registry')).toEqual(['registry']);
        });
        it('should return array when array is used', () => {
            expect(validateRegistries(['registry', 'registry'])).toEqual(['registry', 'registry']);
        });
        it('should return empty array when registries are not set', () => {
            expect(validateRegistries(undefined)).toEqual([]);
        });
        it('should return error when registries are invalid', () => {
            try {
                // @ts-ignore - testing invalid configuration
                validateRegistries(1);
            } catch (e) {
                expect(e).toEqual(
                    new Error('Invalid config: registries should an array or a string'),
                );
            }
        });
    });
});
