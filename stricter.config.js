module.exports = {
    root: 'src',
    rulesDir: 'rules',
    rules: {
        'stricter/unused-files': [{
            level: 'error',
            config: {
                entry: [
                    /.*[\\/]src[\\/]index\.ts/,
                    /.*__snapshots__.*/,
                    /.*__fixtures__.*/,
                ],
                relatedEntry: [
                    /.*test\.ts/,
                    /.*[\\/]src[\\/]start-debug\.ts/,
                ]
            }
        }],
    }
}