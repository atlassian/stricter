import { getConfig } from './config';
import { getRuleDefinitions, getRuleApplications, filterFilesToProcess } from './rule';
import { applyProjectRules, readFilesData } from './processor';
import { consoleLogger } from './logger';
import { listFiles } from './utils';

export default (): number => {
    const config = getConfig();

    const fileList = listFiles(config.root);

    const ruleDefinitions = getRuleDefinitions(config);
    const ruleApplications = getRuleApplications(config, ruleDefinitions);
    const filesToProcess = filterFilesToProcess(fileList, ruleApplications);

    const filesData = readFilesData(filesToProcess);
    const projectResult = applyProjectRules(filesData, ruleApplications);

    return consoleLogger(projectResult);
};
