import cosmiconfig from 'cosmiconfig';
import { CosmiConfig } from './../types';

const moduleName = 'stricter';

export default (configPath?: string): CosmiConfig => {
    const explorer = cosmiconfig(moduleName, {
        searchPlaces: [`${moduleName}.config.js`],
    });

    const foundConfigData = configPath ? explorer.loadSync(configPath) : explorer.searchSync();

    return foundConfigData;
};
