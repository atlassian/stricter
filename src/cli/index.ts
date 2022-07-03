import * as yargs from 'yargs';
import { getStricter } from '../factory';

export const cli = (): Promise<number> => {
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
            string: true,
            requiresArg: true,
        })
        .option('clearCache', {
            description: 'Clears cache',
            boolean: true,
        })
        .option('fix', {
            description: 'Apply fixes for rule violations',
            boolean: true,
        }).argv;

    const stricter = getStricter({
        config: argv.config,
        reporter: argv.reporter,
        rulesToVerify: argv.rule,
        clearCache: argv.clearCache,
        fix: argv.fix,
    });

    return stricter();
};
