import traverse from '@babel/traverse';

export default (ast: any) => {
    const staticImports: string[] = [];
    const dynamicImports: string[] = [];

    traverse(ast, {
        enter(path: any) {
            const isStaticImport =
                path.node.type === 'ImportDeclaration' ||
                ((path.node.type === 'ExportNamedDeclaration' ||
                    path.node.type === 'ExportAllDeclaration') &&
                    path.node.source);
            const isDynamicImport =
                path.node.type === 'CallExpression' &&
                (path.node.callee.type === 'Import' ||
                    (path.node.callee.type === 'Identifier' &&
                        path.node.callee.name === 'require')) &&
                path.node.arguments &&
                path.node.arguments.length > 0;

            if (isStaticImport) {
                staticImports.push(path.node.source.value);
            } else if (isDynamicImport) {
                dynamicImports.push(path.node.arguments[0].value);
            }
        },
    });

    return [...staticImports, ...dynamicImports];
};
