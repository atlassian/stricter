declare module 'cosmiconfig'; // does not exist
declare module 'babylon'; // existing libdef misses plugins we use
declare module '@babel/traverse'{
    var traverse: (
        parent: Object | Array<Object>,
        opts?: Object | null,
        scope?: Object | null,
        state?: Object | null,
        parentPath?: Object | null,
    ) => void;
    export default traverse;
    export type NodePath = any;
}
declare module 'is-ci' {
    var isCi: boolean;
    export = isCi;
}



