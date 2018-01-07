import { FileToData, FileToDependency } from './../types';
import { default as extractPathFromImportString } from './extract-path';
import { default as getImports } from './parse-imports';

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

            const imports = getImports(data.ast());
            const dependencies = [...imports.staticImports, ...imports.dynamicImports].map(i =>
                extractPathFromImportString(i, filePath, root, extensions),
            );

            return {
                ...acc,
                [filePath]: dependencies,
            };
        },
        {} as FileToDependency,
    );

    return result;
};
