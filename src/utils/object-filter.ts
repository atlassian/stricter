export const objectFilter = <T>(
    object: { [key: string]: T },
    filter: string[],
): { [key: string]: T } => {
    const result = filter.reduce((acc, prop) => {
        acc[prop] = object[prop];
        return acc;
    }, {} as { [key: string]: T });

    return result;
};
