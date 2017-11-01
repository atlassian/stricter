import { Config } from './config';
import { listFiles } from './utils';

export interface RuleDefinition {
    parseJs: boolean;
    onFile: () => void;
}

const defaultRules: RuleDefinition[] = [];

export const getRules = (config: Config) => {
    if (typeof config.rulesDir !== 'undefined') {
        const customRules: RuleDefinition[] = listFiles(
            config.rulesDir,
        ).map(i => require(i));

        return [...defaultRules, ...customRules];
    }

    return defaultRules;
};
