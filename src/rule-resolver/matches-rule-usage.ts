import * as path from 'path';
import { getMatcher } from './../utils';
import { RuleUsage } from './../types';

export default (directory: string, filePath: string, ruleUsage: RuleUsage): boolean => {
    const relativePath = filePath.replace(directory + path.sep, '');
    const matchesInclude = !ruleUsage.include || getMatcher(ruleUsage.include)(relativePath);
    const matchesExclude = ruleUsage.exclude && getMatcher(ruleUsage.exclude)(relativePath);

    return matchesInclude && !matchesExclude;
};
