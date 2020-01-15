import { dirname } from 'path';
import { FileData, FileToData, ResolveImport, HashFunction, CacheManager } from './../types';
import { getHashFunction, readFile, parse } from './../utils';
import { default as getImports } from './parse-imports';
import getResolveImport from './get-resolve-import';
import { parsedExtensionsRe } from './constants';

interface CachedStuff {
    [fileName: string]: {
        hash: string;
        dependencies: string[] | undefined;
    };
}

const getDependencies = (ast: any, filePath: string, resolveImport: ResolveImport): string[] => {
    const fileDir = dirname(filePath);
    const imports = getImports(ast);
    const result = imports.staticImports
        .concat(imports.dynamicImports)
        .map(i => resolveImport(i, fileDir));

    return result;
};

const readFileData = (
    filePath: string,
    resolveImport: ResolveImport,
    cachedFilesData: CachedStuff,
    getHash: HashFunction,
): FileData => {
    const source = readFile(filePath);
    const ast = parsedExtensionsRe.test(filePath) ? () => parse(source, filePath) : undefined;
    let dependencies: string[] | undefined;

    const hash = getHash(source);
    const cachedValue = cachedFilesData[filePath];

    if (cachedValue && cachedValue.hash === hash) {
        dependencies = cachedValue.dependencies;
    } else {
        if (ast) {
            let parsedAst: any;
            try {
                parsedAst = ast();
            } catch (e) {
                console.error(`Unable to parse ${filePath}`);
                throw e;
            }

            dependencies = getDependencies(parsedAst, filePath, resolveImport);
        }
    }

    const result = {
        source,
        ast,
        dependencies,
    };

    cachedFilesData[filePath] = {
        dependencies,
        hash,
    };

    return result;
};

export default (files: string[], cacheManager: CacheManager): FileToData => {
    const resolveImport = getResolveImport();
    const cache = cacheManager.get();
    const cachedFilesData = (cache.filesData || {}) as CachedStuff;
    const getHash = getHashFunction();
    const filesData = files.reduce((acc, filePath) => {
        acc[filePath] = readFileData(filePath, resolveImport, cachedFilesData, getHash);

        return acc;
    }, {} as FileToData);

    cache.filesData = cachedFilesData;
    cacheManager.set(cache);

    return filesData;
};
