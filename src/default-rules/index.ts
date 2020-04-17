import type { RuleDefinitions } from './../types';
import { unusedFilesRule } from './unused-files';
import { circularDependenciesRule } from './circular-dependencies';

export const defaultRules: RuleDefinitions = {
    'stricter/unused-files': unusedFilesRule,
    'stricter/circular-dependencies': circularDependenciesRule,
};
