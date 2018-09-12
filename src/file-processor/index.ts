import { dirname } from 'path';
import { FileData, FileToData, ParsedImportsResult, ResolveImport } from './../types';
import { readFile, parse } from './../utils';
import { default as getImports } from './parse-imports';
import getResolveImport from './get-resolve-import';

const readFileData = (filePath: string, resolveImport: ResolveImport): FileData => {
    const source = readFile(filePath);
    const fileDir = dirname(filePath);
    // We parse .js-files only at the moment
    const ast = filePath.endsWith('.js') ? () => parse(source, filePath) : undefined;
    let dependencies: string[] | undefined;
    let imports: ParsedImportsResult | undefined;

    if (ast) {
        try {
            const parsedAst = ast();
            imports = getImports(parsedAst);
            dependencies = imports.staticImports
                .concat(imports.dynamicImports)
                .map(i => resolveImport(i, fileDir));
        } catch (e) {
            console.error(`Unable to parse ${filePath}`);
            throw e;
        }
    }

    return {
        source,
        ast,
        dependencies,
    };
};

export default (files: string[]): FileToData => {
    const resolveImport = getResolveImport();
    const filesData = files.reduce(
        (acc, filePath) => {
            acc[filePath] = readFileData(filePath, resolveImport);

            return acc;
        },
        {} as FileToData,
    );

    return filesData;
};
