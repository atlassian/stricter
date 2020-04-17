import type { Config, ValidatedConfigFile } from './../types';
import { preprocessConfig } from './preprocess-config';
import { processConfig } from './process-config';
import { readConfig } from './read-config';
import { validateConfig } from './validate-config';

export const getConfig = (configPath?: string): Config => {
    const foundConfig = readConfig(configPath);
    const preprocessedConfig = {
        ...foundConfig,
        config: foundConfig && foundConfig.config ? preprocessConfig(foundConfig) : undefined,
    };
    validateConfig(preprocessedConfig);

    const processedConfig = processConfig(preprocessedConfig as ValidatedConfigFile);
    return processedConfig;
};
