export default (foundConfig: any): void => {
    if (!foundConfig) {
        throw new Error('No config found');
    }

    if (!foundConfig.config) {
        throw new Error('No config contents found');
    }

    if (!foundConfig.config.root) {
        throw new Error('No root specified');
    }
};
