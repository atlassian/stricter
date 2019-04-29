/**
 * Integration tests
 */

import path from 'path';
import getStricter from '../factory';

describe('Stricter', () => {
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => null);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should report no errors when no rules or rulesDir specified', () => {
        const stricter = getStricter({
            config: path.resolve(`${__dirname}/__fixtures__/stricter.config.no-rules.js`),
            reporter: undefined,
            rulesToVerify: undefined,
            clearCache: undefined,
        });

        stricter();
        expect(console.log).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenCalledWith('No errors');
    });

    it('should report no errors when default rules and rulesDir are specified', () => {
        const stricter = getStricter({
            config: path.resolve(`${__dirname}/__fixtures__/stricter.config.success.js`),
            reporter: undefined,
            rulesToVerify: undefined,
            clearCache: undefined,
        });

        stricter();
        expect(console.log).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenCalledWith('No errors');
    });

    it('should report no errors when default rules and multiple rulesDir are specified', () => {
        const stricter = getStricter({
            config: path.resolve(`${__dirname}/__fixtures__/stricter.config.multiple-rulesdir.js`),
            reporter: undefined,
            rulesToVerify: undefined,
            clearCache: undefined,
        });

        stricter();
        expect(console.log).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenCalledWith('No errors');
    });

    it('should report errors when a rule violation occurs', () => {
        const stricter = getStricter({
            config: path.resolve(`${__dirname}/__fixtures__/stricter.config.failing.js`),
            reporter: undefined,
            rulesToVerify: undefined,
            clearCache: undefined,
        });

        stricter();
        expect(console.log).toHaveBeenCalledTimes(3);
        expect(console.log).toHaveBeenNthCalledWith(
            1,
            expect.stringMatching(
                /.*error:.*stricter\/unused-files.*__fixtures__\/project\/src\/foo\/index.js/,
            ),
        );
        expect(console.log).toHaveBeenNthCalledWith(
            2,
            expect.stringMatching(
                /.*error:.*stricter\/unused-files.*__fixtures__\/project\/src\/index.js/,
            ),
        );
        expect(console.log).toHaveBeenNthCalledWith(3, '2 errors');
    });
});
