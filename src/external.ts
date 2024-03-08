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

export const parseDependencies = async (
    files: string[],
    { useCache = false, resolve = {} } = { useCache: false, resolve: {} },
): Promise<FileToDependency> => {
    const cacheManager = useCache ? defaultCacheManager : nullCacheManager;
    const filesData = await processFiles(files, cacheManager, console, resolve);
    const result = Object.entries(filesData).reduce((acc, [filePath, data]) => {
        acc[filePath] = data.dependencies as string[];

        return acc;
    }, {} as FileToDependency);

    return result;
};
