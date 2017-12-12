import { OnProjectArgument, RuleDefinition, FileToDependency } from './../../types';

type EntryType = RegExp | RegExp[] | Function;
type Seen = { [prop: string]: boolean };

const dfs = (stack: string[], dependencies: FileToDependency, seen: Seen): void => {
    while (stack.length) {
        const fileName = stack.pop() as string;
        seen[fileName] = true;

        if (dependencies[fileName]) {
            stack.push(...dependencies[fileName].filter(i => !seen[i]));
        }
    }
};

export const unusedFilesRule: RuleDefinition = {
    onProject: ({ config, dependencies, files }: OnProjectArgument) => {
        if (!config || !config.entry || !Array.isArray(config.entry)) {
            return [];
        }

        const entries: EntryType = config.entry;
        const related: EntryType = config.relatedEntry || [];

        const fileList = Object.keys(files);
        const seen: { [prop: string]: boolean } = {};

        const entryFiles = fileList.filter(i => checkForMatch(entries, i));
        dfs(entryFiles, dependencies, seen);

        const relatedFiles = fileList
            .filter(i => checkForMatch(related, i) && !seen[i])
            .filter(i => dependencies[i] && dependencies[i].some(j => seen[j]));
        dfs(relatedFiles, dependencies, seen);

        const unusedFiles = fileList.filter(i => !seen[i]);

        return unusedFiles;
    },
};

const checkForMatch = (setting: EntryType, filePath: string) => {
    if (typeof setting === 'function') {
        return setting(filePath);
    }

    const regexSetting = Array.isArray(setting) ? setting : [setting];

    return regexSetting.some(i => i.test(filePath));
};
