// This is not the actual CLI deployed with the app.
// The sole purpose of the file is to help debugging.
const run = require('.').cli;
const result = run();
process.exit(result);
