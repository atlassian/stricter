import { getConfig } from './config';
import { getRuleDefinitions, getRuleApplications, filterFilesToProcess } from './rule';
import { applyProjectRules, readFilesData } from './processor';
import { consoleLogger, mochaLogger, compactProjectLogs, getErrorCount } from './logger';
import { listFiles } from './utils';
import { StricterArguments, Reporter } from './types';
import debug from './debug';

export default ({
    silent = false,
    reporter = Reporter.CONSOLE,
    configPath,
}: StricterArguments): number => {
    const now = Date.now();

    debug({
        silent,
        reporter,
        configPath,
    });

    if (!silent) {
        console.log('Stricter: Checking...');
    }

    debug('Read config');
    const config = getConfig(configPath);

    debug('Get file list');
    const fileList = listFiles(config.root);

    debug('Get rule definitions');
    const ruleDefinitions = getRuleDefinitions(config);

    debug('Get rule applications');
    const ruleApplications = getRuleApplications(config, ruleDefinitions);

    debug('Get files to process');
    const filesToProcess = filterFilesToProcess(config.root, fileList, ruleApplications);

    debug('Read files data');
    const filesData = readFilesData(filesToProcess, [config.root], config.extensions);

    debug('Apply rules');
    const projectResult = applyProjectRules(config.root, filesData, ruleApplications);

    debug('Massage logs');
    const logs = compactProjectLogs(projectResult);

    debug('Write logs');
    if (reporter === Reporter.MOCHA) {
        mochaLogger(logs);
    } else {
        consoleLogger(logs);
    }

    debug('Count errors');
    const result = getErrorCount(logs);

    if (!silent) {
        if (result === 0) {
            console.log('Stricter: No errors');
        } else {
            console.log(`Stricter: ${result} error${result > 1 ? 's' : ''}`);
        }
    }

    if (debug.enabled) {
        debug('Total time: %dms', Date.now() - now);
    }

    return result;
};
