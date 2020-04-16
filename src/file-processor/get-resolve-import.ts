import { CachedInputFileSystem, NodeJsInputFileSystem, ResolverFactory } from 'enhanced-resolve';
import type { ResolveImport } from '../types';
import { implicitImportedExtensions } from './constants';

export default () => {
    const resolveCache: Map<string, string> = new Map();
    const CACHE_DURATION = 8000;
    const resolver = ResolverFactory.createResolver({
        fileSystem: new CachedInputFileSystem(new NodeJsInputFileSystem(), CACHE_DURATION) as any,
        extensions: implicitImportedExtensions,
        useSyncFileSystemCalls: true,
        unsafeCache: true,
    });

    const safeResolveImport: ResolveImport = (importString, fileDir) => {
        try {
            const result = resolver.resolveSync({}, fileDir, importString);
            return result;
        } catch (e) {
            return importString;
        }
    };

    const cachedResolveImport: ResolveImport = (importString, dir) => {
        const cacheKey = `${dir}::${importString}`;
        let result: string;

        if (!resolveCache.has(cacheKey)) {
            result = safeResolveImport(importString, dir);
            resolveCache.set(cacheKey, result);
        } else {
            result = resolveCache.get(cacheKey) as string;
        }

        return result;
    };

    return cachedResolveImport;
};
