// tslint:disable function-name
// Use of fork will be removed once required features are in bablyon-walk
// https://product-fabric.atlassian.net/browse/BUILDTOOLS-333
// However, this may never occur, see: https://github.com/parcel-bundler/parcel/issues/3225
import { simple, NodeTypes } from '@wojtekmaj/babylon-walk';
import {
    ImportDeclaration,
    ExportNamedDeclaration,
    ExportAllDeclaration,
    TSImportEqualsDeclaration,
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
            TSImportEqualsDeclaration(node: NodeTypes, state: ParsedImportsResult) {
                const casted = <TSImportEqualsDeclaration>node;
                if (casted.moduleReference.type === `TSExternalModuleReference`) {
                    state.staticImports.push(casted.moduleReference.expression.value);
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
