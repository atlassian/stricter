import * as cosmiconfig from 'cosmiconfig';
import * as path from 'path';

const moduleName = 'stricter';

export interface CosmiConfig {
    filepath: string;
    config: {
        [prop: string]: any;
    };
}

export interface Config {
    root: string;
}

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
    const result = {
        ...foundConfig.config,
        root: path.resolve(
            path.dirname(foundConfig.filepath),
            foundConfig.config.root,
        ),
    };

    return result;
};

export default () => {
    const foundConfig = readConfig();
    validateConfig(foundConfig);
    const processedConfig = processConfig(foundConfig);

    return processedConfig;
};
