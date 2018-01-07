// tslint:disable function-name
import traverse, { NodePath } from '@babel/traverse';
import { ParsedImportsResult } from '../types';

export default (ast: any): ParsedImportsResult => {
    const state: ParsedImportsResult = {
        dynamicImports: [],
        staticImports: [],
    };

    traverse(
        ast,
        {
            Identifier(path: NodePath) {
                /* to get access to path */
            },

            ImportDeclaration(path: NodePath, state: ParsedImportsResult) {
                state.staticImports.push(path.node.source.value);
            },
            ExportNamedDeclaration(path: NodePath, state: ParsedImportsResult) {
                if (path.node.source) {
                    state.staticImports.push(path.node.source.value);
                }
            },
            ExportAllDeclaration(path: NodePath, state: ParsedImportsResult) {
                if (path.node.source) {
                    state.staticImports.push(path.node.source.value);
                }
            },
            CallExpression(path: NodePath, state: ParsedImportsResult) {
                if (
                    path.node.callee &&
                    (path.node.callee.type === 'Import' ||
                        (path.node.callee.type === 'Identifier' &&
                            path.node.callee.name === 'require')) &&
                    path.node.arguments &&
                    path.node.arguments.length > 0
                ) {
                    state.dynamicImports.push(path.node.arguments[0].value);
                }
            },
        },
        null,
        state,
    );

    return state;
};
