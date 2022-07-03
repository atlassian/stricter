import * as fs from 'fs/promises';
import * as path from 'path';
import * as parser from '@babel/parser';
import { h32 } from 'xxhashjs';
import type { FileFilter, HashFunction, PathMatcher } from '../types';
import { parseSync } from '@babel/core';

export const readFile = (i: string): Promise<string> => fs.readFile(i, 'utf8');

export const innerListFiles = async (
    directory: string,
    exclude: PathMatcher,
    visited: { [prop: string]: true },
): Promise<string[]> => {
    if (visited[directory] || exclude(directory)) {
        return Promise.resolve([]);
    }

    let stats = await fs.lstat(directory);
    let realPath = directory;

    if (stats.isSymbolicLink()) {
        realPath = await fs.realpath(directory);
        stats = await fs.stat(realPath);
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

    // TODO make this less sequential

    const files = [];
    for (const file of await fs.readdir(directory)) {
        const childFiles = await innerListFiles(path.join(directory, file), exclude, visited);
        for (const childFile of childFiles) {
            files.push(childFile);
        }
    }

    return files;
};

export const getMatcher = (filter: RegExp | RegExp[] | Function): PathMatcher => {
    if (typeof filter === 'function') {
        return ((path) => filter(path)) as PathMatcher;
    }

    const regexSetting = Array.isArray(filter) ? filter : [filter];

    return ((path) => regexSetting.some((i) => i.test(path))) as PathMatcher;
};

export const listFiles = (directory: string, exclude?: FileFilter): Promise<string[]> => {
    let excludeMatcher: PathMatcher = () => false;

    if (exclude) {
        const matcher = getMatcher(exclude);
        const rootToReplace = directory + path.sep;
        excludeMatcher = (filePath) => matcher(filePath.replace(rootToReplace, ''));
    }

    return innerListFiles(directory, excludeMatcher, {});
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

export const parse = async (filePath: string, source?: string): Promise<any> => {
    if (!source) {
        source = await readFile(filePath);
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
