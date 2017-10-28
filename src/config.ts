import * as cosmiconfig from 'cosmiconfig';
import * as path from 'path';

const moduleName = 'stricter';

export interface Config {
    root: string;
}

export const readConfig = () => {
    const explorer = cosmiconfig(moduleName, { sync: true });
    const foundConfigData = explorer.load(process.cwd());

    return foundConfigData;
};

export const processConfig = (foundConfig: any): Config => {
    if (!foundConfig) {
        console.log('No config found');
        process.exit(1);
    }

    if (!foundConfig.config) {
        console.log('No config contents ащгтв');
        process.exit(1);
    }

    if (!foundConfig.config.root) {
        console.log('No root specified');
        process.exit(1);
    }

    const result = {
        ...foundConfig.config,
        root: path.resolve(
            path.dirname(foundConfig.filepath),
            foundConfig.config.root,
        ),
    };

    return result;
};
