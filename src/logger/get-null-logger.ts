import { Logger } from '../types';

export default (): Logger => {
    const noop = () => {};

    return {
        debug: noop,
        log: noop,
    };
};
