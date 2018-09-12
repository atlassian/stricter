import * as yargs from 'yargs';
import getStricter from '../factory';

export default (): number => {
    const argv = yargs
        .version(process.env.STRICTER_VERSION as string)
        .option('config', {
            alias: 'c',
            description: 'Specify config location',
            string: true,
            requiresArg: true,
        })
        .option('reporter', {
            alias: 'r',
            description: 'Specify reporter',
            choices: ['console', 'mocha', 'junit'],
            requiresArg: true,
        })
        .option('rule', {
            description: 'Verify particular rule',
            array: true,
            requiresArg: true,
        })
        .option('clearCache', {
            description: 'Clears cache',
        }).argv;

    const stricter = getStricter({
        config: argv.config,
        reporter: argv.reporter,
        rulesToVerify: argv.rule,
        clearCache: argv.clearCache,
    });

    const result = stricter();

    return result;
};
