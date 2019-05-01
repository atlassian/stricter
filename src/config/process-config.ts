import * as path from 'path';
import { Config, ConfigFile } from './../types';

export const getDirResolver = (filepath: string) => (dir: string) =>
    path.resolve(path.dirname(filepath), dir);

export default (foundConfig: ConfigFile): Config => {
    const { config, filePath } = foundConfig;
    const resolveDir = getDirResolver(filePath);

    const result: Config = {
        root: resolveDir(config.root),
        rules: config.rules,
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
