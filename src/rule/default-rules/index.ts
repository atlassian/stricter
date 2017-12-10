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

        const entryPointRe: RegExp[] = config.entry.map((i: string) => new RegExp(i));
        const fileList = Object.keys(projectData);
        const stack = fileList.filter(i => entryPointRe.some(j => j.test(i)));
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
