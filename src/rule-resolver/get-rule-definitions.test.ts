import { RULE_SUFFIX } from './get-rule-definitions';

describe('getRuleDefinitions', () => {
    let getRuleDefinitions: any;
    let getPluginRuleDefinitionsMock: jest.Mock;
    beforeEach(() => {
        jest.resetModules();
        jest.restoreAllMocks();
        jest.doMock('path');
        jest.doMock('./../utils');
        getPluginRuleDefinitionsMock = jest.fn(() => ({
            'abc/rule-1': { onProject: () => [] },
            'abc/rule-2': { onProject: () => [] },
        }));
        jest.doMock('./get-plugin-rule-definitions', () => ({
            getPluginRuleDefinitions: getPluginRuleDefinitionsMock,
        }));
        getRuleDefinitions = require('./get-rule-definitions').getRuleDefinitions;
    });
    it('returns nothing is nothing is specified', async () => {
        const result = await getRuleDefinitions({});

        expect(result).toEqual({});
    });

    it('returns defaultRules if default rule is specified', async () => {
        const rules = {
            'stricter/unused-files': {},
        };

        const result = await getRuleDefinitions(rules);

        expect(Object.keys(result)).toEqual(['stricter/unused-files']);
    });

    it('throws if non-existing rules found', async () => {
        const filePath = `rule1${RULE_SUFFIX}`;

        const { listFiles } = require('./../utils');
        listFiles.mockReturnValue([filePath]);

        jest.doMock(filePath, () => ({}), { virtual: true });

        const { basename } = require('path');
        basename.mockReturnValue('ruleName');

        const rules = {
            rule1: {},
        };

        const rulesDir = 'test';

        const err = await getRuleDefinitions(rules, rulesDir).catch((err: Error) => err);
        expect(err instanceof Error).toBeTruthy();
    });

    it('should throw if no onProject is provided', async () => {
        const filePath = `rule1${RULE_SUFFIX}`;

        const { listFiles } = require('./../utils');
        listFiles.mockReturnValue([filePath]);

        jest.doMock(filePath, () => ({}), { virtual: true });

        const { basename } = require('path');
        basename.mockReturnValue('ruleName');

        const rules = {
            rule1: {},
        };
        const rulesDir = 'test';

        const err = await getRuleDefinitions(rules, rulesDir).catch((err: Error) => err);
        expect(err instanceof Error).toBeTruthy();
    });

    it('should add rule if onProject is provided', async () => {
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

        const rules = {
            [ruleName]: {},
        };
        const rulesDir = 'test';

        const result = await getRuleDefinitions(rules, rulesDir);
        expect(result).toEqual({ [ruleName]: rule });
    });

    it('should add multiple rules', async () => {
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

        const rules = {
            [ruleName1]: {},
            [ruleName2]: {},
        };

        const rulesDir = 'test';

        const result = await getRuleDefinitions(rules, rulesDir);
        expect(result).toEqual({ [ruleName1]: rule1, [ruleName2]: rule2 });
    });

    it(`should ignore all files except for those that end with "${RULE_SUFFIX}"`, async () => {
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

        const rules = {};
        const rulesDir = 'test';

        const result = await getRuleDefinitions(rules, rulesDir);
        expect(result).toEqual({});
    });

    it('should add rules from multiple rule directories', async () => {
        const ruleName1 = 'ruleName1';
        const ruleName2 = 'ruleName2';
        const filePath1 = `${ruleName1}${RULE_SUFFIX}`;
        const filePath2 = `${ruleName2}${RULE_SUFFIX}`;

        const { listFiles } = require('./../utils');
        listFiles.mockReturnValueOnce([filePath1]).mockReturnValueOnce([filePath2]);

        const rule1 = {
            onProject: () => {},
        };

        const rule2 = {
            onProject: () => {},
        };

        jest.doMock(filePath1, () => rule1, { virtual: true });
        jest.doMock(filePath2, () => rule2, { virtual: true });

        const { basename } = require('path');
        basename
            .mockReturnValueOnce(`${ruleName1}${RULE_SUFFIX}`)
            .mockReturnValueOnce(`${ruleName2}${RULE_SUFFIX}`);

        const rules = {
            [ruleName1]: {},
            [ruleName2]: {},
        };

        const rulesDir = ['ruleDir1', 'ruleDir2'];

        const result = await getRuleDefinitions(rules, rulesDir);
        expect(result[ruleName1]).toEqual(rule1);
        expect(result).toEqual({ [ruleName1]: rule1, [ruleName2]: rule2 });
    });

    it('should not get plugin rule definitions if none supplied', async () => {
        const rules = {
            'stricter/unused-files': {},
        };

        await getRuleDefinitions(rules, undefined, undefined);

        expect(getPluginRuleDefinitionsMock).not.toHaveBeenCalled();
    });

    it('should add rules from plugin if specified', async () => {
        const rules = {
            'abc/rule-1': {},
        };

        const result = await getRuleDefinitions(rules, undefined, ['abc']);

        expect(getPluginRuleDefinitionsMock).toHaveBeenCalledTimes(1);
        expect(getPluginRuleDefinitionsMock).toHaveBeenCalledWith(['abc']);

        expect(Object.keys(result)).toEqual(['abc/rule-1']);
    });

    it('should not add rules from plugin if none are specified', async () => {
        const rules = {
            'stricter/unused-files': {},
        };

        const result = await getRuleDefinitions(rules, undefined, ['abc']);

        expect(getPluginRuleDefinitionsMock).toHaveBeenCalledTimes(1);
        expect(getPluginRuleDefinitionsMock).toHaveBeenCalledWith(['abc']);

        expect(Object.keys(result)).toEqual(['stricter/unused-files']);
    });
});
