import { ReporterType, Reporter } from '../types';
import { consoleReporter, junitReporter, mochaReporter } from '../reporter';

export default (reporter?: string): Reporter => {
    if (reporter === ReporterType.MOCHA) {
        return mochaReporter;
    }

    if (reporter === ReporterType.JUNIT) {
        return junitReporter;
    }

    return consoleReporter;
};
