import { FileToDependency, CacheManager } from './types';
import processFiles from './file-processor';

export const parseDependencies = (files: string[]): FileToDependency => {
    const nullCacheManager: CacheManager = {
        clear: () => {},
        get: () => ({ filesData: {} }),
        set: () => {},
    };
    const filesData = processFiles(files, nullCacheManager);
    const result = Object.entries(filesData).reduce(
        (acc, [filePath, data]) => {
            if (!data.ast) {
                return acc;
            }

            acc[filePath] = data.dependencies as string[];

            return acc;
        },
        {} as FileToDependency,
    );

    return result;
};
