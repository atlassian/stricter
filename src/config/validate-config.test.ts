import { validateConfig } from './validate-config';

describe('validateConfig', () => {
    it('throws if no config field is present', () => {
        expect(() => {
            validateConfig({});
        }).toThrow();
    });

    it('throws if empty config is provided', () => {
        expect(() => {
            validateConfig({ config: {} });
        }).toThrow();
    });

    it('throws if unpreprocessed rule functions are passed', () => {
        expect(() => {
            validateConfig({
                config: {
                    root: 'src',
                    rules: {},
                },
            });
        }).not.toThrow();
        expect(() => {
            validateConfig({
                config: {
                    root: 'src',
                    rules: {
                        abc: () => ({}),
                    },
                },
            });
        }).toThrow();
    });
});
