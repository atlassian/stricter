import getDebug from 'debug';
import c from 'ansi-colors';
import type { Logger } from '../types';

export const logger = (): Logger => {
    const debugWriter = getDebug('stricter');
    const debug = (message: any) => debugWriter(message);
    const log = (message: any) => console.log(message);
    const error = (message: any) => console.log(c.red(message));

    return {
        debug,
        log,
        error,
    };
};
