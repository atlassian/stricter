import { dirname, resolve } from 'path';

export default (importString: string, filePath: string, resolveRoots: string[]): string => {
    try {
        /*
            node_modules is a "safe" default
            so that node doesn't try to resolve absolute/package path as a relative one
            an issue might occur in case we require a package without index.js in root
        */
        const basePath = importString.startsWith('.')
            ? dirname(filePath)
            : resolve(filePath, '..', 'node_modules');
        const result = require.resolve(importString, {
            paths: [basePath],
        });

        return result;
    } catch (e) {}

    return importString;
};
