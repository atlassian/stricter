import resolveFrom from 'resolve-from';

export default (importString: string, fileDir: string): string => {
    try {
        const result = resolveFrom(fileDir, importString);

        return result;
    } catch (e) {
        return importString;
    }
};
