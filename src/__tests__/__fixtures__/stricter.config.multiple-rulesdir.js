module.exports = {
    root: `${__dirname}/project/src`,
    rulesDir: [`${__dirname}/project/rules`, `${__dirname}/project/another_rules`],
    rules: {
        'stricter/unused-files': [
            {
                level: 'error',
                config: {
                    entry: [/.*\/src\/index\.js/],
                },
            },
        ],
    },
};
