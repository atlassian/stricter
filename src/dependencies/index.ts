import { FileToData, FileToDependency } from './../types';
import { default as extractPathFromImportString } from './extract-path';
import { default as getImports } from './parse-imports';

export const readDependencies = (
    ast: any,
    filePath: string,
    root: string[],
    extensions: string[] | undefined,
) => {
    const imports = getImports(ast);
    const dependencies = [...imports.staticImports, ...imports.dynamicImports].map(i =>
        extractPathFromImportString(i, filePath, root, extensions),
    );

    return dependencies;
};

export default (
    filesData: FileToData,
    root: string[],
    extensions: string[] | undefined,
): FileToDependency => {
    const result = Object.entries(filesData).reduce(
        (acc, [filePath, data]) => {
            if (!data.ast) {
                return acc;
            }

            const dependencies = readDependencies(data.ast(), filePath, root, extensions);
            acc[filePath] = dependencies;

            return acc;
        },
        {} as FileToDependency,
    );

    return result;
};
