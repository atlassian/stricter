import { getRuleDefinitions, getRuleApplications, defaultRules } from '.';
import { RuleRequirement } from './../types';

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

    it('should throw if no onFile and onProject are provided', () => {
        const filePath = 'filePath1';

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

    it('should throw if both onFile and onProject are provided', () => {
        const filePath = 'filePath2';

        const { listFiles } = require('./../utils');
        listFiles.mockReturnValue([filePath]);

        jest.doMock(
            filePath,
            () => ({
                onFile: () => {},
                onProject: () => {},
            }),
            { virtual: true },
        );

        const { basename } = require('path');
        basename.mockReturnValue('ruleName');

        const config = {
            rulesDir: 'test',
            root: 'root',
            rules: {},
        };

        expect(() => getRuleDefinitions(config)).toThrow();
    });

    it('should add rule if onFile is provided', () => {
        const filePath = 'filePath3';

        const { listFiles } = require('./../utils');
        listFiles.mockReturnValue([filePath]);

        const rule = {
            onFile: () => {},
        };

        jest.doMock(filePath, () => rule, { virtual: true });

        const { basename } = require('path');
        const ruleName = 'ruleName';
        basename.mockReturnValue(ruleName);

        const config = {
            rulesDir: 'test',
            root: 'root',
            rules: {},
        };

        const result = getRuleDefinitions(config);
        expect(result).toEqual({ ...defaultRules, [ruleName]: rule });
    });

    it('should add rule if onProject is provided', () => {
        const filePath = 'filePath4';

        const { listFiles } = require('./../utils');
        listFiles.mockReturnValue([filePath]);

        const rule = {
            onProject: () => {},
        };

        jest.doMock(filePath, () => rule, { virtual: true });

        const { basename } = require('path');
        const ruleName = 'ruleName';
        basename.mockReturnValue(ruleName);

        const config = {
            rulesDir: 'test',
            root: 'root',
            rules: {},
        };

        const result = getRuleDefinitions(config);
        expect(result).toEqual({ ...defaultRules, [ruleName]: rule });
    });

    it('should add multiple rules', () => {
        const filePath5 = 'filePath5';
        const filePath6 = 'filePath6';

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
        basename.mockReturnValueOnce(ruleName1).mockReturnValueOnce(ruleName2);

        const config = {
            rulesDir: 'test',
            root: 'root',
            rules: {},
        };

        const result = getRuleDefinitions(config);
        expect(result).toEqual({ ...defaultRules, [ruleName1]: rule1, [ruleName2]: rule2 });
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
            onFile: () => [],
            onProject: () => [],
            requirement: RuleRequirement.CONTENTS,
        };

        const rule2 = {
            onFile: () => [],
            onProject: () => [],
            requirement: RuleRequirement.CONTENTS,
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
