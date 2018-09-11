declare module 'cosmiconfig'; // does not exist
declare module 'is-ci' {
    var isCi: boolean;
    export = isCi;
}
declare module 'xml-escape' {
    function xmlEscape(str: string, ignore?: string): string;
    export default xmlEscape;
}
declare module 'resolve-from' {
    function resolveFrom(fromDir: string, moduleId: string): string;
    export default resolveFrom;
}
declare module 'debug' {
    interface IFormatters {
        [formatter: string]: Function
    }

    interface IDebugger {
        (formatter: any, ...args: any[]): void;

        enabled: boolean;
        log: Function;
        namespace: string;
    }

    var debug : {
        (namespace: string): debug.IDebugger,
        coerce: (val: any) => any,
        disable: () => void,
        enable: (namespaces: string) => void,
        enabled: (namespaces: string) => boolean,

        names: RegExp[],
        skips: RegExp[],

        formatters: IFormatters
    };

    export default debug;
}