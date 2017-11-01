import { listFiles, readFile, parse } from './utils';
import { Config } from './config';
import { RuleDefinition } from './rule';

export const processFiles = (config: Config, rules: RuleDefinition[]) => {
    if (typeof config.rules === 'undefined') {
        return;
    }

    const fileList = listFiles(config.root);

    const result = fileList.reduce((acc, filePath) => {
        const contents = readFile(filePath);

        let ast;

        try {
            ast = parse(filePath, contents);
        } catch (e) {
            console.log(`Unable to parse ${filePath}`);
        }

        return {
            ...acc,
            [filePath]: {
                contents,
                ast,
            },
        };
    }, {});

    return result;
};
