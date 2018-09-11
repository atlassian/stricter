import * as isCi from 'is-ci';
import stricter from '../stricter';
import getDebugLogger from '../logger/get-debug-logger';
import getNullLogger from '../logger/get-null-logger';
import { CliOptions, Stricter } from '../types';
import getReporter from './get-reporter';
import getConfigLocation from './get-config-location';

export default (options: CliOptions): Stricter => {
    const configPath = getConfigLocation(process.cwd(), options.config);
    const reporter = getReporter(options.reporter);
    const logger = isCi ? getNullLogger() : getDebugLogger();

    return () =>
        stricter({
            logger,
            reporter,
            options: {
                configPath,
                rulesToVerify: options.rulesToVerify,
            },
        });
};
