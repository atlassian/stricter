#!/usr/bin/env node

const run = require('..').cli;
const result = run();
result
    .then((exitCode) => {
        process.exit(exitCode);
    })
    .catch((err) => {
        console.error(err);
        console.error(err.stack);
        process.exit(1);
    });
