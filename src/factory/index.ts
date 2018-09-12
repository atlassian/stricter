import * as isCi from 'is-ci';
import stricter from '../stricter';
import getDebugLogger from '../logger/get-debug-logger';
import getNullLogger from '../logger/get-null-logger';
import { CliOptions, Stricter } from '../types';
import getReporter from './get-reporter';
import getConfigLocation from './get-config-location';
import getCacheManager from './get-cache-manager';

export default (options: CliOptions): Stricter => {
    const configPath = getConfigLocation(process.cwd(), options.config);
    const reporter = getReporter(options.reporter);
    const logger = isCi ? getNullLogger() : getDebugLogger();
    const cacheManager = getCacheManager();

    return () =>
        stricter({
            logger,
            reporter,
            cacheManager,
            options: {
                configPath,
                clearCache: options.clearCache,
                rulesToVerify: options.rulesToVerify,
            },
        });
};
