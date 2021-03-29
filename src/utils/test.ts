import { readFile, listFiles, parse, getDirResolver } from './index';

jest.mock('fs');
jest.mock('path');
jest.mock('@babel/parser');

afterEach(() => {
    jest.resetAllMocks();
});

describe('readFile', () => {
    it('reads file in utf8', () => {
        const fileName = 'test';
        readFile(fileName);
        const { readFileSync } = require('fs');
        expect(readFileSync.mock.calls.length).toBe(1);
        expect(readFileSync.mock.calls[0][0]).toBe(fileName);
        expect(readFileSync.mock.calls[0][1]).toBe('utf8');
    });
});

describe('listFiles', () => {
    it('returns empty array if empty folder', () => {
        const { lstatSync, readdirSync } = require('fs');
        const isDirectoryMock = jest.fn().mockReturnValueOnce(true).mockReturnValue(false);
        const isSymbolicLinkMock = jest.fn().mockReturnValue(false);

        lstatSync.mockImplementation(() => ({
            isDirectory: isDirectoryMock,
            isSymbolicLink: isSymbolicLinkMock,
        }));

        readdirSync.mockImplementation(() => []);

        const result = listFiles('');
        expect(result).toEqual([]);
    });

    it('returns empty array if empty subfolders', () => {
        const { lstatSync, readdirSync } = require('fs');
        const isDirectoryMock = jest
            .fn()
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(true)
            .mockReturnValue(false);
        const isSymbolicLinkMock = jest.fn().mockReturnValue(false);

        lstatSync.mockImplementation(() => ({
            isDirectory: isDirectoryMock,
            isSymbolicLink: isSymbolicLinkMock,
        }));

        readdirSync.mockImplementation(() => []);

        const result = listFiles('');
        expect(result).toEqual([]);
    });

    it('lists files in folder', () => {
        const { lstatSync, readdirSync } = require('fs');
        const { join } = require('path');
        const fileList = ['a', 'b'];
        const isDirectoryMock = jest.fn().mockReturnValueOnce(true).mockReturnValue(false);
        const isSymbolicLinkMock = jest.fn().mockReturnValue(false);

        lstatSync.mockImplementation(() => ({
            isDirectory: isDirectoryMock,
            isSymbolicLink: isSymbolicLinkMock,
        }));

        join.mockImplementation((a: string, b: string) => `${a}_${b}`);

        readdirSync.mockImplementation(() => fileList);

        const result = listFiles('test');
        expect(result).toEqual(fileList.map((i) => `test_${i}`));
    });

    it('lists files in folder with subfolders', () => {
        const { lstatSync, readdirSync } = require('fs');
        const { join } = require('path');
        const folderList = ['folder'];
        const fileList = ['a', 'b'];
        const isDirectoryMock = jest
            .fn()
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(true)
            .mockReturnValue(false);

        const isSymbolicLinkMock = jest.fn().mockReturnValue(false);

        lstatSync.mockImplementation(() => ({
            isDirectory: isDirectoryMock,
            isSymbolicLink: isSymbolicLinkMock,
        }));

        join.mockImplementation((a: string, b: string) => `${a}_${b}`);

        readdirSync.mockImplementation(
            jest
                .fn()
                .mockReturnValueOnce(folderList)
                .mockReturnValueOnce(fileList)
                .mockReturnValue([]),
        );

        const result = listFiles('test');
        expect(result).toEqual(fileList.map((i) => `test_folder_${i}`));
    });

    it('does not list same symlink files twice', () => {
        const { lstatSync, readdirSync, realpathSync, statSync } = require('fs');
        const { join } = require('path');
        const fileList = ['a', 'b'];

        lstatSync.mockImplementation((dir: string) => ({
            isDirectory: jest.fn(() => {
                return ['test_a', 'test_b', 'test'].includes(dir);
            }),
            isSymbolicLink: jest.fn(() => {
                return ['test_a', 'test_b'].includes(dir);
            }),
        }));

        statSync.mockImplementation(() => ({
            isDirectory: jest.fn().mockReturnValue(true),
        }));

        realpathSync.mockImplementation(() => 'real-path');

        join.mockImplementation((a: string, b: string) => `${a}_${b}`);

        readdirSync.mockImplementation((dir: string) =>
            dir === 'test' ? fileList : ['other-file'],
        );

        const result = listFiles('test');
        expect(result).toEqual(['test_a_other-file']);
    });

    it('respects exclude', () => {
        const { lstatSync, readdirSync } = require('fs');
        const { join } = require('path');
        const fileList = ['a', 'b'];
        const isDirectoryMock = jest.fn().mockReturnValueOnce(true).mockReturnValue(false);
        const isSymbolicLinkMock = jest.fn().mockReturnValue(false);

        lstatSync.mockImplementation(() => ({
            isDirectory: isDirectoryMock,
            isSymbolicLink: isSymbolicLinkMock,
        }));

        join.mockImplementation((a: string, b: string) => `${a}_${b}`);

        readdirSync.mockImplementation(() => fileList);

        const result = listFiles('test', [/a/]);
        expect(result).toEqual(['test_b']);
    });
});

describe('parse', () => {
    it('passes source into @babel/parser', () => {
        const { parse: parseMock } = require('@babel/parser');
        parseMock.mockImplementation((i: string) => i);

        const src = 'test';
        const result = parse('filePath', src);

        expect(parseMock.mock.calls.length).toBe(1);
        expect(parseMock.mock.calls[0][0]).toBe(src);
        expect(result).toBe(src);
    });

    it('reads file if not provided', () => {
        const src = 'test';
        const fileName = 'filePath';

        const { parse: parseMock } = require('@babel/parser');
        parseMock.mockImplementation((i: string) => i);

        const { readFileSync } = require('fs');
        readFileSync.mockReturnValueOnce(src);

        const result = parse(fileName);

        expect(readFileSync.mock.calls.length).toBe(1);
        expect(readFileSync.mock.calls[0][0]).toBe(fileName);
        expect(readFileSync.mock.calls[0][1]).toBe('utf8');

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
