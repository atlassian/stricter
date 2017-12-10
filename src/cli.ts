// This is not the actual CLI deploye with the app.
// The sole purpose of the file is to help debugging.
let run = require('.').default;
let result = run();
process.exit(result);
