import * as debug from 'debug';

const debugWriter = debug('stricter');

export const measure = <T>(mark: string, fn: () => T): T => {
    if (!debug.enabled) {
        return fn();
    }

    const now = Date.now();
    debugWriter(`⌛ ${mark}`);
    const result = fn();
    debugWriter(`✔️ ${mark} (${Date.now() - now}ms)`);

    return result;
};

export default debugWriter;
