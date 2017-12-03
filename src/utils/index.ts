import * as fs from 'fs';
import * as path from 'path';
import * as parser from 'babylon';

export const readFile = (i: string): string => fs.readFileSync(i, 'utf8');

export const listFiles = (directory: string): string[] => {
    const files = fs.statSync(directory).isDirectory()
        ? fs
              .readdirSync(directory)
              .reduce((acc, f) => [...acc, ...listFiles(path.join(directory, f))], [])
        : [directory];

    return files;
};

const defaultPlugins = [
    'flow',
    'jsx',
    'doExpressions',
    'objectRestSpread',
    'decorators',
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
