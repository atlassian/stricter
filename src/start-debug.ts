// This is not the actual CLI deployed with the app.
// The sole purpose of the file is to help debugging.
import { cli } from '.';
const result = cli();
result
    .then((exitCode) => {
        process.exit(exitCode);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
