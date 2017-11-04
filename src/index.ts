import { getConfig } from './config';
import { getRuleDefinitions, validateRuleDefinitions } from './rule';
import { applyRules, mapFilesToRules, readFilesData } from './processor';
import { consoleLogger } from './logger';

export default (): void => {
    const config = getConfig();
    const ruleDefinitions = getRuleDefinitions(config);
    validateRuleDefinitions(config, ruleDefinitions);
    const filesToRules = mapFilesToRules(config, ruleDefinitions);
    const filesData = readFilesData(filesToRules);
    const result = applyRules(filesData, filesToRules);
    consoleLogger(result);
};
