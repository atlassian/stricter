import { EOL } from 'os';
import { OnProjectArgument, RuleDefinition } from '../../types';
import { Mapping } from './types';

import * as graphlib from 'graphlib';
import * as dot from 'graphlib-dot';
import createFilesGraph from './file-dependency-graph';
import createFoldersGraph from './folder-dependency-graph';
import trimNodeModules from './trim-node-modules';

const MESSAGE_HEADER =
    'The following output shows the cyclic structures found in the code in ' +
    'the Graphviz format. You can use some online tool to visualize the graph ' +
    `(e.g. http://viz-js.com/).${EOL}${EOL}`;

const getCommonPrefix = (strings: string[]) => {
    let commonPrefix = '';
    const minLength = strings.reduce((min, s) => Math.min(min, s.length), Number.MAX_VALUE);

    for (let i = 0; i < minLength; i += 1) {
        if (strings.every(s => s.charAt(i) === strings[0].charAt(i))) {
            commonPrefix += strings[0].charAt(i);
        } else {
            break;
        }
    }
    return commonPrefix;
};

const createMappedCycleMessage = (cycle: string[], mapping: Mapping, graph: graphlib.Graph) => {
    const cycleGraph = new graphlib.Graph();
    const commonPrefix = getCommonPrefix(cycle);

    cycleGraph.setGraph(`cyclic root folder: ${commonPrefix}`);
    cycle.forEach(node => cycleGraph.setNode(node.substring(commonPrefix.length, node.length)));
    cycle.forEach(node => {
        const outerEdges = graph.outEdges(node);

        if (!outerEdges) {
            return;
        }

        outerEdges
            .filter((edge: graphlib.Edge) => cycle.includes(edge.w))
            .forEach((edge: graphlib.Edge) =>
                cycleGraph.setEdge(
                    edge.v.substring(commonPrefix.length, edge.v.length),
                    edge.w.substring(commonPrefix.length, edge.w.length),
                    {
                        label: mapping(edge.v, edge.w)
                            .split(commonPrefix)
                            .join(''),
                    },
                ),
            );
    });

    const msg = dot.write(cycleGraph);

    return msg;
};

const createCycleMessage = (cycle: string[], graph: graphlib.Graph) =>
    createMappedCycleMessage(cycle, () => '', graph);

const createCyclesMessage = (cycles: string[][], graph: graphlib.Graph) =>
    cycles.map(cycle => createCycleMessage(cycle, graph)).join(`${EOL}${EOL}`);

const createMappedCyclesMessage = (cycles: string[][], mapping: Mapping, graph: graphlib.Graph) =>
    cycles.map(cycle => createMappedCycleMessage(cycle, mapping, graph)).join(`${EOL}${EOL}`);

const getFullErrorMessage = (message: string) => MESSAGE_HEADER + message;

const circularDependencies: RuleDefinition = {
    onProject: ({ config = {}, files, dependencies }: OnProjectArgument): string[] => {
        const checkSubTreeCycle = config.checkSubTreeCycle || false;
        const trimmedDependencies = trimNodeModules(dependencies);
        const fileDependencyGraph = createFilesGraph(files, trimmedDependencies);

        const fileCycles = graphlib.alg.findCycles(fileDependencyGraph);
        const cyclesMessage = createCyclesMessage(fileCycles, fileDependencyGraph);
        const fileCyclesError = fileCycles.length ? getFullErrorMessage(cyclesMessage) : undefined;

        if (checkSubTreeCycle) {
            const { graph, mapFunction } = createFoldersGraph(fileDependencyGraph);
            const subTreeResult = graphlib.alg.findCycles(graph);
            const mappedCyclesMessage = createMappedCyclesMessage(
                subTreeResult,
                mapFunction,
                graph,
            );
            const folderCyclesError = subTreeResult.length
                ? getFullErrorMessage(mappedCyclesMessage)
                : undefined;

            return [fileCyclesError, folderCyclesError].filter(Boolean) as string[];
        }

        return [fileCyclesError].filter(Boolean) as string[];
    },
};

export default circularDependencies;
