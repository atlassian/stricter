import type { FileFilter } from './../types';
import { listFiles } from './../utils';

export const resolveFiles = (
    root: string,
    include?: FileFilter,
    exclude?: FileFilter,
): string[] => {
    const fileList = listFiles(root, include, exclude);

    return fileList;
};
