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
            ImportDeclaration(node: NodeTypes, state: ParsedImportsResult) {
                const casted = <ImportDeclaration>node;
                state.staticImports.push(casted.source.value);
            },
            ExportNamedDeclaration(node: NodeTypes, state: ParsedImportsResult) {
                const casted = <ExportNamedDeclaration>node;
                if (casted.source) {
                    state.staticImports.push(casted.source.value);
                }
            },
            ExportAllDeclaration(node: NodeTypes, state: ParsedImportsResult) {
                const casted = <ExportAllDeclaration>node;
                if (casted.source) {
                    state.staticImports.push(casted.source.value);
                }
            },
            CallExpression(node: NodeTypes, state: ParsedImportsResult) {
                const casted = <CallExpression>node;

                const callee: Node | Identifier = casted.callee;

                if (
                    callee &&
                    (callee.type === 'Import' ||
                        (callee.type === 'Identifier' &&
                            (callee as Identifier).name === 'require')) &&
                    casted.arguments &&
                    casted.arguments.length > 0 &&
                    casted.arguments[0].type === 'StringLiteral'
                ) {
                    state.dynamicImports.push((casted.arguments[0] as StringLiteral).value);
                }
            },
        },
        state,
    );

    return state;
};
