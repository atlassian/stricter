import * as fs from 'fs';
import { CachedInputFileSystem, ResolverFactory } from 'enhanced-resolve';
import type { ResolveOptions } from 'enhanced-resolve';
import type { ResolveImport } from '../types';
import { implicitImportedExtensions } from './constants';

export const getResolveImport = (resolveOptions: Partial<ResolveOptions>): ResolveImport => {
    const resolveCache: Map<string, string> = new Map();
    const CACHE_DURATION = 8000;
    const resolver = ResolverFactory.createResolver({
        ...resolveOptions,
        fileSystem: new CachedInputFileSystem(fs, CACHE_DURATION) as any,
        exportsFields: [], // ignore export fields
        extensions: implicitImportedExtensions,
        useSyncFileSystemCalls: true,
        unsafeCache: true,
    });

    // Performance hack. When node checks for file presence it uses an fs operation.
    // When the operation fails, an exception is thrown - its type is analysed by node.
    // As we check file presence a lot in resolveSync, cutting stack trace and nooping
    // captureStackTrace makes up to 50% improvement.
    const originalCaptureStackTrace = Error.captureStackTrace;
    const originalStackLimit = Error.stackTraceLimit;
    const noop = () => undefined;

    const safeResolveImport: ResolveImport = (importString, fileDir) => {
        try {
            Error.captureStackTrace = noop;
            Error.stackTraceLimit = 0;
            const result = resolver.resolveSync({}, fileDir, importString);
            return result !== false ? result : importString;
        } catch (e) {
            return importString;
        } finally {
            Error.captureStackTrace = originalCaptureStackTrace;
            Error.stackTraceLimit = originalStackLimit;
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
