import { Graph } from 'graphlib';
import { FileToData, FileToDependency } from '../../types';

export default (files: FileToData, dependencies: FileToDependency): Graph => {
    const graph = new Graph();
    const fileNames = Object.keys(files);

    fileNames.forEach((fileName) => graph.setNode(fileName));
    fileNames.forEach((fileName) => {
        const fileDeps = dependencies[fileName];

        if (fileDeps && fileDeps.length) {
            fileDeps.forEach((depFileName) => {
                if (graph.hasNode(depFileName)) {
                    graph.setEdge(fileName, depFileName);
                }
            });
        }
    });

    return graph;
};
