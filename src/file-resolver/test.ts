import fileResolver from '.';
import * as utilsModule from './../utils';

const listFiles = jest.fn();

beforeAll(() => {
    (utilsModule as any).listFiles = listFiles;
});

afterEach(() => {
    listFiles.mockReset();
});

describe('fileResolver', () => {
    it('should invoke child functions', () => {
        fileResolver('', undefined);
        expect(listFiles.mock.calls.length).toBe(1);
    });
});
