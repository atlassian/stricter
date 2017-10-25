import * as parser from 'babylon';

export default (source: string) =>
    parser.parse(source, {
        allowImportExportEverywhere: true,
        sourceType: 'script',
        plugins: [
            'jsx',
            'flow',
            'typescript',
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
        ],
    });
