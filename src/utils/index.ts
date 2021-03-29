import * as fs from 'fs';
import * as path from 'path';
import * as parser from '@babel/parser';
import { h32 } from 'xxhashjs';
import type { FileFilter, HashFunction, PathMatcher } from '../types';
import { parseSync } from '@babel/core';

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
        return ((path) => filter(path)) as PathMatcher;
    }

    const regexSetting = Array.isArray(filter) ? filter : [filter];

    return ((path) => regexSetting.some((i) => i.test(path))) as PathMatcher;
};

export const listFiles = (directory: string, exclude?: FileFilter): string[] => {
    let excludeMatcher: PathMatcher = () => false;

    if (exclude) {
        const matcher = getMatcher(exclude);
        const rootToReplace = directory + path.sep;
        excludeMatcher = (filePath) => matcher(filePath.replace(rootToReplace, ''));
    }

    const result = innerListFiles(directory, excludeMatcher, {});

    return result;
};

// based on https://babeljs.io/docs/en/next/babel-parser.html
const defaultPlugins: parser.ParserPlugin[] = [
    'asyncGenerators',
    'bigInt',
    'classProperties',
    'classPrivateProperties',
    'classPrivateMethods',
    'decorators-legacy',
    'doExpressions',
    'dynamicImport',
    'exportDefaultFrom',
    'exportNamespaceFrom',
    'functionBind',
    'functionSent',
    'importMeta',
    'logicalAssignment',
    'nullishCoalescingOperator',
    'numericSeparator',
    'objectRestSpread',
    'optionalCatchBinding',
    'optionalChaining',
    ['pipelineOperator', { proposal: 'minimal' }],
    'throwExpressions',
] as parser.ParserPlugin[];

export const parse = (filePath: string, source?: string): any => {
    if (!source) {
        source = readFile(filePath);
    }

    const plugins = [...defaultPlugins];
    const fileType = /\.([jt])s(x?)$/.exec(filePath);

    if (fileType && fileType[1] === 't') {
        plugins.push('typescript');
        if (fileType[2] === 'x') {
            plugins.push('jsx');
        }
    } else {
        plugins.push('flow', 'flowComments', 'jsx');
    }

    const result = parser.parse(source, {
        plugins,
        allowImportExportEverywhere: true,
        sourceType: 'script',
    });

    return result;
};

export const parseWithBabelrc = (source: string, filePath: string): any => {
    const result = parseSync(source, {
        filename: filePath,
    });

    return result;
};

export const getHashFunction = (): HashFunction => {
    const hasher = h32();
    hasher.init(123);

    return ((contents) => hasher.update(contents).digest().toString(16)) as HashFunction;
};

export const getDirResolver = (filepath: string) => (dir: string): string =>
    path.resolve(path.dirname(filepath), dir);
