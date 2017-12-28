import * as path from 'path';
import { default as resolveImport } from './resolve-import';

export default (
    importString: string,
    filePath: string,
    resolveRoots: string[],
    extensions?: string[],
): string => {
    const potentialImportPaths = importString.startsWith('.')
        ? [path.resolve(filePath, '..', importString)]
        : resolveRoots.map(i => path.resolve(i, importString));

    const result = resolveImport(potentialImportPaths, extensions) || importString;

    return result;
};
