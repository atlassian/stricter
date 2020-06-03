import { dirname } from 'path';
import type {
    FileData,
    FileToData,
    ResolveImport,
    HashFunction,
    CacheManager,
    Logger,
    ResolverOption,
} from './../types';
import { getHashFunction, readFile, parse } from './../utils';
import { parseImports } from './parse-imports';
import { getResolveImport } from './get-resolve-import';
import { parsedExtensionsRe } from './constants';

interface CachedStuff {
    [fileName: string]: {
        hash: string;
        dependencies: string[] | undefined;
    };
}

const getDependencies = (ast: any, filePath: string, resolveImport: ResolveImport): string[] => {
    const fileDir = dirname(filePath);
    const imports = parseImports(ast);
    const result = imports.staticImports
        .concat(imports.dynamicImports)
        .map((i) => resolveImport(i, fileDir));

    return result;
};

const readFileData = (
    filePath: string,
    resolveImport: ResolveImport,
    cachedFilesData: CachedStuff,
    getHash: HashFunction,
    logger: Logger,
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
                logger.error(`Unable to parse ${filePath}`);
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

export const processFiles = (
    files: string[],
    cacheManager: CacheManager,
    logger: Logger,
    resolveOptions: ResolverOption,
): FileToData => {
    const resolveImport = getResolveImport(resolveOptions);
    const cache = cacheManager.get();
    const cachedFilesData = (cache.filesData || {}) as CachedStuff;
    const getHash = getHashFunction();
    const filesData = files.reduce((acc, filePath) => {
        acc[filePath] = readFileData(filePath, resolveImport, cachedFilesData, getHash, logger);

        return acc;
    }, {} as FileToData);

    cache.filesData = cachedFilesData;
    cacheManager.set(cache);

    return filesData;
};
