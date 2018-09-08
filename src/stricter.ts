import { getConfig } from './config';
import { getRuleDefinitions, getRuleApplications, filterFilesToProcess } from './rule';
import { applyProjectRules, readFilesData } from './processor';
import { compactProjectLogs, getErrorCount } from './reporter';
import { listFiles } from './utils';
import { StricterArguments } from './types';

export default ({
    options: { configPath },
    reporter,
    logger: { debug, log },
}: StricterArguments): number => {
    debug({
        reporter,
        configPath,
    });

    log('Stricter: Checking...');

    debug('Read config');
    const config = getConfig(configPath);

    debug('Get file list');
    const fileList = listFiles(config.root, config.exclude);

    debug('Get rule definitions');
    const ruleDefinitions = getRuleDefinitions(config);

    debug('Get rule applications');
    const ruleApplications = getRuleApplications(config, ruleDefinitions);

    debug('Get files to process');
    const filesToProcess = filterFilesToProcess(config.root, fileList, ruleApplications);

    debug('Read files data');
    const filesData = readFilesData(filesToProcess);

    debug('Apply rules');
    const projectResult = applyProjectRules(config.root, filesData, ruleApplications);

    debug('Massage logs');
    const logs = compactProjectLogs(projectResult);

    debug('Write logs');
    reporter(logs);

    debug('Count errors');
    const result = getErrorCount(logs);

    if (result === 0) {
        log('Stricter: No errors');
    } else {
        log(`Stricter: ${result} error${result > 1 ? 's' : ''}`);
    }

    return result === 0 ? 0 : 1;
};
