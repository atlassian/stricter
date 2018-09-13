import { getConfig } from './config';
import resolveFiles from './file-resolver';
import processFiles from './file-processor';
import resolveRules from './rule-resolver';
import processRules from './rule-processor';
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
    const ruleApplications = resolveRules(config.rules, config.rulesDir, rulesToVerify);

    debug('Get file list');
    const filesToProcess = resolveFiles(config.root, config.exclude, ruleApplications);

    debug('Read files data');
    const filesData = processFiles(filesToProcess, cacheManager);

    debug('Apply rules');
    const projectResult = processRules(config.root, filesData, ruleApplications);

    debug('Output report');
    reporter(projectResult);

    debug('Count errors');
    const result = getErrorCount(projectResult) === 0 ? 0 : 1;

    return result;
};
