import type { Graph } from 'graphlib';

export type Mapping = (source: string, target: string) => string;
export type FoldersGraph = {
    graph: Graph;
    mapFunction: Mapping;
};
