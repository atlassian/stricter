import * as parser from 'babylon';

export default i =>
    parser.parse(i, {
        allowImportExportEverywhere: true,
        sourceType: 'script',
        plugins: [
            'jsx',
            'flow',
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
