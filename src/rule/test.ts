import * as path from 'path';
import {
    getRuleDefinitions,
    getRuleApplications,
    defaultRules,
    matchesRuleUsage,
    RULE_SUFFIX,
} from '.';

jest.mock('path');
jest.mock('./../utils');

describe('getRuleDefinitions', () => {
    it('returns defaultRules if no rulesDir specified', () => {
        const config = {
            root: 'root',
            rules: {},
        };

        const result = getRuleDefinitions(config);

        expect(result).toEqual(defaultRules);
    });

    it('should throw if no onProject is provided', () => {
        const filePath = `filePath1${RULE_SUFFIX}.js`;

        const { listFiles } = require('./../utils');
        listFiles.mockReturnValue([filePath]);

        jest.doMock(filePath, () => ({}), { virtual: true });

        const { basename } = require('path');
        basename.mockReturnValue('ruleName');

        const config = {
            rulesDir: 'test',
            root: 'root',
            rules: {},
        };

        expect(() => getRuleDefinitions(config)).toThrow();
    });

    it('should add rule if onProject is provided', () => {
        const filePath = `filePath4${RULE_SUFFIX}.js`;

        const { listFiles } = require('./../utils');
        listFiles.mockReturnValue([filePath]);

        const rule = {
            onProject: () => {},
        };

        jest.doMock(filePath, () => rule, { virtual: true });

        const { basename } = require('path');
        const ruleName = 'ruleName';
        basename.mockReturnValue(`${ruleName}${RULE_SUFFIX}`);

        const config = {
            rulesDir: 'test',
            root: 'root',
            rules: {},
        };

        const result = getRuleDefinitions(config);
        expect(result).toEqual({ ...defaultRules, [ruleName]: rule });
    });

    it('should add multiple rules', () => {
        const filePath5 = `filePath5${RULE_SUFFIX}.js`;
        const filePath6 = `filePath6${RULE_SUFFIX}.js`;

        const { listFiles } = require('./../utils');
        listFiles.mockReturnValue([filePath5, filePath6]);

        const rule1 = {
            onProject: () => {},
        };

        const rule2 = {
            onProject: () => {},
        };

        jest.doMock(filePath5, () => rule1, { virtual: true });
        jest.doMock(filePath6, () => rule2, { virtual: true });

        const { basename } = require('path');
        const ruleName1 = 'ruleName1';
        const ruleName2 = 'ruleName2';
        basename
            .mockReturnValueOnce(`${ruleName1}${RULE_SUFFIX}`)
            .mockReturnValueOnce(`${ruleName2}${RULE_SUFFIX}`);

        const config = {
            rulesDir: 'test',
            root: 'root',
            rules: {},
        };

        const result = getRuleDefinitions(config);
        expect(result).toEqual({ ...defaultRules, [ruleName1]: rule1, [ruleName2]: rule2 });
    });

    it(`should ignore all files except for those that end with "${RULE_SUFFIX}.js"`, () => {
        const filePath7 = 'filePath7.ts';
        const filePath8 = 'filePath8.js';

        const { listFiles } = require('./../utils');
        listFiles.mockReturnValue([filePath7, filePath8]);

        const rule = {
            onProject: () => {},
        };

        jest.doMock(filePath7, () => rule, { virtual: true });
        jest.doMock(filePath8, () => rule, { virtual: true });

        const { basename } = require('path');
        basename.mockReturnValue('ruleName');

        const config = {
            rulesDir: 'test',
            root: 'root',
            rules: {},
        };

        const result = getRuleDefinitions(config);
        expect(result).toEqual({ ...defaultRules });
    });
});

describe('getRuleApplications', () => {
    it('throws if non-existing rules found', () => {
        const config = {
            root: 'root',
            rules: {
                test: {},
            },
        };

        const ruleDefinitions = {};

        expect(() => getRuleApplications(config, ruleDefinitions)).toThrow();
    });

    it('throws if non-existing rules found11', () => {
        const rule1Usage = {
            include: 'rule1',
        };

        const rule2Usage = {
            exclude: 'rule2',
        };

        const config = {
            root: 'root',
            rules: {
                rule1: rule1Usage,
                rule2: rule2Usage,
            },
        };

        const rule1 = {
            onProject: () => [],
        };

        const rule2 = {
            onProject: () => [],
        };

        const ruleDefinitions = {
            rule1,
            rule2,
        };

        const result = getRuleApplications(config, ruleDefinitions);

        expect(result).toEqual({
            rule1: {
                definition: rule1,
                usage: rule1Usage,
            },
            rule2: {
                definition: rule2,
                usage: rule2Usage,
            },
        });
    });
});

describe('matchesRuleUsage', () => {
    const root = 'test';
    const filepath = `${root}${path.sep}src/file/path/name`;

    it('should return true if the file path matches the "include" string', () => {
        const usage = {
            include: 'file/path',
        };
        expect(matchesRuleUsage(root, filepath, usage)).toEqual(true);
    });

    it('should return false if the file path matches the "include" string but it`s excluded', () => {
        const usage = {
            include: 'file/path',
            exclude: 'path',
        };
        expect(matchesRuleUsage(root, filepath, usage)).toEqual(false);
    });

    it('should return false if the file path doesn`t match the "include" string', () => {
        const usage = {
            include: 'file/path',
        };
        expect(matchesRuleUsage(root, 'noname', usage)).toEqual(false);
    });

    it('should return true if the file path matches the "include" array', () => {
        const usage = {
            include: ['file/path', 'another/file/another/path'],
        };
        expect(matchesRuleUsage(root, filepath, usage)).toEqual(true);
    });

    it('should return false if the file path matches the "include" array but it`s excluded', () => {
        const usage = {
            include: ['file/path', 'another/file/another/path'],
            exclude: ['file', 'path'],
        };
        expect(matchesRuleUsage(root, filepath, usage)).toEqual(false);
    });

    it('should return false if the file path doesn`t match the "include" array', () => {
        const usage = {
            include: ['file/path', 'another/file/another/path'],
        };
        expect(matchesRuleUsage(root, 'noname', usage)).toEqual(false);
    });
});
