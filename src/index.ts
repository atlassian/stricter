import * as fs from 'fs';
import * as path from 'path';
import parseJs from './parse-js';

const listFiles = directory => {
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

const readFile = i => fs.readFileSync(i, 'utf8');

const processFiles = fileList => {
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

export default params => processFiles(listFiles(params.rootFolder));
