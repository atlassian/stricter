import { resolveFiles } from './index';
import * as utilsModule from './../utils';

const listFiles = jest.fn();

beforeAll(() => {
    (utilsModule as any).listFiles = listFiles;
});

afterEach(() => {
    listFiles.mockReset();
});

describe('resolveFiles', () => {
    it('should invoke child functions', () => {
        resolveFiles('', undefined);
        expect(listFiles.mock.calls.length).toBe(1);
    });
});
