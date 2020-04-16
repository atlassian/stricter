import getDebug from 'debug';
import chalk from 'chalk';
import type { Logger } from '../types';

export default (): Logger => {
    const debugWriter = getDebug('stricter');
    const debug = (message: any) => debugWriter(message);
    const log = (message: any) => console.log(message);
    const error = (message: any) => console.log(chalk.red(message));

    return {
        debug,
        log,
        error,
    };
};
