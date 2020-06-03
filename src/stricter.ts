import { getConfig } from './config';
import { resolveFiles } from './file-resolver';
import { processFiles } from './file-processor';
import { resolveRules } from './rule-resolver';
import { processRules } from './rule-processor';
import { processFixes } from './fix-processor';
import { getErrorCount } from './reporter';
import type { StricterArguments } from './types';

export const stricter = ({
    options: { configPath, rulesToVerify, clearCache, fix },
    cacheManager,
    reporter,
    logger,
}: StricterArguments): number => {
    const { debug, log } = logger;

    debug({
        configPath,
        rulesToVerify,
    });
    if (clearCache) {
        debug('Clear cache');
        cacheManager.clear();

        return 0;
    }

    log('Checking...');

    debug('Read config');
    const config = getConfig(configPath);

    debug('Get file list');
    const filesToProcess = resolveFiles(config.root, config.exclude);

    debug('Read files data');
    const filesData = processFiles(filesToProcess, cacheManager, logger, config.resolve || {});

    debug('Get rules');
    const ruleApplications = resolveRules(
        config.rules,
        config.rulesDir,
        config.plugins,
        rulesToVerify,
    );

    debug('Apply rules');
    const projectResult = processRules(config.root, filesData, ruleApplications);

    if (fix) {
        log('Fixing...');
        debug('Apply fixes');
        processFixes(projectResult, logger);

        return 0;
    }

    debug('Output report');
    reporter(projectResult);

    debug('Count errors');
    const result = getErrorCount(projectResult) === 0 ? 0 : 1;

    return result;
};
