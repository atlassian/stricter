import getConfig from './get-config';
import { listFiles, processFiles } from './utils';

export default () => {
    const config = getConfig();
    return processFiles(listFiles(config.root));
};
