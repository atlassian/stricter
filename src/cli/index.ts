import * as program from 'commander';
import * as isCi from 'is-ci';
import stricter from '../stricter';
import { Reporter } from '../types';
import getDebugLogger from '../get-debug-logger';

export const locateConfig = (configPath?: string) => {
    return configPath;
};

export const getReporter = (reporter?: string) => {
    if (program.reporter === Reporter.MOCHA) {
        return Reporter.MOCHA;
    }

    if (reporter === Reporter.JUNIT) {
        return Reporter.JUNIT;
    }

    return Reporter.CONSOLE;
};

export default (): number => {
    program
        .version(process.env.STRICTER_VERSION as string)
        .option('-c, --config <path>', 'specify config location')
        .option(
            '-r, --reporter <console|mocha|junit>',
            'specify reporter',
            /^(console|mocha|junit)$/i,
            'console',
        )
        .parse(process.argv);

    const configPath = locateConfig(program.config);
    const reporter = getReporter(program.reporter);
    const logger = getDebugLogger();

    const result = stricter({
        logger,
        reporter,
        options: {
            configPath,
            silent: isCi,
        },
    });

    return result;
};
