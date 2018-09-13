import { Logger } from '../types';

export default (): Logger => {
    const noop = () => {};

    return {
        debug: noop,
        error: noop,
        log: noop,
    };
};
