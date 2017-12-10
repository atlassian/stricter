import * as fs from 'fs';
import * as path from 'path';
import { Config, FileToData, FileToDependency } from './../types';
import traverse from '@babel/traverse';

export default (filesData: FileToData, config: Config): FileToDependency => {
    const root = config.root;
    const result = Object.entries(filesData).reduce(
        (acc, [filePath, data]) => {
            const imports = getImports(data.ast);
            const dependencies = imports
                .map(i => extractPathFromImportString(i, filePath, [root]))
                .filter(i => i) as string[];

            return {
                ...acc,
                [filePath]: dependencies,
            };
        },
        {} as FileToDependency,
    );

    return result;
};

const getImports = (ast: any) => {
    const staticImports: string[] = [];
    const dynamicImports: string[] = [];

    traverse(ast, {
        enter(path: any) {
            if (path.node.type === 'ImportDeclaration') {
                staticImports.push(path.node.source.value);
            } else if (
                path.node.type === 'CallExpression' &&
                path.node.callee.type === 'Import' &&
                path.node.arguments &&
                path.node.arguments.length > 0
            ) {
                dynamicImports.push(path.node.arguments[0].value);
            }
        },
    });

    return [...staticImports, ...dynamicImports];
};

const resolveImport = (potentialImportPaths: string[]): string | undefined => {
    const result = potentialImportPaths
        .reduce(
            (acc, importPath) => [
                ...acc,
                path.join(importPath, 'index.js'),
                importPath + '.js',
                importPath,
            ],
            [] as string[],
        )
        .find(i => fs.existsSync(i));

    return result;
};

const extractPathFromImportString = (
    importString: string,
    filePath: string,
    resolveRoots: string[],
): string | undefined => {
    const potentialImportPaths = importString.startsWith('.')
        ? [path.resolve(filePath, '..', importString)]
        : resolveRoots.map(i => path.resolve(i, importString));

    const result = resolveImport(potentialImportPaths);

    return result;
};
