// This is not the actual CLI deployed with the app.
// The sole purpose of the file is to help debugging.
let run = require('.').cli;
let result = run();
process.exit(result);
