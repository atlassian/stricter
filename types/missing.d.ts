declare module 'cosmiconfig'; // does not exist
declare module 'babylon'; // existing libdef misses plugins we use
declare module '@babel/traverse'; // existing libdef misses plugins we use
declare module 'is-ci' {
    var isCi: boolean;
    export = isCi;
}