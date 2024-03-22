import { EOL } from 'os';
import type { OnProjectArgument, RuleDefinition, RuleResultEntry } from '../../types';
import type { Mapping } from './types';

import * as graphlib from 'graphlib';
import * as dot from 'graphlib-dot';
import { createFilesGraph } from './file-dependency-graph';
import { createFoldersGraph } from './folder-dependency-graph';
import { trimNodeModules } from './trim-node-modules';

const MESSAGE_HEADER =
    'The following output shows the cyclic structures found in the code in ' +
    'the Graphviz format. You can use some online tool to visualize the graph ' +
    `(e.g. http://viz-js.com/ ).${EOL}${EOL}`;

const getCommonPrefix = (strings: string[]) => {
    let commonPrefix = '';
    const minLength = strings.reduce((min, s) => Math.min(min, s.length), Number.MAX_VALUE);

    for (let i = 0; i < minLength; i += 1) {
        if (strings.every((s) => s.charAt(i) === strings[0].charAt(i))) {
            commonPrefix += strings[0].charAt(i);
        } else {
            break;
        }
    }
    return commonPrefix;
};

export const validateRegistries = (maybeRegistries: string | string[] | undefined): string[] => {
    const error = 'Invalid config: registries should be an array or a string';

    if (!maybeRegistries) {
        return [];
    }

    if (Array.isArray(maybeRegistries)) {
        if (maybeRegistries.some((registry) => typeof registry !== 'string'))
            throw new Error(error);
        return maybeRegistries;
    } else if (typeof maybeRegistries === 'string') {
        return [maybeRegistries];
    } else {
        throw new Error(error);
    }
};

export const createNodeName = (node: string, commonPrefix: string): string =>
    node.substring(commonPrefix.length, node.length) || commonPrefix;

const createUserOutput = (
    commonPrefix: string,
    cycleGraph: graphlib.Graph,
    cycle: string[],
): string =>
    `cyclic root folder: ${commonPrefix}${EOL}${dot.write(cycleGraph)}${EOL}Cycle:${cycle.join(
        ' -> ',
    )}`;

function findShortestCycle(graph: graphlib.Graph): string[] | null {
    let shortestCycle: string[] | null = null;
    function dfs(node: string, visited: string[], allNodes: string[]): void {
        visited.push(node);
        allNodes.push(node);

        const successors = graph.successors(node);
        if (successors) {
            for (const successor of successors) {
                if (!visited.includes(successor)) {
                    dfs(successor, visited, allNodes);
                } else if (allNodes[0] === successor) {
                    if (!shortestCycle || allNodes.length < shortestCycle.length) {
                        shortestCycle = [...allNodes];
                    }
                }
            }
        }

        visited.pop();
        allNodes.pop();
    }

    for (const node of graph.nodes()) {
        dfs(node, [], []);
    }

    return shortestCycle;
}

const createMappedCycleMessage = (cycle: string[], mapping: Mapping, graph: graphlib.Graph) => {
    const cycleGraph = new graphlib.Graph();
    const commonPrefix = getCommonPrefix(cycle);

    cycleGraph.setGraph(commonPrefix);
    cycle.forEach((node) => cycleGraph.setNode(createNodeName(node, commonPrefix)));
    cycle.forEach((node) => {
        const outerEdges = graph.outEdges(node);

        if (!outerEdges) {
            return;
        }

        outerEdges
            .filter((edge: graphlib.Edge) => cycle.includes(edge.w))
            .forEach((edge: graphlib.Edge) =>
                cycleGraph.setEdge(
                    createNodeName(edge.v, commonPrefix),
                    createNodeName(edge.w, commonPrefix),
                    {
                        label: mapping(edge.v, edge.w).split(commonPrefix).join(''),
                    },
                ),
            );
    });

    return createUserOutput(commonPrefix, cycleGraph, findShortestCycle(cycleGraph) || []);
};

const createCycleMessage = (cycle: string[], graph: graphlib.Graph) =>
    createMappedCycleMessage(cycle, () => '', graph);

const createCyclesMessage = (cycles: string[][], graph: graphlib.Graph) =>
    cycles.map((cycle) => createCycleMessage(cycle, graph)).join(`${EOL}${EOL}`);

const createMappedCyclesMessage = (cycles: string[][], mapping: Mapping, graph: graphlib.Graph) =>
    cycles.map((cycle) => createMappedCycleMessage(cycle, mapping, graph)).join(`${EOL}${EOL}`);

const getFullErrorMessage = (message: string) => MESSAGE_HEADER + message;

export const circularDependenciesRule: RuleDefinition = {
    onProject: ({ config = {}, files, dependencies }: OnProjectArgument): RuleResultEntry[] => {
        const checkSubTreeCycle = config.checkSubTreeCycle || false;
        const trimmedDependencies = trimNodeModules(dependencies);
        const fileDependencyGraph = createFilesGraph(files, trimmedDependencies);

        const fileCycles = graphlib.alg.findCycles(fileDependencyGraph);
        const cyclesMessage = createCyclesMessage(fileCycles, fileDependencyGraph);
        const fileCyclesError = fileCycles.length ? getFullErrorMessage(cyclesMessage) : undefined;
        let result: string[];
        if (checkSubTreeCycle) {
            const { graph, mapFunction } = createFoldersGraph(
                fileDependencyGraph,
                validateRegistries(config.registries),
            );
            const subTreeResult = graphlib.alg.findCycles(graph);
            const mappedCyclesMessage = createMappedCyclesMessage(
                subTreeResult,
                mapFunction,
                graph,
            );
            const folderCyclesError = subTreeResult.length
                ? getFullErrorMessage(mappedCyclesMessage)
                : undefined;

            result = [fileCyclesError, folderCyclesError].filter(Boolean) as string[];
        } else {
            result = [fileCyclesError].filter(Boolean) as string[];
        }

        return result.map((message) => ({
            message,
        }));
    },
};
