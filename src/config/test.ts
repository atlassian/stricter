import preprocessConfig from './preprocess-config';
import processConfig from './process-config';
import readConfig from './read-config';
import validateConfig from './validate-config';
import { getConfig } from './index';

jest.mock('./read-config', () => ({
    __esModule: true,
    default: jest.fn(() => ({ config: 'readConfigResult', filePath: 'abc' })),
}));

jest.mock('./preprocess-config', () => ({
    __esModule: true,
    default: jest.fn(() => 'preprocessResult'),
}));

jest.mock('./validate-config', () => ({
    __esModule: true,
    default: jest.fn(() => 'validateResult'),
}));

jest.mock('./process-config', () => ({
    __esModule: true,
    default: jest.fn(() => 'processResult'),
}));

describe('getConfig', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should read config', () => {
        getConfig('configPath');
        expect(readConfig).toHaveBeenCalledTimes(1);
        expect(readConfig).toHaveBeenCalledWith('configPath');
    });
    it('should then preprocess config if config is found', () => {
        getConfig('configPath');
        expect(preprocessConfig).toHaveBeenCalledTimes(1);
        expect(preprocessConfig).toHaveBeenCalledWith({
            config: 'readConfigResult',
            filePath: 'abc',
        });
    });
    it('should not preprocess config if no config is found', () => {
        (readConfig as any).mockImplementationOnce(() => ({}));
        getConfig('configPath');
        expect(preprocessConfig).toHaveBeenCalledTimes(0);
    });
    it('should then validate config', () => {
        getConfig('configPath');
        expect(validateConfig).toHaveBeenCalledTimes(1);
        expect(validateConfig).toHaveBeenCalledWith({
            filePath: 'abc',
            config: 'preprocessResult',
        });
    });
    it('should then return the processed config', () => {
        const config = getConfig('configPath');
        expect(processConfig).toHaveBeenCalledTimes(1);
        expect(processConfig).toHaveBeenCalledWith({
            filePath: 'abc',
            config: 'preprocessResult',
        });
        expect(config).toBe('processResult');
    });
    it('should throw if config validation fails', () => {
        (readConfig as any).mockImplementationOnce(() => {
            throw new Error('foo');
        });
        expect(() => {
            getConfig('configPath');
        }).toThrow('foo');
    });
});
