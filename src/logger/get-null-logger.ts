import type { Logger } from '../types';

export const logger = (): Logger => {
    const noop = () => {};

    return {
        debug: noop,
        error: noop,
        log: noop,
    };
};
