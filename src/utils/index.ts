import * as fs from 'fs';
import * as path from 'path';
import * as parser from '@babel/parser';

export const readFile = (i: string): string => fs.readFileSync(i, 'utf8');

export const listFiles = (directory: string, visited: { [prop: string]: true } = {}): string[] => {
    if (visited[directory]) {
        return [];
    }

    let stats = fs.lstatSync(directory);
    let realPath = directory;

    if (stats.isSymbolicLink()) {
        realPath = fs.realpathSync(directory);
        stats = fs.statSync(realPath);
    }

    // TODO: add support for multiple symlinks pointing to the same location
    // Currently, if wee have already seen the location, we will not look into it (both for symlinks and normal directories)
    if (visited[realPath]) {
        return [];
    }

    visited[realPath] = true;

    const isFile = !stats.isDirectory();

    if (isFile) {
        return [directory];
    }

    const files = fs
        .readdirSync(directory)
        .reduce((acc, f) => [...acc, ...listFiles(path.join(directory, f), visited)], []);

    return files;
};

const defaultPlugins = [
    'flow',
    'jsx',
    'doExpressions',
    'objectRestSpread',
    ['decorators', { decoratorsBeforeExport: true }],
    'classProperties',
    'classPrivateProperties',
    'classPrivateMethods',
    'exportExtensions',
    'asyncGenerators',
    'functionBind',
    'functionSent',
    'dynamicImport',
    'numericSeparator',
    'optionalChaining',
    'importMeta',
    'bigInt',
    'optionalCatchBinding',
    'throwExpressions',
    'pipelineOperator',
    'nullishCoalescingOperator',
];

export const parse = (source: string): any => {
    const plugins = defaultPlugins;

    const result = parser.parse(source, {
        plugins,
        allowImportExportEverywhere: true,
        sourceType: 'script',
    });

    return result;
};
