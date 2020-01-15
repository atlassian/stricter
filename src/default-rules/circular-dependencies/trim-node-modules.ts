import { FileToDependency } from '../../types';
import { sep } from 'path';

const trimNodeModule = (path: string) => {
    const nodeModules = `${sep}node_modules${sep}`;
    const lastIndex = path.lastIndexOf(nodeModules);

    if (lastIndex === -1) {
        return path;
    }

    const pathParts = path.substring(lastIndex + nodeModules.length).split(sep);

    const result =
        pathParts[0].charAt(0) === '@' ? `${pathParts[0]}/${pathParts[1]}` : pathParts[0];

    return result;
};

export default (dependencyHash: FileToDependency) => {
    const result = Object.keys(dependencyHash).reduce((acc, key) => {
        const newKey = trimNodeModule(key);
        const value = dependencyHash[key].map(i => trimNodeModule(i));

        acc[newKey] = value;

        return acc;
    }, {} as FileToDependency);

    return result;
};
