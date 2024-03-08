import * as fs from 'fs/promises';
import * as path from 'path';
import * as parser from '@babel/parser';
import { h32 } from 'xxhashjs';
import type { FileFilter, HashFunction, PathMatcher } from '../types';
import { parseSync } from '@babel/core';
import getDebug from 'debug';
import os from 'os';
import EventEmitter from 'events';
import { Worker, isMainThread, BroadcastChannel, parentPort } from 'worker_threads';

const debug = getDebug('stricter:utils');

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

const resultQueue = new BroadcastChannel('stricter-workers-result-queue');
const resultEmitter = new EventEmitter();
resultQueue.onmessage = (message) => {
    resultEmitter.emit('message', message);
};

let currentWorker = 0;
const workers: Worker[] = [];
if (isMainThread) {
    debug('Starting workers...');
    for (let i = 0; i < os.cpus().length; i++) {
        workers.push(
            new Worker(__filename, {
                workerData: {
                    workerId: `stricter-parser-worker-${i}`,
                },
            }),
        );
    }
}
const postWorkerMessage = (message: unknown) => {
    workers[currentWorker].postMessage(message);
    currentWorker = (currentWorker + 1) % workers.length;
};

if (!isMainThread) {
    parentPort?.on('message', (message) => {
        const data = (message as any).data as { filePath: string; source?: string };
        doParse(data.filePath, data.source)
            .then((result) => {
                resultQueue.postMessage({ result, filePath: data.filePath });
            })
            .catch((err) => {
                resultQueue.postMessage({ error: err, filePath: data.filePath });
            });
    });
}

export const doParse = async (filePath: string, source?: string): Promise<any> => {
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

export const parse = async (filePath: string, source?: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        resultEmitter.on('message', (message) => {
            const data = (message as any).data as { result?: any; error?: any; filePath: string };
            if (data.filePath !== filePath) {
                return;
            }

            if (data.error) {
                reject(data.error);
            } else {
                resolve(data.result);
            }
        });
        postWorkerMessage({ filePath, source });
    });
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
