import { getConfig } from './config';
import { getRuleDefinitions } from './rule';
import { processFiles } from './processor';

export default () => {
    const config = getConfig();
    const rules = getRuleDefinitions(config);
    return processFiles(config, rules);
};
