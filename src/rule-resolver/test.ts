import ruleResolver from '.';

import * as getRuleApplicationsModule from './get-rule-applications';
import * as filterRuleDefinitionsModule from './filter-rule-definitions';
import * as getRuleDefinitionsModules from './get-rule-definitions';

const getRuleApplicationsMock = jest.fn();
const filterRuleDefinitionsMock = jest.fn();
const getRuleDefinitionsMock = jest.fn();

beforeAll(() => {
    (getRuleApplicationsModule as any).default = getRuleApplicationsMock;
    (filterRuleDefinitionsModule as any).default = filterRuleDefinitionsMock;
    (getRuleDefinitionsModules as any).default = getRuleDefinitionsMock;
});

afterEach(() => {
    getRuleApplicationsMock.mockReset();
    filterRuleDefinitionsMock.mockReset();
    getRuleDefinitionsMock.mockReset();
});

describe('ruleResolver', () => {
    it('should invoke child functions', () => {
        ruleResolver({}, 'rules-dir', ['plugin-1'], undefined);

        expect(getRuleApplicationsMock.mock.calls.length).toBe(1);
        expect(filterRuleDefinitionsMock.mock.calls.length).toBe(1);
        expect(getRuleDefinitionsMock.mock.calls.length).toBe(1);
        expect(getRuleDefinitionsMock).toHaveBeenCalledWith({}, 'rules-dir', ['plugin-1']);
    });
});
