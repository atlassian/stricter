import { getConfig } from './config';
import { getRules } from './rule';
import { processFiles } from './processor';

export default () => {
    const config = getConfig();
    const rules = getRules(config);
    return processFiles(config, rules);
};
