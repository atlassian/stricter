import fileResolver from '.';
import * as utilsModule from './../utils';
import * as filterFilesToProcessModule from './filter-files-to-process';

const listFiles = jest.fn();
const filterFilesToProcessMock = jest.fn();

beforeAll(() => {
    (utilsModule as any).listFiles = listFiles;
    (filterFilesToProcessModule as any).default = filterFilesToProcessMock;
});

afterEach(() => {
    listFiles.mockReset();
    filterFilesToProcessMock.mockReset();
});

describe('fileResolver', () => {
    it('should invoke child functions', () => {
        fileResolver('', undefined, {});

        expect(listFiles.mock.calls.length).toBe(1);
        expect(filterFilesToProcessMock.mock.calls.length).toBe(1);
    });
});
