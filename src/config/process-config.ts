import fastGlob from 'fast-glob';
import * as path from 'path';
import { Config, ConfigFile, ConfigRules, ConfigRulesFn } from './../types';

export const getDirResolver = (filepath: string) => (dir: string) =>
    path.resolve(path.dirname(filepath), dir);

const getRules = (
    rulesFn: ConfigRulesFn,
    root: string,
    packages: string[] = ['*/**'],
): ConfigRules => {
    const pkgJsonGlobs = packages.map(p => `${p}/package.json`);
    const resolvedPackages: string[] = fastGlob
        .sync<string>([...pkgJsonGlobs, '!**/node_modules/**'], {
            cwd: root,
        })
        .map(pkgJsonPath => path.dirname(pkgJsonPath));
    return rulesFn({ packages: resolvedPackages });
};

export default (foundConfig: ConfigFile): Config => {
    const { config, filePath } = foundConfig;
    const resolveDir = getDirResolver(filePath);
    const root = resolveDir(config.root);

    const rules =
        typeof config.rules === 'function'
            ? getRules(config.rules, root, config.packages)
            : config.rules;

    const result: Config = {
        root,
        rules,
    };

    if (config.rulesDir) {
        result.rulesDir = Array.isArray(config.rulesDir)
            ? config.rulesDir.map(resolveDir)
            : resolveDir(config.rulesDir);
    }

    if (config.exclude) {
        result.exclude = config.exclude;
    }

    if (config.plugins) {
        result.plugins = config.plugins;
    }

    return result;
};
