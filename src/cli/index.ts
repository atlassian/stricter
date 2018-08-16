import * as program from 'commander';
import * as isCi from 'is-ci';
import stricter from '../stricter';
import getDebugLogger from '../get-debug-logger';
import getReporter from './get-reporter';
import getConfigLocation from './get-config-location';

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

    const configPath = getConfigLocation(process.cwd(), program.config);
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
