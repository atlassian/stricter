import * as fs from 'fs';
import * as path from 'path';
import * as cosmiconfig from 'cosmiconfig';
import parseJs from './parse-js';

const listFiles = (directory: string) => {
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

const readFile = (i: string) => fs.readFileSync(i, 'utf8');

const processFiles = (fileList: string[]) => {
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

const getConfig = () => {
    const moduleName = 'stricter';
    const explorer = cosmiconfig(moduleName, { sync: true });
    const foundConfigData = explorer.load(process.cwd());
    return foundConfigData ? foundConfigData : null;
};

export default () => {
    const { config, filepath } = getConfig();

    if (!config) {
        console.log('No config found');
        process.exit(1);
    }

    if (!config.root) {
        console.log('No root specified');
        process.exit(1);
    }

    const rootFolder = path.resolve(path.dirname(filepath), config.root);
    return processFiles(listFiles(rootFolder));
};
