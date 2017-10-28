import * as fs from 'fs';
import * as path from 'path';
import parseJs from './parse-js';

export const readFile = (i: string) => fs.readFileSync(i, 'utf8');

export const listFiles = (directory: string): string[] => {
    const files = fs.statSync(directory).isDirectory()
        ? fs
              .readdirSync(directory)
              .reduce(
                  (acc, f) => [...acc, ...listFiles(path.join(directory, f))],
                  [],
              )
        : [directory];

    return files;
};

export const processFiles = (fileList: string[]) => {
    const result = fileList.reduce((acc, i) => {
        const contents = readFile(i);
        const ast = parseJs(contents);

        return {
            ...acc,
            [i]: {
                contents,
                ast,
            },
        };
    }, {});

    return result;
};
