import { getRuleDefinitions, getRuleApplications, defaultRules, RULE_SUFFIX } from '.';

jest.mock('path');
jest.mock('./../utils');

describe('getRuleDefinitions', () => {
    it('returns nothing is nothing is specified', () => {
        const config = {
            root: 'root',
            rules: {},
        };

        const result = getRuleDefinitions(config);

        expect(result).toEqual({});
    });

    it('returns defaultRules if default rule is specified', () => {
        const config = {
            root: 'root',
            rules: {
                'stricter/unused-files': {},
            },
        };

        const result = getRuleDefinitions(config);

        expect(result).toEqual(defaultRules);
    });

    it('throws if non-existing rules found', () => {
        const filePath = `rule1${RULE_SUFFIX}`;

        const { listFiles } = require('./../utils');
        listFiles.mockReturnValue([filePath]);

        jest.doMock(filePath, () => ({}), { virtual: true });

        const { basename } = require('path');
        basename.mockReturnValue('ruleName');

        const config = {
            rulesDir: 'test',
            root: 'root',
            rules: {
                rule1: {},
            },
        };

        expect(() => getRuleDefinitions(config)).toThrow();
    });

    it('should throw if no onProject is provided', () => {
        const filePath = `rule1${RULE_SUFFIX}`;

        const { listFiles } = require('./../utils');
        listFiles.mockReturnValue([filePath]);

        jest.doMock(filePath, () => ({}), { virtual: true });

        const { basename } = require('path');
        basename.mockReturnValue('ruleName');

        const config = {
            rulesDir: 'test',
            root: 'root',
            rules: {
                rule1: {},
            },
        };

        expect(() => getRuleDefinitions(config)).toThrow();
    });

    it('should add rule if onProject is provided', () => {
        const ruleName = 'ruleName';
        const filePath = `${ruleName}${RULE_SUFFIX}`;

        const { listFiles } = require('./../utils');
        listFiles.mockReturnValue([filePath]);

        const rule = {
            onProject: () => {},
        };

        jest.doMock(filePath, () => rule, { virtual: true });

        const { basename } = require('path');
        basename.mockReturnValue(`${ruleName}${RULE_SUFFIX}`);

        const config = {
            rulesDir: 'test',
            root: 'root',
            rules: {
                [ruleName]: {},
            },
        };

        const result = getRuleDefinitions(config);
        expect(result).toEqual({ [ruleName]: rule });
    });

    it('should add multiple rules', () => {
        const ruleName1 = 'ruleName1';
        const ruleName2 = 'ruleName2';
        const filePath5 = `${ruleName1}${RULE_SUFFIX}`;
        const filePath6 = `${ruleName2}${RULE_SUFFIX}`;

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
        basename
            .mockReturnValueOnce(`${ruleName1}${RULE_SUFFIX}`)
            .mockReturnValueOnce(`${ruleName2}${RULE_SUFFIX}`);

        const config = {
            rulesDir: 'test',
            root: 'root',
            rules: {
                [ruleName1]: {},
                [ruleName2]: {},
            },
        };

        const result = getRuleDefinitions(config);
        expect(result).toEqual({ [ruleName1]: rule1, [ruleName2]: rule2 });
    });

    it(`should ignore all files except for those that end with "${RULE_SUFFIX}"`, () => {
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
        expect(result).toEqual({});
    });
});

describe('getRuleApplications', () => {
    it('throws if non-existing rules found', () => {
        const rule1Usage = {
            include: /rule1/,
        };

        const rule2Usage = {
            exclude: /rule2/,
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

        const result = getRuleApplications(config, ruleDefinitions, undefined);

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
