import filterFilesToProcess from './filter-files-to-process';
import * as matchesRuleUsageModule from './../utils/matches-rule-usage';

const matchesRuleUsageMock = jest.fn();

beforeAll(() => {
    (matchesRuleUsageModule.default as any) = matchesRuleUsageMock;
});

describe('filterFilesToProcess', () => {
    afterEach(() => {
        matchesRuleUsageMock.mockReset();
    });

    it('filter files based on rule applications', () => {
        const files = ['file1', 'file2'];
        const ruleApplications = {
            rule: {
                definition: {
                    onProject: () => [],
                },
                usage: {},
            },
        };

        matchesRuleUsageMock.mockReturnValueOnce(false).mockReturnValueOnce(true);
        expect(filterFilesToProcess('', files, ruleApplications)).toEqual(['file2']);
    });

    it('filter files based on rule applications in array or plain objects', () => {
        const files = ['file1', 'file2'];
        const usage1 = {};
        const usage2 = {};
        const ruleApplications = {
            rule1: {
                definition: {
                    onProject: () => [],
                },
                usage: usage1,
            },
            rule2: {
                definition: {
                    onProject: () => [],
                },
                usage: [usage2],
            },
        };

        expect(filterFilesToProcess('', files, ruleApplications));
        expect(matchesRuleUsageMock.mock.calls[0][2]).toEqual(usage1);
        expect(matchesRuleUsageMock.mock.calls[1][2]).toEqual(usage2);
    });
});
