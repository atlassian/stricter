import * as yargs from 'yargs';
import getStricter from '../factory';

export default (): number => {
    const argv = yargs
        .version(process.env.STRICTER_VERSION as string)
        .option('c', {
            alias: 'config',
            description: 'Specify config location',
            string: true,
            requiresArg: true,
        })
        .option('r', {
            alias: 'reporter',
            description: 'Specify reporter',
            choices: ['console', 'mocha', 'junit'],
            requiresArg: true,
        })
        .option('v', {
            alias: 'verify',
            description: 'Verify particular rule',
            array: true,
            requiresArg: true,
        }).argv;

    const stricter = getStricter({
        config: argv.config,
        reporter: argv.reporter,
        rulesToVerify: argv.verify,
    });

    const result = stricter();

    return result;
};
