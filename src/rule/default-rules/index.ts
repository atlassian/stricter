import { FileToData, FileToDependency, RuleDefinition, RuleUsageConfig } from './../../types';

export const unusedFilesRule: RuleDefinition = {
    onProject: (
        config: RuleUsageConfig,
        projectData: FileToData,
        dependencies: FileToDependency,
    ) => {
        if (!config.entry || !Array.isArray(config.entry)) {
            return [];
        }

        const fileList = Object.keys(projectData);
        const stack = fileList.filter(i =>
            config.entry.some((j: RegExp[] | Function) => checkForMatch(j, i)),
        );
        const seen: { [prop: string]: boolean } = {};

        while (stack.length) {
            const fileName = stack.pop() as string;
            seen[fileName] = true;
            if (dependencies[fileName]) {
                stack.push(...dependencies[fileName].filter(i => !seen[i]));
            }
        }

        const unusedFiles = fileList.filter(i => !seen[i]);

        return unusedFiles;
    },
};

const checkForMatch = (setting: RegExp[] | Function, filePath: string) => {
    if (typeof setting === 'function') {
        return setting(filePath);
    }

    const regexSetting = Array.isArray(setting) ? setting : [setting];

    return regexSetting.some(i => i.test(filePath));
};
