import type { FileToDependency, CacheManager } from './types';
import { processFiles } from './file-processor';
import { getCacheManager } from './factory/get-cache-manager';

const nullCacheManager: CacheManager = {
    clear: () => {},
    get: () => ({ filesData: {} }),
    set: () => {},
};

// instantiating defaultCacheManager, because it should persist between the invocations of parseDependencies
const defaultCacheManager = getCacheManager();

export const parseDependencies = (
    files: string[],
    { useCache = false } = { useCache: false },
): FileToDependency => {
    const cacheManager = useCache ? defaultCacheManager : nullCacheManager;
    const filesData = processFiles(files, cacheManager, console);
    const result = Object.entries(filesData).reduce((acc, [filePath, data]) => {
        if (!data.ast) {
            return acc;
        }

        acc[filePath] = data.dependencies as string[];

        return acc;
    }, {} as FileToDependency);

    return result;
};
