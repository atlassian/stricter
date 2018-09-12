import { RuleDefinitions } from './../types';
import { unusedFilesRule } from './unused-files';

const defaultRules: RuleDefinitions = {
    'stricter/unused-files': unusedFilesRule,
};

export default defaultRules;
