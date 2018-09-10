import * as program from 'commander';
import getStricter from '../factory';

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

    const stricter = getStricter({
        config: program.config,
        reporter: program.reporter,
    });

    const result = stricter();

    return result;
};
