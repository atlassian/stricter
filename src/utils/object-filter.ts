export default <T>(object: { [key: string]: T }, filter: string[]): { [key: string]: T } => {
    const set = new Set(filter);
    const result = Object.keys(object)
        .filter(i => set.has(i))
        .reduce(
            (acc, prop) => {
                acc[prop] = object[prop];
                return acc;
            },
            {} as { [key: string]: T },
        );

    return result;
};
