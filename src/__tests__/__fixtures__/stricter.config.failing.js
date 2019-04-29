module.exports = {
    root: `${__dirname}/project/src`,
    rulesDir: `${__dirname}/project/rules`,
    rules: {
        'stricter/unused-files': [
            {
                level: 'error',
                config: {
                    entry: [/\/src\/bar\/index.js/],
                },
            },
        ],
    },
};
