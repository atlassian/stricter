import readConfig from './read-config';

jest.mock('app-root-path', () => {});
jest.mock('path');

describe('readConfig', () => {
    it('runs consmiconfig based on cwd', () => {
        const configPath = 'configPath1';
        const config = {};
        jest.doMock(configPath, () => config, { virtual: true });

        const { join } = require('path');

        join.mockReturnValue(configPath);

        const result = readConfig();

        expect(result.filePath).toBe(configPath);
        expect(result.config).toBe(config);
    });

    it('runs consmiconfig based on cwd', () => {
        const configPath = 'configPath2';
        const config = {};
        jest.doMock(configPath, () => config, { virtual: true });

        const result = readConfig(configPath);

        expect(result.filePath).toBe(configPath);
        expect(result.config).toBe(config);
    });
});
