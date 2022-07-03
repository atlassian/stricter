import type { FileFilter } from './../types';
import { listFiles } from './../utils';

export const resolveFiles = (root: string, exclude: FileFilter | undefined): Promise<string[]> =>
    listFiles(root, exclude);
