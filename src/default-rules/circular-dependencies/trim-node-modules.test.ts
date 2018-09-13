import { join } from 'path';
import trimNodeModules from './trim-node-modules';

describe(trimNodeModules, () => {
    it('Trims node_module path both in keys and values', () => {
        const testPath = join('Users', 'src', 'test.js');
        const testExpectedPath = testPath;

        const lodashPath = join('Users', 'src', 'node_modules', 'lodash', 'index.js');
        const lodashExpectedPath = 'lodash';

        const buttonPath = join(
            'Users',
            'src',
            'some-other-package',
            'node_modules',
            '@atlaskit',
            'button',
            'index.js',
        );
        const buttonExpectedPath = '@atlaskit/button';

        const result = trimNodeModules({
            [testPath]: [testPath],
            [lodashPath]: [lodashPath],
            [buttonPath]: [buttonPath],
        });

        expect(result).toEqual({
            [testExpectedPath]: [testExpectedPath],
            [lodashExpectedPath]: [lodashExpectedPath],
            [buttonExpectedPath]: [buttonExpectedPath],
        });
    });
});
