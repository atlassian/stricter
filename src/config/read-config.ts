import * as cosmiconfig from 'cosmiconfig';
import { CosmiConfig } from './../types';

const moduleName = 'stricter';

export default (): CosmiConfig => {
    const explorer = cosmiconfig(moduleName, { sync: true });
    const foundConfigData = explorer.load(process.cwd());

    return foundConfigData;
};
