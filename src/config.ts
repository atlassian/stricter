import * as cosmiconfig from 'cosmiconfig';
import * as path from 'path';

const moduleName = 'stricter';

export interface CosmiConfig {
    filepath: string;
    config: {
        [prop: string]: any;
    };
}

export enum Level {
    WARNING = 'warning',
    ERROR = 'error',
}

export interface RuleUsage {
    include?: string;
    exclude?: string;
    level?: Level;
}

export interface Config {
    root: string;
    rulesDir?: string;
    rules?: {
        [ruleName: string]: RuleUsage | RuleUsage[];
    };
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
    const resolveDir = (dir: string) =>
        path.resolve(path.dirname(foundConfig.filepath), dir);
    const result: Config = {
        ...foundConfig.config,
        root: resolveDir(foundConfig.config.root),
    };

    if (typeof result.rulesDir !== 'undefined') {
        result.rulesDir = resolveDir(result.rulesDir);
    }

    return result;
};

export const getConfig = () => {
    const foundConfig = readConfig();
    validateConfig(foundConfig);
    const processedConfig = processConfig(foundConfig);

    return processedConfig;
};
