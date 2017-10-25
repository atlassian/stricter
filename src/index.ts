import { getBaseDir, getConfig, listFiles, processFiles } from './utils';

export default () => {
    const { config, filepath } = getConfig();

    if (!config) {
        console.log('No config found');
        process.exit(1);
    }

    if (!config.root) {
        console.log('No root specified');
        process.exit(1);
    }

    const rootFolder = getBaseDir(config, filepath);
    return processFiles(listFiles(rootFolder));
};
