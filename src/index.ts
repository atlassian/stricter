import { getConfig } from './config';
import { getRuleDefinitions, getRuleApplications } from './rule';
import { applyFileRules, applyProjectRules, mapFilesToRules, readFilesData } from './processor';
import { consoleLogger } from './logger';
import { listFiles } from './utils';

export default (): number => {
    const config = getConfig();

    const fileList = listFiles(config.root);

    const ruleDefinitions = getRuleDefinitions(config);
    const ruleApplications = getRuleApplications(config, ruleDefinitions);

    const filesToRules = mapFilesToRules(fileList, ruleApplications);
    const filesData = readFilesData(filesToRules);
    const fileResult = applyFileRules(filesData, filesToRules);
    const projectResult = applyProjectRules(filesData, ruleApplications);

    return consoleLogger(fileResult, projectResult);
};
