import validateConfig from './validate-config';

describe('validateConfig', () => {
    it('throws if falsy value is passed', () => {
        expect(() => {
            validateConfig(undefined);
        }).toThrow();
        expect(() => {
            validateConfig(null);
        }).toThrow();
    });

    it('throws if no config field is present', () => {
        expect(() => {
            validateConfig({});
        }).toThrow();
    });

    it('throws if no config.root field is present', () => {
        expect(() => {
            validateConfig({ config: {} });
        }).toThrow();
    });
});
