import { dirname } from 'path';
import type {
    FileData,
    FileToData,
    ResolveImport,
    HashFunction,
    CacheManager,
    Logger,
} from './../types';
import type { ResolveOptions } from 'enhanced-resolve';
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

const readFileData = async (
    filePath: string,
    resolveImport: ResolveImport,
    cachedFilesData: CachedStuff,
    getHash: HashFunction,
    logger: Logger,
): Promise<FileData> => {
    const source = await readFile(filePath);
    const isParsedExtension = parsedExtensionsRe.test(filePath);
    const getAst = isParsedExtension ? () => parse(filePath) : undefined;
    let dependencies: string[] | undefined;

    const hash = getHash(source);
    const cachedValue = cachedFilesData[filePath];

    if (cachedValue && cachedValue.hash === hash) {
        dependencies = cachedValue.dependencies;
    } else {
        if (isParsedExtension) {
            let parsedAst: any;
            try {
                parsedAst = parse(filePath, source);
            } catch (e) {
                logger.error(`Unable to parse ${filePath}`);
                throw e;
            }

            dependencies = getDependencies(parsedAst, filePath, resolveImport);
        }
    }

    const result = {
        source,
        ast: getAst,
        dependencies,
    };

    cachedFilesData[filePath] = {
        dependencies,
        hash,
    };

    return result;
};

export const processFiles = async (
    files: string[],
    cacheManager: CacheManager,
    logger: Logger,
    resolveOptions: Partial<ResolveOptions>,
): Promise<FileToData> => {
    const resolveImport = getResolveImport(resolveOptions);
    const cache = cacheManager.get();
    const cachedFilesData = (cache.filesData || {}) as CachedStuff;
    const getHash = getHashFunction();
    const filesData: FileToData = {};
    for (const filePath of files) {
        filesData[filePath] = await readFileData(
            filePath,
            resolveImport,
            cachedFilesData,
            getHash,
            logger,
        );
    }

    cache.filesData = cachedFilesData;
    cacheManager.set(cache);

    return filesData;
};
