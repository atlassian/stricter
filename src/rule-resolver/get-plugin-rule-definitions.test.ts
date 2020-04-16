import getPluginRuleDefinitions from './get-plugin-rule-definitions';
import type { RuleDefinition } from '../types';

describe('getPluginRuleDefinitions', () => {
    let rule1: RuleDefinition;
    let rule2: RuleDefinition;
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        rule1 = {
            onProject: jest.fn(),
        };
        rule2 = {
            onProject: jest.fn(),
        };
        jest.doMock(
            'stricter-plugin-abc',
            () => ({
                rules: {
                    'rule-1': rule1,
                },
            }),
            { virtual: true },
        );
        jest.doMock(
            '@something/stricter-plugin-scoped',
            () => ({
                rules: {
                    'rule-2': rule2,
                },
            }),
            { virtual: true },
        );
    });

    it('should return the rules from a single plugin', () => {
        const rules = getPluginRuleDefinitions(['abc']);

        expect(rules).toEqual({
            'abc/rule-1': rule1,
        });
    });
    it('should return the rules from multiple plugins', () => {
        const rule2 = {
            onProject: jest.fn(),
        };
        jest.doMock(
            'stricter-plugin-def',
            () => ({
                rules: {
                    'rule-2': rule2,
                },
            }),
            { virtual: true },
        );
        const rules = getPluginRuleDefinitions(['abc', 'def']);

        expect(rules).toEqual({
            'abc/rule-1': rule1,
            'def/rule-2': rule2,
        });
    });
    it('should prefix each rule name with the plugin name', () => {
        const rules = getPluginRuleDefinitions(['abc']);

        expect(Object.keys(rules)[0]).toEqual(expect.stringMatching('^abc/'));
    });
    it('should work with plugin names specified by full plugin module name', () => {
        const rules = getPluginRuleDefinitions(['stricter-plugin-abc']);

        expect(rules).toEqual({
            'abc/rule-1': rule1,
        });
    });
    it('should throw if the plugin cannot be resolved', () => {
        expect(() => {
            getPluginRuleDefinitions(['does-not-exist']);
        }).toThrowErrorMatchingInlineSnapshot(
            `"Could not resolve plugin stricter-plugin-does-not-exist"`,
        );
    });
    it('should throw if plugin is missing rules', () => {
        jest.doMock('stricter-plugin-abc', () => ({}), { virtual: true });
        expect(() => {
            getPluginRuleDefinitions(['abc']);
        }).toThrowErrorMatchingInlineSnapshot(
            `"Plugin stricter-plugin-abc is missing rules export"`,
        );
    });
    it('should throw if plugin has an invalid rule definition', () => {
        jest.doMock(
            'stricter-plugin-abc',
            () => ({
                rules: {
                    'rule-1': { missing: 'onProject' },
                },
            }),
            { virtual: true },
        );
        expect(() => {
            getPluginRuleDefinitions(['abc']);
        }).toThrowErrorMatchingInlineSnapshot(`"Invalid rule definition: abc/rule-1"`);
    });
    it('should work with short version of the scoped package plugin names', () => {
        const rules = getPluginRuleDefinitions(['@something/scoped']);

        expect(rules).toEqual({
            '@something/scoped/rule-2': rule2,
        });
    });
    it('should work with long version of the scoped package plugin names', () => {
        const rules = getPluginRuleDefinitions(['@something/stricter-plugin-scoped']);

        expect(rules).toEqual({
            '@something/scoped/rule-2': rule2,
        });
    });
});
