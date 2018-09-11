import getDebug from 'debug';
import { Logger } from '../types';

export default (): Logger => {
    const debugWriter = getDebug('stricter');
    const debug = (message: any) => debugWriter(message);
    const log = (message: any) => console.log(message);

    return {
        debug,
        log,
    };
};
