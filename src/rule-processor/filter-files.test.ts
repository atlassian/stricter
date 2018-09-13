import filterFiles from './filter-files';
import * as matchesRuleUsageModule from './../utils/matches-rule-usage';

describe('filterFiles', () => {
    const matchesRuleUsageMock = jest.fn();

    beforeAll(() => {
        (matchesRuleUsageModule.default as any) = matchesRuleUsageMock;
    });

    afterEach(() => {
        matchesRuleUsageMock.mockReset();
    });

    it('filters files based on matchesRuleUsage', () => {
        matchesRuleUsageMock.mockImplementation((directory: string, filePath: string) => {
            return filePath === 'b';
        });

        const result = filterFiles(['a', 'b'], '', {});

        expect(result).toEqual(['b']);
    });

    it('passes arguments through to matchesRuleUsage', () => {
        const directory = 'directory';
        const files = ['a'];
        const ruleUsage = {};
        filterFiles(files, directory, ruleUsage);

        expect(matchesRuleUsageMock.mock.calls[0]).toEqual([directory, 'a', ruleUsage]);
    });
});
