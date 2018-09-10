import { dirname } from 'path';
import * as resolveFrom from 'resolve-from';

export default (importString: string, filePath: string): string => {
    try {
        const result = resolveFrom(dirname(filePath), importString);

        return result;
    } catch (e) {}

    return importString;
};
