import type { FileFilter } from './../types';
import { listFiles } from './../utils';

export const resolveFiles = (root: string, exclude: FileFilter | undefined): string[] => {
    const fileList = listFiles(root, exclude);

    return fileList;
};
