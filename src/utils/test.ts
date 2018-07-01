import { readFile, listFiles, parse } from '.';

jest.mock('fs');
jest.mock('path');
jest.mock('@babel/parser');

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
        const { statSync, readdirSync } = require('fs');
        const isDirectoryMock = jest
            .fn()
            .mockReturnValueOnce(true)
            .mockReturnValue(false);

        statSync.mockImplementation(() => ({
            isDirectory: isDirectoryMock,
        }));

        readdirSync.mockImplementation(() => []);

        const result = listFiles('');
        expect(result).toEqual([]);
    });

    it('returns empty array if empty subfolders', () => {
        const { statSync, readdirSync } = require('fs');
        const isDirectoryMock = jest
            .fn()
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(true)
            .mockReturnValue(false);

        statSync.mockImplementation(() => ({
            isDirectory: isDirectoryMock,
        }));

        readdirSync.mockImplementation(() => []);

        const result = listFiles('');
        expect(result).toEqual([]);
    });

    it('lists files in folder', () => {
        const { statSync, readdirSync } = require('fs');
        const { join } = require('path');
        const fileList = ['a', 'b'];
        const isDirectoryMock = jest
            .fn()
            .mockReturnValueOnce(true)
            .mockReturnValue(false);

        statSync.mockImplementation(() => ({
            isDirectory: isDirectoryMock,
        }));

        join.mockImplementation((a: string, b: string) => `${a}_${b}`);

        readdirSync.mockImplementation(() => fileList);

        const result = listFiles('test');
        expect(result).toEqual(fileList.map(i => 'test_' + i));
    });

    it('lists files in folder with subfolders', () => {
        const { statSync, readdirSync } = require('fs');
        const { join } = require('path');
        const folderList = ['folder'];
        const fileList = ['a', 'b'];
        const isDirectoryMock = jest
            .fn()
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(true)
            .mockReturnValue(false);

        statSync.mockImplementation(() => ({
            isDirectory: isDirectoryMock,
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
        expect(result).toEqual(fileList.map(i => 'test_folder_' + i));
    });
});

describe('parse', () => {
    it('passes source into @babel/parser', () => {
        const { parse: parseMock } = require('@babel/parser');
        parseMock.mockImplementation((i: string) => i);

        const src = 'test';
        const result = parse(src);

        expect(parseMock.mock.calls.length).toBe(1);
        expect(parseMock.mock.calls[0][0]).toBe(src);
        expect(result).toBe(src);
    });
});
