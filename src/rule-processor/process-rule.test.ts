import processRule from './process-rule';
import * as objectFilterModule from './../utils/object-filter';
import * as filterFilesModule from './filter-files';
import { Level } from './../types';

describe('processRule', () => {
    const objectFilterMock = jest.fn();
    const filterFilesMock = jest.fn();

    beforeAll(() => {
        (objectFilterModule.default as any) = objectFilterMock;
        (filterFilesModule.default as any) = filterFilesMock;
    });

    afterEach(() => {
        objectFilterMock.mockReset();
        filterFilesMock.mockReset();
    });

    it('passes correct data into onProject', () => {
        objectFilterMock.mockImplementation((i) => i);
        filterFilesMock.mockImplementation((i) => i);

        const directory = '';
        const definitionStub = jest.fn().mockReturnValueOnce([]);
        const definition = { onProject: definitionStub };
        const ruleUsage = {
            config: {},
            include: () => {},
            exclude: () => {},
        };
        const filesData = {};
        const dependencies = {};

        processRule(directory, definition, ruleUsage, filesData, dependencies);

        expect(definitionStub.mock.calls[0][0]).toEqual({
            dependencies,
            config: ruleUsage.config,
            include: ruleUsage.include,
            exclude: ruleUsage.exclude,
            files: filesData,
            rootPath: directory,
        });
    });

    it('ignores messages if level off', () => {
        objectFilterMock.mockImplementation((i) => i);
        filterFilesMock.mockImplementation((i) => i);

        const directory = '';
        const definition = { onProject: () => [{ message: 'error' }] };
        const ruleUsage = {
            level: Level.OFF,
        };
        const filesData = {};
        const dependencies = {};

        const result = processRule(directory, definition, ruleUsage, filesData, dependencies);

        expect(result.errors).toEqual([]);
        expect(result.warnings).toEqual([]);
    });

    it('returns errors if level error', () => {
        objectFilterMock.mockImplementation((i) => i);
        filterFilesMock.mockImplementation((i) => i);

        const directory = '';
        const definition = { onProject: () => [{ message: 'error' }] };
        const ruleUsage = {
            level: Level.ERROR,
        };
        const filesData = {};
        const dependencies = {};

        const result = processRule(directory, definition, ruleUsage, filesData, dependencies);

        expect(result.errors).toEqual(['error']);
        expect(result.warnings).toEqual([]);
    });

    it('returns warnings if level warnings', () => {
        objectFilterMock.mockImplementation((i) => i);
        filterFilesMock.mockImplementation((i) => i);

        const directory = '';
        const definition = { onProject: () => [{ message: 'error' }] };
        const ruleUsage = {
            level: Level.WARNING,
        };
        const filesData = {};
        const dependencies = {};

        const result = processRule(directory, definition, ruleUsage, filesData, dependencies);

        expect(result.errors).toEqual([]);
        expect(result.warnings).toEqual(['error']);
    });

    it('collects fixes', () => {
        objectFilterMock.mockImplementation((i) => i);
        filterFilesMock.mockImplementation((i) => i);

        const directory = '';
        const fix = jest.fn();
        const definition = { onProject: () => [{ message: 'error', fix: fix }] };
        const ruleUsage = {
            level: Level.WARNING,
        };
        const filesData = {};
        const dependencies = {};

        const result = processRule(directory, definition, ruleUsage, filesData, dependencies);

        expect(result.fixes).toEqual([fix]);
    });
});
