import objectFilter from './../utils/object-filter';
import filterFiles from './filter-files';

import {
    FileToData,
    FileToDependency,
    Level,
    RuleDefinition,
    RuleUsage,
    RuleApplicationResult,
} from './../types';

export default (
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

    const ruleMessages = definition.onProject({
        dependencies: filteredDependencies,
        config: ruleUsage.config,
        include: ruleUsage.include,
        exclude: ruleUsage.exclude,
        files: filteredFilesData,
        rootPath: directory,
    });

    const elapsedTime = process.hrtime(startTime);
    const timeInMs = elapsedTime[0] * 1e3 + elapsedTime[1] / 1e6;

    const result: RuleApplicationResult = {
        time: timeInMs,
        warnings: [],
        errors: [],
    };

    if (ruleUsage.level === Level.ERROR) {
        result.errors = ruleMessages;
    } else if (ruleUsage.level === Level.OFF) {
        // do nothing
    } else {
        result.warnings = ruleMessages;
    }

    return result;
};
