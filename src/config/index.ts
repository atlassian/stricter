import { Config } from './../types';
import readConfig from './read-config';
import processConfig from './process-config';
import validateConfig from './validate-config';

export const getConfig = (configPath?: string): Config => {
    const foundConfig = readConfig(configPath);
    validateConfig(foundConfig);
    const processedConfig = processConfig(foundConfig);

    return processedConfig;
};
