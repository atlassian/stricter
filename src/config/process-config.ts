import * as path from 'path';
import { Config, CosmiConfig } from './../types';

export const getDirResolver = (filepath: string) => (dir: string) =>
    path.resolve(path.dirname(filepath), dir);

export default (foundConfig: CosmiConfig): Config => {
    const { config, filepath } = foundConfig;
    const resolveDir = getDirResolver(filepath);

    const result: Config = {
        root: resolveDir(config.root),
        rules: {},
    };

    if (config.rulesDir) {
        result.rulesDir = resolveDir(config.rulesDir);
    }

    if (config.rules) {
        result.rules = config.rules;
    }

    if (config.extensions) {
        result.extensions = config.extensions;
    }

    if (config.exclude) {
        result.exclude = config.exclude;
    }

    return result;
};
