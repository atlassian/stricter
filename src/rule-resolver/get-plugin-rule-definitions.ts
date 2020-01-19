import { RuleDefinitions, RuleDefinition } from '../types';

const pluginPrefix = 'stricter-plugin-';

const isValidRule = (rule: { [props: string]: any }): rule is RuleDefinition => {
    return typeof rule.onProject === 'function';
};

const normalisePluginName = (pluginName: string) => {
    const shortPluginName = pluginName.replace(pluginPrefix, '');
    const pluginNameSplitted = shortPluginName.split('/');
    const longPluginName =
        pluginNameSplitted.length === 2
            ? `${pluginNameSplitted[0]}/${pluginPrefix}${pluginNameSplitted[1]}`
            : `${pluginPrefix}${shortPluginName}`;

    return { shortPluginName, longPluginName };
};

const retrievePluginRules = (pluginName: string): RuleDefinitions => {
    const rules: RuleDefinitions = {};
    const { longPluginName, shortPluginName } = normalisePluginName(pluginName);
    let pluginModule: { [key: string]: any };
    try {
        pluginModule = require(longPluginName);
    } catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
            throw new Error(`Could not resolve plugin ${longPluginName}`);
        }
        throw e;
    }

    if (!pluginModule.rules) {
        throw new Error(`Plugin ${longPluginName} is missing rules export`);
    }
    Object.entries<{ [props: string]: unknown }>(pluginModule.rules).forEach(
        ([ruleName, ruleDef]) => {
            const qualifiedRuleName = `${shortPluginName}/${ruleName}`;
            if (!isValidRule(ruleDef)) {
                throw new Error(`Invalid rule definition: ${qualifiedRuleName}`);
            }
            rules[qualifiedRuleName] = ruleDef;
        },
    );
    return rules;
};

export default (pluginNames: string[]): RuleDefinitions => {
    return pluginNames.reduce((acc, pluginName) => {
        const pluginRules = retrievePluginRules(pluginName);
        return {
            ...acc,
            ...pluginRules,
        };
    }, {} as RuleDefinitions);
};
