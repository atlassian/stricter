export const objectFilter = <T>(
    object: { [key: string]: T },
    filter: string[],
): { [key: string]: T } => {
    const result = filter.reduce((acc, prop) => {
        const value = object[prop];
        if (typeof value === 'undefined' && !object.hasOwnProperty(prop)) {
            return acc;
        }
        acc[prop] = value;
        return acc;
    }, {} as { [key: string]: T });

    return result;
};
