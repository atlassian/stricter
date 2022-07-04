import { readFile, listFiles, parse, getDirResolver } from './index';

jest.mock('fs/promises');
jest.mock('path');
jest.mock('@babel/parser');

afterEach(() => {
    jest.resetAllMocks();
});

describe('readFile', () => {
    it('reads file in utf8', async () => {
        const fileName = 'test';
        await readFile(fileName);
        const { readFile: readFileMock } = require('fs/promises');
        expect(readFileMock.mock.calls.length).toBe(1);
        expect(readFileMock.mock.calls[0][0]).toBe(fileName);
        expect(readFileMock.mock.calls[0][1]).toBe('utf8');
    });
});

describe('listFiles', () => {
    it('returns empty array if empty folder', async () => {
        const { lstat, readdir } = require('fs/promises');
        const isDirectoryMock = jest.fn().mockReturnValueOnce(true).mockReturnValue(false);
        const isSymbolicLinkMock = jest.fn().mockReturnValue(false);

        lstat.mockImplementation(() =>
            Promise.resolve({
                isDirectory: isDirectoryMock,
                isSymbolicLink: isSymbolicLinkMock,
            }),
        );

        readdir.mockImplementation(() => Promise.resolve([]));

        const result = await listFiles('');
        expect(result).toEqual([]);
    });

    it('returns empty array if empty subfolders', async () => {
        const { lstat, readdir } = require('fs/promises');
        const isDirectoryMock = jest
            .fn()
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(true)
            .mockReturnValue(false);
        const isSymbolicLinkMock = jest.fn().mockReturnValue(false);

        lstat.mockImplementation(() =>
            Promise.resolve({
                isDirectory: isDirectoryMock,
                isSymbolicLink: isSymbolicLinkMock,
            }),
        );

        readdir.mockImplementation(() => Promise.resolve([]));

        const result = await listFiles('');
        expect(result).toEqual([]);
    });

    it('lists files in folder', async () => {
        const { lstat, readdir } = require('fs/promises');
        const { join } = require('path');
        const fileList = ['a', 'b'];
        const isDirectoryMock = jest.fn().mockReturnValueOnce(true).mockReturnValue(false);
        const isSymbolicLinkMock = jest.fn().mockReturnValue(false);

        lstat.mockImplementation(() =>
            Promise.resolve({
                isDirectory: isDirectoryMock,
                isSymbolicLink: isSymbolicLinkMock,
            }),
        );

        join.mockImplementation((a: string, b: string) => `${a}_${b}`);

        readdir.mockImplementation(() => Promise.resolve(fileList));

        const result = await listFiles('test');
        expect(result).toEqual(fileList.map((i) => `test_${i}`));
    });

    it('lists files in folder with subfolders', async () => {
        const { lstat, readdir } = require('fs/promises');
        const { join } = require('path');
        const folderList = ['folder'];
        const fileList = ['a', 'b'];
        const isDirectoryMock = jest
            .fn()
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(true)
            .mockReturnValue(false);

        const isSymbolicLinkMock = jest.fn().mockReturnValue(false);

        lstat.mockImplementation(() =>
            Promise.resolve({
                isDirectory: isDirectoryMock,
                isSymbolicLink: isSymbolicLinkMock,
            }),
        );

        join.mockImplementation((a: string, b: string) => `${a}_${b}`);

        readdir.mockImplementation(
            jest
                .fn()
                .mockReturnValueOnce(Promise.resolve(folderList))
                .mockReturnValueOnce(Promise.resolve(fileList))
                .mockReturnValue(Promise.resolve([])),
        );

        const result = await listFiles('test');
        expect(result).toEqual(fileList.map((i) => `test_folder_${i}`));
    });

    it('does not list same symlink files twice', async () => {
        const { lstat, readdir, realpath, stat } = require('fs/promises');
        const { join } = require('path');
        const fileList = ['a', 'b'];

        lstat.mockImplementation((dir: string) =>
            Promise.resolve({
                isDirectory: jest.fn(() => {
                    return ['test_a', 'test_b', 'test'].includes(dir);
                }),
                isSymbolicLink: jest.fn(() => {
                    return ['test_a', 'test_b'].includes(dir);
                }),
            }),
        );

        stat.mockImplementation(() =>
            Promise.resolve({
                isDirectory: jest.fn().mockReturnValue(true),
            }),
        );

        realpath.mockImplementation(() => Promise.resolve('real-path'));

        join.mockImplementation((a: string, b: string) => `${a}_${b}`);

        readdir.mockImplementation((dir: string) =>
            Promise.resolve(dir === 'test' ? fileList : ['other-file']),
        );

        const result = await listFiles('test');
        expect(result).toEqual(['test_a_other-file']);
    });

    it('respects exclude', async () => {
        const { lstat, readdir } = require('fs/promises');
        const { join } = require('path');
        const fileList = ['a', 'b'];
        const isDirectoryMock = jest.fn().mockReturnValueOnce(true).mockReturnValue(false);
        const isSymbolicLinkMock = jest.fn().mockReturnValue(false);

        lstat.mockImplementation(() =>
            Promise.resolve({
                isDirectory: isDirectoryMock,
                isSymbolicLink: isSymbolicLinkMock,
            }),
        );

        join.mockImplementation((a: string, b: string) => `${a}_${b}`);

        readdir.mockImplementation(() => Promise.resolve(fileList));

        const result = await listFiles('test', [/a/]);
        expect(result).toEqual(['test_b']);
    });
});

describe('parse', () => {
    it('passes source into @babel/parser', async () => {
        const { parse: parseMock } = require('@babel/parser');
        parseMock.mockImplementation((i: string) => i);

        const src = 'test';
        const result = await parse('filePath', src);

        expect(parseMock.mock.calls.length).toBe(1);
        expect(parseMock.mock.calls[0][0]).toBe(src);
        expect(result).toBe(src);
    });

    it('reads file if not provided', async () => {
        const src = 'test';
        const fileName = 'filePath';

        const { parse: parseMock } = require('@babel/parser');
        parseMock.mockImplementation((i: string) => i);

        const { readFile } = require('fs/promises');
        readFile.mockReturnValueOnce(Promise.resolve(src));

        const result = await parse(fileName);

        expect(readFile.mock.calls.length).toBe(1);
        expect(readFile.mock.calls[0][0]).toBe(fileName);
        expect(readFile.mock.calls[0][1]).toBe('utf8');

        expect(parseMock.mock.calls.length).toBe(1);
        expect(parseMock.mock.calls[0][0]).toBe(src);
        expect(result).toBe(src);
    });
});

describe('getDirResolver', () => {
    const mockDirname = 'mockDirname';

    beforeAll(() => {
        const { dirname, resolve } = require('path');

        dirname.mockImplementation((dirName: string) => {
            if (dirName === mockDirname) {
                return mockDirname;
            }
        });
        resolve.mockImplementation((dirName: string, dir: string) => {
            if (dirName === mockDirname) {
                return dir;
            }
        });
    });

    it('resolves files relative to mockDirName', () => {
        const dirResolver = getDirResolver(mockDirname);

        expect(dirResolver('test')).toBe('test');
    });
});
