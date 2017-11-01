import { getConfig } from './config';
import { getRuleDefinitions, validateRuleDefinitions } from './rule';
import { readFiles } from './processor';

export default () => {
    const config = getConfig();
    const rules = getRuleDefinitions(config);
    validateRuleDefinitions(config, rules);

    return readFiles(config, rules);
};
