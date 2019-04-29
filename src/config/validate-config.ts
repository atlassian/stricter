import ajv from 'ajv';
import * as schema from './config-schema.json';

export default (foundConfig: any): void => {
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
};
