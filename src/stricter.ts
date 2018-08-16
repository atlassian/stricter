import { getConfig } from './config';
import { getRuleDefinitions, getRuleApplications, filterFilesToProcess } from './rule';
import { applyProjectRules, readFilesData } from './processor';
import { compactProjectLogs, getErrorCount } from './reporter';
import { listFiles } from './utils';
import { StricterArguments } from './types';

export default ({
    options: { silent, configPath },
    reporter,
    logger,
}: StricterArguments): number => {
    const result = logger.measure('Total', () => {
        logger.debug({
            silent,
            reporter,
            configPath,
        });

        if (!silent) {
            logger.log('Stricter: Checking...');
        }

        const config = logger.measure('Read config', () => getConfig(configPath));

        const fileList = logger.measure('Get file list', () =>
            listFiles(config.root, config.exclude),
        );

        const ruleDefinitions = logger.measure('Get rule definitions', () =>
            getRuleDefinitions(config),
        );

        const ruleApplications = logger.measure('Get rule applications', () =>
            getRuleApplications(config, ruleDefinitions),
        );

        const filesToProcess = logger.measure('Get files to process', () =>
            filterFilesToProcess(config.root, fileList, ruleApplications),
        );

        const filesData = logger.measure('Read files data', () => readFilesData(filesToProcess));

        const projectResult = logger.measure('Apply rules', () =>
            applyProjectRules(config.root, filesData, ruleApplications),
        );

        const logs = logger.measure('Massage logs', () => compactProjectLogs(projectResult));

        logger.measure('Write logs', () => {
            reporter(logs);
        });

        const result = logger.measure('Count errors', () => getErrorCount(logs));

        if (!silent) {
            if (result === 0) {
                logger.log('Stricter: No errors');
            } else {
                logger.log(`Stricter: ${result} error${result > 1 ? 's' : ''}`);
            }
        }

        return result === 0 ? 0 : 1;
    });

    return result;
};
