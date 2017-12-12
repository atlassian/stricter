import { getConfig } from './config';
import { getRuleDefinitions, getRuleApplications, filterFilesToProcess } from './rule';
import { applyProjectRules, readDependencies, readFilesData } from './processor';
import { consoleLogger } from './logger';
import { listFiles } from './utils';

export default (): number => {
    console.log('Stricter: Checking...');
    const config = getConfig();

    const fileList = listFiles(config.root);

    const ruleDefinitions = getRuleDefinitions(config);
    const ruleApplications = getRuleApplications(config, ruleDefinitions);
    const filesToProcess = filterFilesToProcess(config.root, fileList, ruleApplications);

    const filesData = readFilesData(filesToProcess);
    const dependencies = readDependencies(filesData, config);
    const projectResult = applyProjectRules(config.root, filesData, dependencies, ruleApplications);

    const result = consoleLogger(projectResult);

    if (result === 0) {
        console.log('Stricter: No errors');
    }

    return result;
};
