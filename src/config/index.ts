import { Config } from './../types';
import readConfig from './read-config';
import processConfig from './process-config';
import validateConfig from './validate-config';

export const getConfig = (): Config => {
    const foundConfig = readConfig();
    validateConfig(foundConfig);
    const processedConfig = processConfig(foundConfig);

    return processedConfig;
};
