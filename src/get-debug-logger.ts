import * as getDebug from 'debug';
import { Logger } from './types';

export default (): Logger => {
    const debugWriter = getDebug('stricter');
    const debug = (message: any) => debugWriter(message);
    const log = (message: any) => console.log(message);

    return {
        debug,
        log,
        measure: <T>(mark: string, fn: () => T): T => {
            if (!getDebug.enabled) {
                return fn();
            }

            const now = Date.now();
            debug(`⌛ ${mark}`);
            const result = fn();
            debug(`✔️ ${mark} (${Date.now() - now}ms)`);

            return result;
        },
    };
};
