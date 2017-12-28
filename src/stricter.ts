import { getConfig } from './config';
import { getRuleDefinitions, getRuleApplications, filterFilesToProcess } from './rule';
import { applyProjectRules, readFilesData } from './processor';
import { default as readDependencies } from './dependencies';
import { consoleLogger, mochaLogger, compactProjectLogs, getErrorCount } from './logger';
import { listFiles } from './utils';
import { StricterArguments, Reporter } from './types';

export default ({
    silent = false,
    reporter = Reporter.CONSOLE,
    configPath,
}: StricterArguments): number => {
    if (!silent) {
        console.log('Stricter: Checking...');
    }

    const config = getConfig(configPath);

    const fileList = listFiles(config.root);

    const ruleDefinitions = getRuleDefinitions(config);
    const ruleApplications = getRuleApplications(config, ruleDefinitions);
    const filesToProcess = filterFilesToProcess(config.root, fileList, ruleApplications);

    const filesData = readFilesData(filesToProcess);
    const dependencies = readDependencies(filesData, [config.root], config.extensions);
    const projectResult = applyProjectRules(config.root, filesData, dependencies, ruleApplications);

    const logs = compactProjectLogs(projectResult);

    if (reporter === Reporter.MOCHA) {
        mochaLogger(logs);
    } else {
        consoleLogger(logs);
    }

    const result = getErrorCount(logs);

    if (!silent) {
        if (result === 0) {
            console.log('Stricter: No errors');
        } else {
            console.log(`Stricter: ${result} error${result > 1 ? 's' : ''}`);
        }
    }

    return result;
};
