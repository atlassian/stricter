import { getConfig } from './config';
import getRuleApplications from './rule-resolver';
import getFileList from './file-resolver';
import processFiles from './file-processor';
import { applyProjectRules } from './processor';
import { getErrorCount } from './reporter';
import { StricterArguments } from './types';

export default ({
    options: { configPath, rulesToVerify, clearCache },
    cacheManager,
    reporter,
    logger: { debug, log },
}: StricterArguments): number => {
    debug({
        configPath,
        rulesToVerify,
    });

    log('Checking...');

    if (clearCache) {
        debug('Clear cache');
        cacheManager.clear();
    }

    debug('Read config');
    const config = getConfig(configPath);

    debug('Get rules');
    const ruleApplications = getRuleApplications(config.rules, config.rulesDir, rulesToVerify);

    debug('Get file list');
    const filesToProcess = getFileList(config.root, config.exclude, ruleApplications);

    debug('Read files data');
    const filesData = processFiles(filesToProcess, cacheManager);

    debug('Apply rules');
    const projectResult = applyProjectRules(config.root, filesData, ruleApplications);

    debug('Output report');
    reporter(projectResult);

    debug('Count errors');
    const result = getErrorCount(projectResult) === 0 ? 0 : 1;

    return result;
};
