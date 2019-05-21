import ajv from 'ajv';
import * as schema from './config-schema.json';
import { ValidatedConfigFile } from '../types';

export default (foundConfig: any): foundConfig is ValidatedConfigFile => {
    if (!foundConfig) {
        throw new Error('No config found');
    }

    if (!foundConfig.config) {
        throw new Error('No config contents found');
    }

    const validator = new ajv({
        errorDataPath: 'configuration',
        allErrors: true,
    });

    const validate = validator.compile(schema);
    const valid = validate(foundConfig.config);

    if (!valid && validate.errors) {
        throw new Error(`Invalid config: ${JSON.stringify(validate.errors, null, 2)}`);
    }

    return true;
};
