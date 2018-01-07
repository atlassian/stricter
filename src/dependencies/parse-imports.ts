// tslint:disable function-name
import { simple, NodeTypes } from 'babylon-walk';
import {
    ImportDeclaration,
    ExportNamedDeclaration,
    ExportAllDeclaration,
    CallExpression,
    Identifier,
    Node,
    StringLiteral,
} from 'babel-types';
import { ParsedImportsResult } from '../types';

export default (ast: NodeTypes): ParsedImportsResult => {
    const state: ParsedImportsResult = {
        dynamicImports: [],
        staticImports: [],
    };

    simple(
        ast,
        {
            ImportDeclaration(node: ImportDeclaration, state: ParsedImportsResult) {
                state.staticImports.push(node.source.value);
            },
            ExportNamedDeclaration(node: ExportNamedDeclaration, state: ParsedImportsResult) {
                if (node.source) {
                    state.staticImports.push(node.source.value);
                }
            },
            ExportAllDeclaration(node: ExportAllDeclaration, state: ParsedImportsResult) {
                if (node.source) {
                    state.staticImports.push(node.source.value);
                }
            },
            CallExpression(node: CallExpression, state: ParsedImportsResult) {
                const callee: Node | Identifier = node.callee;

                if (
                    callee &&
                    (callee.type === 'Import' ||
                        (callee.type === 'Identifier' &&
                            (callee as Identifier).name === 'require')) &&
                    node.arguments &&
                    node.arguments.length > 0 &&
                    node.arguments[0].type === 'StringLiteral'
                ) {
                    state.dynamicImports.push((node.arguments[0] as StringLiteral).value);
                }
            },
        },
        state,
    );

    return state;
};
