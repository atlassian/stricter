declare module 'cosmiconfig'; // does not exist
declare module '@babel/parser'; // does not exist
declare module 'is-ci' {
    var isCi: boolean;
    export = isCi;
}
declare module 'xml-escape' {
    function xmlEscape(str: string, ignore?: string): string;
    export = xmlEscape;
}
