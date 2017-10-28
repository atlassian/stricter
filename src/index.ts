import { readConfig, processConfig } from './config';
import { listFiles, processFiles } from './utils';

export default () => {
    const foundConfig = readConfig();
    const processedConfig = processConfig(foundConfig);
    return processFiles(listFiles(processedConfig.root));
};
