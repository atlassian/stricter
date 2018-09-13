import { RuleDefinitions } from './../types';
import unusedFilesRule from './unused-files';
import circularDependenciesRule from './circular-dependencies';

const defaultRules: RuleDefinitions = {
    'stricter/unused-files': unusedFilesRule,
    'stricter/circular-dependencies': circularDependenciesRule,
};

export default defaultRules;
