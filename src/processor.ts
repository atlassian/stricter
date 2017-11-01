import { listFiles, readFile, parse } from './utils';
import { Config, RuleUsage } from './config';
import { RuleDefinitions, RuleRequirement } from './rule';

const matchesRuleUsage = (filePath: string, ruleUsage: RuleUsage): boolean => {
    const matchesInclude = !ruleUsage.include || new RegExp(ruleUsage.include).test(filePath);
    const matchesExclude = ruleUsage.exclude && new RegExp(ruleUsage.exclude).test(filePath);

    return matchesInclude && !matchesExclude;
};

const readFileData = (filePath: string, requirement: RuleRequirement) => {
    if (requirement === RuleRequirement.NONE) {
        return {
            [filePath]: {},
        };
    }

    const contents = readFile(filePath);

    if (requirement === RuleRequirement.CONTENTS) {
        return {
            [filePath]: {
                contents,
            },
        };
    }

    const ast = parse(filePath, contents);

    return {
        [filePath]: {
            contents,
            ast,
        },
    };
};

export const readFiles = (config: Config, rules: RuleDefinitions) => {
    if (!config.rules) {
        return;
    }

    const fileList = listFiles(config.root);

    const result = fileList.reduce((acc, filePath) => {
        const matchingRules = Object.keys(config.rules).filter((name: string) => {
            const ruleUsage = config.rules[name];

            return (
                (Array.isArray(ruleUsage) && ruleUsage.some(i => matchesRuleUsage(filePath, i))) ||
                (!Array.isArray(ruleUsage) && matchesRuleUsage(filePath, ruleUsage))
            );
        });

        const requirement: RuleRequirement =
            matchingRules.indexOf(RuleRequirement.AST) !== -1
                ? RuleRequirement.AST
                : matchingRules.indexOf(RuleRequirement.CONTENTS) !== -1
                  ? RuleRequirement.CONTENTS
                  : RuleRequirement.NONE;

        return {
            ...acc,
            ...readFileData(filePath, requirement),
        };
    }, {});

    return result;
};
