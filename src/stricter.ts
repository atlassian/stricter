import { getConfig } from './config';
import rulesResolver from './rule-resolver';
import { applyProjectRules, filterFilesToProcess, readFilesData } from './processor';
import { getErrorCount } from './reporter';
import { listFiles } from './utils';
import { StricterArguments } from './types';

export default ({
    options: { configPath, rulesToVerify },
    reporter,
    logger: { debug, log },
}: StricterArguments): number => {
    debug({
        configPath,
        rulesToVerify,
    });

    log('Checking...');

    debug('Read config');
    const config = getConfig(configPath);

    debug('Get rules');
    const ruleApplications = rulesResolver(config.rules, config.rulesDir, rulesToVerify);

    debug('Get file list');
    const fileList = listFiles(config.root, config.exclude);

    debug('Get files to process');
    const filesToProcess = filterFilesToProcess(config.root, fileList, ruleApplications);

    debug('Read files data');
    const filesData = readFilesData(filesToProcess);

    debug('Apply rules');
    const projectResult = applyProjectRules(config.root, filesData, ruleApplications);

    debug('Output report');
    reporter(projectResult);

    debug('Count errors');
    const result = getErrorCount(projectResult) === 0 ? 0 : 1;

    return result;
};
