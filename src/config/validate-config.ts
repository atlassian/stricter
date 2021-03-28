import ajv from 'ajv';
import * as schema from './config-schema.json';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const validateConfig = (foundConfig: any): void => {
    if (!foundConfig.config) {
        throw new Error('No config contents found');
    }

    const validator = new ajv({
        allErrors: true,
    });

    const validate = validator.compile(schema);
    const valid = validate(foundConfig.config);

    if (!valid && validate.errors) {
        throw new Error(`Invalid config: ${JSON.stringify(validate.errors, null, 2)}`);
    }
};
