import * as fs from 'fs';
import * as path from 'path';
import * as parser from '@babel/parser';
import { FileFilter, PathMatcher } from '../types';

export const readFile = (i: string): string => fs.readFileSync(i, 'utf8');

export const innerListFiles = (
    directory: string,
    exclude: PathMatcher,
    visited: { [prop: string]: true },
): string[] => {
    if (visited[directory] || exclude(directory)) {
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
    if (visited[realPath] || exclude(realPath)) {
        return [];
    }

    visited[realPath] = true;

    const isFile = !stats.isDirectory();

    if (isFile) {
        return [directory];
    }

    const files = fs
        .readdirSync(directory)
        .reduce(
            (acc, f) => [...acc, ...innerListFiles(path.join(directory, f), exclude, visited)],
            [],
        );

    return files;
};

export const getMatcher = (filter: RegExp | RegExp[] | Function): PathMatcher => {
    if (typeof filter === 'function') {
        return path => filter(path);
    }

    const regexSetting = Array.isArray(filter) ? filter : [filter];

    return path => regexSetting.some(i => i.test(path));
};

export const listFiles = (directory: string, exclude?: FileFilter): string[] => {
    let excludeMatcher: PathMatcher = () => false;

    if (exclude) {
        const matcher = getMatcher(exclude);
        const rootToReplace = directory + path.sep;
        excludeMatcher = filePath => matcher(filePath.replace(rootToReplace, ''));
    }

    const result = innerListFiles(directory, excludeMatcher, {});

    return result;
};

// based on https://babeljs.io/docs/en/next/babel-parser.html
const defaultPlugins = [
    'flow',
    'jsx',
    'flowComments',
    'doExpressions',
    'objectRestSpread',
    ['decorators', { decoratorsBeforeExport: true }],
    'classProperties',
    'classPrivateProperties',
    'classPrivateMethods',
    'exportDefaultFrom',
    'exportNamespaceFrom',
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
    ['pipelineOperator', { proposal: 'minimal' }],
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
