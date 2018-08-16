import * as fs from 'fs';
import * as path from 'path';

export const configFile = 'stricter.config.js';

export default (currentPath: string, configPath?: string): string => {
    if (configPath) {
        if (fs.existsSync(configPath)) {
            return configPath;
        }

        const relativePath = path.join(currentPath, configPath);
        if (fs.existsSync(relativePath)) {
            return relativePath;
        }

        throw new Error(`Could not find config file at ${configPath}`);
    }

    let dir = currentPath;
    let currentConfigPath = path.join(dir, configFile);

    while (!fs.existsSync(currentConfigPath)) {
        const parentDir = path.dirname(dir);
        if (dir === parentDir) {
            throw new Error(`Could not find config file(${configFile})`);
        }

        dir = parentDir;
        currentConfigPath = path.join(dir, configFile);
    }

    return currentConfigPath;
};
