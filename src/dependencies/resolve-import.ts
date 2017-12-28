import * as fs from 'fs';
import * as path from 'path';

export default (potentialImportPaths: string[], extensions?: string[]): string | undefined => {
    const extensionsToAdd = ['js', ...(extensions || [])];
    const result = potentialImportPaths
        .reduce(
            (acc, importPath) => [
                ...acc,
                path.join(importPath, 'index.js'),
                ...extensionsToAdd.map(i => `${importPath}.${i}`),
                importPath,
            ],
            [] as string[],
        )
        .find(i => fs.existsSync(i) && !fs.lstatSync(i).isDirectory());

    return result;
};
