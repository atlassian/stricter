import { matchesRuleUsage } from '.';

jest.mock('path');

describe('matchesRuleUsage', () => {
    const root = 'test';
    const filepath = `${root}/src/file/path/name`;

    it('should return true if the file path matches the "include" string', () => {
        const usage = {
            include: /file\/path/,
        };
        expect(matchesRuleUsage(root, filepath, usage)).toEqual(true);
    });

    it('should return false if the file path matches the "include" string but it`s excluded', () => {
        const usage = {
            include: /file\/path/,
            exclude: /path/,
        };
        expect(matchesRuleUsage(root, filepath, usage)).toEqual(false);
    });

    it('should return false if the file path doesn`t match the "include" string', () => {
        const usage = {
            include: /file\/path/,
        };
        expect(matchesRuleUsage(root, 'noname', usage)).toEqual(false);
    });

    it('should return true if the file path matches the "include" array', () => {
        const usage = {
            include: [/file\/path/, /another\/file\/another\/path/],
        };
        expect(matchesRuleUsage(root, filepath, usage)).toEqual(true);
    });

    it('should return false if the file path matches the "include" array but it`s excluded', () => {
        const usage = {
            include: [/file\/path/, /another\/file\/another\/path/],
            exclude: [/file/, /path/],
        };
        expect(matchesRuleUsage(root, filepath, usage)).toEqual(false);
    });

    it('should return false if the file path doesn`t match the "include" array', () => {
        const usage = {
            include: [/file\/path/, /another\/file\/another\/path/],
        };
        expect(matchesRuleUsage(root, 'noname', usage)).toEqual(false);
    });

    it('should return true if the file path matches "include" function', () => {
        const usage = {
            include: (i: string) => i === 'noname',
        };
        expect(matchesRuleUsage(root, 'noname', usage)).toEqual(true);
    });

    it('should return false if the file path does not match "include" function', () => {
        const usage = {
            include: (i: string) => i !== 'noname',
        };
        expect(matchesRuleUsage(root, 'noname', usage)).toEqual(false);
    });

    it('should return false if the file path matches both "include" and "exclude" functions', () => {
        const usage = {
            include: (i: string) => i === 'noname',
            exclude: (i: string) => i === 'noname',
        };
        expect(matchesRuleUsage(root, 'noname', usage)).toEqual(false);
    });
});
