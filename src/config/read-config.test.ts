import readConfig from './read-config';

const mockLocation = 'location';
const mockConfigData = {};
process.cwd = jest.fn().mockReturnValue(mockLocation);

jest.mock('cosmiconfig', () =>
    jest.fn().mockReturnValue({
        load: jest.fn(val => {
            if (val === mockLocation) {
                return mockConfigData;
            }
        }),
    }),
);

describe('readConfig', () => {
    it('runs consmiconfig based on cwd', () => {
        const result = readConfig();
        expect(result).toBe(mockConfigData);
    });
});
