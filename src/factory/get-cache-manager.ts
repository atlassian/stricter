import findCacheDir from 'find-cache-dir';
import FSCache from 'file-system-cache';
import * as rimraf from 'rimraf';
import type { CacheManager, CacheContents } from '../types';

const FIELD_VERSION = 'version';
const FIELD_DATA = 'data';

export const getCacheManager = (): CacheManager => {
    const currentVersion: string = process.env.STRICTER_VERSION as string;
    const CACHE_DIR = findCacheDir({ name: 'stricter' });
    const cache = FSCache({
        basePath: CACHE_DIR,
    });

    const set = (data: Object) => {
        cache.setSync(FIELD_DATA, data);
        cache.setSync(FIELD_VERSION, currentVersion);
    };

    const get = () => {
        let data: CacheContents;

        const defaultData: CacheContents = {
            filesData: {},
        };

        try {
            data = cache.getSync(FIELD_DATA) as CacheContents;
        } catch (e) {
            return defaultData;
        }

        if (!data) {
            return defaultData;
        }

        let cacheVersion;
        try {
            cacheVersion = cache.getSync(FIELD_VERSION);
        } catch (e) {
            return defaultData;
        }

        if (cacheVersion !== currentVersion) {
            return defaultData;
        }

        return data;
    };

    const clear = () => {
        rimraf.sync(CACHE_DIR);
    };

    return {
        clear,
        get,
        set,
    };
};
