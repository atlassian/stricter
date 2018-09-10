import getConfigLocation, { configFile } from './get-config-location';
import * as path from 'path';

jest.mock('fs');

describe('getConfigLocation', () => {
    const { existsSync } = require('fs');

    it('returns absolute path if exists', () => {
        const configPath = 'configPath.js';
        existsSync.mockReturnValueOnce(true);
        const result = getConfigLocation('', configPath);

        expect(result).toBe(configPath);
    });

    it('returns relative path if exists', () => {
        const currentPath = 'cwd';
        const configPath = 'configPath.js';
        existsSync.mockReturnValueOnce(false).mockReturnValueOnce(true);
        const result = getConfigLocation(currentPath, configPath);

        expect(result).toBe(path.join(currentPath, configPath));
    });

    it('throws if path is not found', () => {
        expect(() => {
            existsSync.mockReturnValueOnce(false).mockReturnValueOnce(false);
            getConfigLocation('', 'some-config');
        }).toThrow(/Could not find config file at/);
    });

    it('returns config from currentPath if exists', () => {
        existsSync.mockReturnValueOnce(true);
        const result = getConfigLocation('');

        expect(result).toBe(configFile);
    });

    it('returns config from parent of currentPath if exists', () => {
        const currentPath = path.join(...['foo', 'bar']);
        existsSync.mockReturnValueOnce(false).mockReturnValueOnce(true);
        const result = getConfigLocation(currentPath);

        expect(result).toBe(path.join('foo', configFile));
    });

    it('throws if no config found in hierarchy', () => {
        const currentPath = path.join(...['foo', 'bar']);
        existsSync.mockReturnValueOnce(false).mockReturnValueOnce(false);

        expect(() => {
            getConfigLocation(currentPath);
        }).toThrow(/Could not find config file/);
    });
});
