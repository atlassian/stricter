import fastGlob from 'fast-glob';
import path from 'path';
import { Config, ConfigFile, RuleFn, ConfigRules, ConfigAPI } from './../types';
import { getDirResolver } from '../utils';

const getPackages = (root: string, packageGlobs: string[] = ['*/**']) => {
    const pkgJsonGlobs = packageGlobs.map(p => `${p}/package.json`);
    return fastGlob
        .sync<string>([...pkgJsonGlobs, '!**/node_modules/**'], {
            cwd: root,
        })
        .map(pkgJsonPath => path.dirname(pkgJsonPath));
};

const transformRules = (config: ConfigAPI): ConfigRules => {
    const functionRules = Object.entries(config.rules).filter(
        ([, ruleVal]) => typeof ruleVal === 'function',
    ) as [string, RuleFn][];

    if (functionRules.length) {
        const packages = getPackages(config.root, config.packages);
        const functionRuleUsages = functionRules.reduce(
            (acc, [ruleName, ruleFn]) => {
                acc[ruleName] = ruleFn({ packages });
                return acc;
            },
            {} as ConfigRules,
        );
        return {
            ...config.rules,
            ...functionRuleUsages,
        } as ConfigRules;
    }

    return config.rules as ConfigRules;
};

/**
 * Preprocesses the configuration, converting any rule functions into rule usages.
 *
 * We preprocess this before validation so that we can validate the resulting rule usages.
 */
export default ({ config, filePath }: ConfigFile): Config => {
    const resolveDir = getDirResolver(filePath);
    config.root = resolveDir(config.root);

    return {
        ...config,
        root: config.root,
        rules: typeof config.rules === 'object' ? transformRules(config) : config.rules,
    };
};
