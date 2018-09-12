import { RuleApplications, FileFilter } from './../types';
import { listFiles } from './../utils';
import filterFilesToProcess from './filter-files-to-process';

export default (
    root: string,
    exclude: FileFilter | undefined,
    ruleApplications: RuleApplications,
): string[] => {
    const fileList = listFiles(root, exclude);
    const filesToProcess = filterFilesToProcess(root, fileList, ruleApplications);

    return filesToProcess;
};
