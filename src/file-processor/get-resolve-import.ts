import { ResolveImport } from '../types';
import extractPathFromImportString from './extract-path';

export default () => {
    const resolveCache: Map<string, string> = new Map();
    const resolveImport: ResolveImport = (importString: string, dir: string) => {
        const cacheKey = `${dir}::${importString}`;
        let result: string;

        if (!resolveCache.has(cacheKey)) {
            result = extractPathFromImportString(importString, dir);
            resolveCache.set(cacheKey, result);
        } else {
            result = resolveCache.get(cacheKey) as string;
        }

        return result;
    };

    return resolveImport;
};
