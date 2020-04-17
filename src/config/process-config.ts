import type { Config, ValidatedConfigFile } from './../types';
import { getDirResolver } from '../utils';

export const processConfig = (foundConfig: ValidatedConfigFile): Config => {
    const { config } = foundConfig;

    const result: Config = {
        root: config.root,
        rules: config.rules,
    };

    if (config.rulesDir) {
        const resolveDir = getDirResolver(foundConfig.filePath);
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
