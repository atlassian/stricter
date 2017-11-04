import * as cosmiconfig from 'cosmiconfig';
import * as path from 'path';
import { Config, CosmiConfig } from './types';

const moduleName = 'stricter';

const readConfig = (): CosmiConfig => {
    const explorer = cosmiconfig(moduleName, { sync: true });
    const foundConfigData = explorer.load(process.cwd());

    return foundConfigData;
};

const validateConfig = (foundConfig: any): void => {
    if (!foundConfig) {
        throw new Error('No config found');
    }

    if (!foundConfig.config) {
        throw new Error('No config contents found');
    }

    if (!foundConfig.config.root) {
        throw new Error('No root specified');
    }
};

const processConfig = (foundConfig: CosmiConfig): Config => {
    const { config, filepath } = foundConfig;
    const resolveDir = (dir: string) => path.resolve(path.dirname(filepath), dir);

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

    return result;
};

export const getConfig = () => {
    const foundConfig = readConfig();
    validateConfig(foundConfig);
    const processedConfig = processConfig(foundConfig);

    return processedConfig;
};
