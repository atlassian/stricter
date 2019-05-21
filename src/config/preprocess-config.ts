import fastGlob from 'fast-glob';
import path from 'path';
import { Config, RuleUsage, ConfigFile, RuleFn, ConfigRules, ConfigAPI } from './../types';
import { getDirResolver } from '../utils';

const getRuleUsages = (
    rulesFn: RuleFn,
    root: string,
    /* Cache is mutated */
    cache: { packages?: string[] } = {},
    packageGlobs: string[] = ['*/**'],
): RuleUsage | RuleUsage[] => {
    const pkgJsonGlobs = packageGlobs.map(p => `${p}/package.json`);
    if (!cache.packages) {
        const resolvedPackages: string[] = fastGlob
            .sync<string>([...pkgJsonGlobs, '!**/node_modules/**'], {
                cwd: root,
            })
            .map(pkgJsonPath => path.dirname(pkgJsonPath));
        cache.packages = resolvedPackages;
    }
    return rulesFn({ packages: cache.packages });
};

const transformRules = (config: ConfigAPI): ConfigRules => {
    const cache = {};

    return Object.entries(config.rules).reduce(
        (acc, [ruleName, ruleVal]) => {
            if (typeof ruleVal === 'function') {
                acc[ruleName] = getRuleUsages(ruleVal, config.root, cache, config.packages);
            } else {
                acc[ruleName] = ruleVal;
            }
            return acc;
        },
        {} as ConfigRules,
    );
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
