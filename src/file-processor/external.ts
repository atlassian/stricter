import { FileToData, FileToDependency } from '../types';
import { default as extractPathFromImportString } from './extract-path';
import { default as getImports } from './parse-imports';

const readDependencies = (ast: any, fileDir: string): string[] => {
    const imports = getImports(ast);
    const dependencies = [...imports.staticImports, ...imports.dynamicImports].map(i =>
        extractPathFromImportString(i, fileDir),
    );

    return dependencies;
};

export const externalUseReadDependencies = (filesData: FileToData): FileToDependency => {
    const result = Object.entries(filesData).reduce(
        (acc, [filePath, data]) => {
            if (!data.ast) {
                return acc;
            }

            const dependencies = readDependencies(data.ast(), filePath);
            acc[filePath] = dependencies;

            return acc;
        },
        {} as FileToDependency,
    );

    return result;
};
