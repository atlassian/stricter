import * as cosmiconfig from 'cosmiconfig';
import { CosmiConfig } from './../types';

const moduleName = 'stricter';

export default (): CosmiConfig => {
    const explorer = cosmiconfig(moduleName, {
        sync: true,
        packageProp: false,
        rc: false,
        format: 'js',
    });
    const foundConfigData = explorer.load(process.cwd());

    return foundConfigData;
};
