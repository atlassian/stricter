import * as fs from 'fs';
import * as path from 'path';
import { Config, FileToData, FileToDependency } from './../types';
import traverse from '@babel/traverse';

export default (filesData: FileToData, config: Config): FileToDependency => {
    const root = config.root;
    const result = Object.entries(filesData).reduce(
        (acc, [filePath, data]) => {
            if (!data.ast) {
                return acc;
            }

            const imports = getImports(data.ast());
            const dependencies = imports.map(i =>
                extractPathFromImportString(i, filePath, [root], config.extensions),
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

const getImports = (ast: any) => {
    const staticImports: string[] = [];
    const dynamicImports: string[] = [];

    traverse(ast, {
        enter(path: any) {
            const isStaticImport =
                path.node.type === 'ImportDeclaration' ||
                ((path.node.type === 'ExportNamedDeclaration' ||
                    path.node.type === 'ExportAllDeclaration') &&
                    path.node.source);
            const isDynamicImport =
                path.node.type === 'CallExpression' &&
                (path.node.callee.type === 'Import' ||
                    (path.node.callee.type === 'Identifier' &&
                        path.node.callee.name === 'require')) &&
                path.node.arguments &&
                path.node.arguments.length > 0;

            if (isStaticImport) {
                staticImports.push(path.node.source.value);
            } else if (isDynamicImport) {
                dynamicImports.push(path.node.arguments[0].value);
            }
        },
    });

    return [...staticImports, ...dynamicImports];
};

const resolveImport = (
    potentialImportPaths: string[],
    extensions?: string[],
): string | undefined => {
    const extensionsToAdd = ['js', ...(extensions || [])];
    const result = potentialImportPaths
        .reduce(
            (acc, importPath) => [
                ...acc,
                path.join(importPath, 'index.js'),
                ...extensionsToAdd.map(i => `${importPath}.${i}`),
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
    extensions?: string[],
): string => {
    const potentialImportPaths = importString.startsWith('.')
        ? [path.resolve(filePath, '..', importString)]
        : resolveRoots.map(i => path.resolve(i, importString));

    const result = resolveImport(potentialImportPaths, extensions) || importString;

    return result;
};
