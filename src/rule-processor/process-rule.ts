import { objectFilter } from './../utils/object-filter';
import { filterFiles } from './filter-files';

import {
    FileToData,
    FileToDependency,
    Level,
    RuleDefinition,
    RuleApplicationResult,
    RuleViolationFix,
    RuleUsage,
} from './../types';

export const processRule = (
    directory: string,
    definition: RuleDefinition,
    ruleUsage: RuleUsage,
    filesData: FileToData,
    dependencies: FileToDependency,
): RuleApplicationResult => {
    const startTime = process.hrtime();
    const fileList = Object.keys(filesData);
    const filteredFiles = filterFiles(fileList, directory, ruleUsage);
    const filteredFilesData = objectFilter(filesData, filteredFiles);
    const filteredDependencies = objectFilter(dependencies, filteredFiles);

    const ruleResult = definition.onProject({
        dependencies: filteredDependencies,
        config: ruleUsage.config,
        include: ruleUsage.include,
        exclude: ruleUsage.exclude,
        files: filteredFilesData,
        rootPath: directory,
    });

    const { messages, fixes } = ruleResult.reduce(
        (acc, i) => {
            if (typeof i === 'string') {
                acc.messages.push(i);
            } else {
                acc.messages.push(i.message);

                if (i.fix) {
                    acc.fixes.push(i.fix);
                }
            }

            return acc;
        },
        { messages: [] as string[], fixes: [] as RuleViolationFix[] },
    );

    const elapsedTime = process.hrtime(startTime);
    const timeInMs = elapsedTime[0] * 1e3 + elapsedTime[1] / 1e6;

    const result: RuleApplicationResult = {
        time: timeInMs,
        warnings: [],
        errors: [],
        fixes: fixes,
    };

    if (ruleUsage.level === Level.ERROR) {
        result.errors = messages;
    } else if (ruleUsage.level === Level.OFF) {
        // do nothing
    } else {
        result.warnings = messages;
    }

    return result;
};
