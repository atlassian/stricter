import * as program from 'commander';
import * as isCi from 'is-ci';
import stricter from './stricter';

export default (): number => {
    program
        .version(process.env.STRICTER_VERSION as string)
        .option('-c, --config <path>', 'specify config location')
        .option(
            '-r, --reporter <console|mocha>',
            'specify reporter',
            /^(console|mocha)$/i,
            'console',
        )
        .parse(process.argv);
    const result = stricter({
        configPath: program.config,
        reporter: program.reporter,
        silent: isCi,
    });

    return result;
};
