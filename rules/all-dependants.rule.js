module.exports = {
    onProject: ({ dependencies }) => {
        const result = Object.entries(dependencies).reduce((acc, [file, imports]) => {
            imports.forEach((i) => {
                const arr = (acc[i] = acc[i] || []);
                arr.push(file);
            });

            return acc;
        }, {});

        return [JSON.stringify(result)];
    },
};
