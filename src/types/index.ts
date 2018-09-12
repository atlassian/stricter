export interface CosmiConfig {
    filepath: string;
    config: {
        [prop: string]: any;
    };
}

export enum Level {
    WARNING = 'warning',
    ERROR = 'error',
    OFF = 'off',
}

export enum ReporterType {
    CONSOLE = 'console',
    JUNIT = 'junit',
    MOCHA = 'mocha',
}

export type Reporter = (report: RuleToRuleApplicationResult) => void;

export interface RuleUsageConfig {
    [prop: string]: any;
}

export type FileFilter = RegExp | RegExp[] | Function;

export interface RuleUsage {
    include?: FileFilter;
    exclude?: FileFilter;
    level?: Level;
    config?: RuleUsageConfig;
}

export interface ConfigRules {
    [ruleName: string]: RuleUsage | RuleUsage[];
}

export interface Config {
    root: string;
    rulesDir?: string;
    exclude?: FileFilter;
    rules: ConfigRules;
}

export interface FileData {
    ast?: () => any;
    source?: string;
    dependencies?: string[];
}

export interface FileToData {
    [fileName: string]: FileData;
}

export interface FileToDependency {
    [fileName: string]: string[];
}

export interface RuleApplicationResult {
    errors: string[];
    warnings: string[];
    time: number;
}

export interface RuleToRuleApplicationResult {
    [rule: string]: RuleApplicationResult;
}

export interface OnProjectArgument {
    dependencies: FileToDependency;
    files: FileToData;
    rootPath: string;
    include?: FileFilter;
    exclude?: FileFilter;
    config?: RuleUsageConfig;
}

export interface RuleDefinition {
    onProject: (args: OnProjectArgument) => string[];
}

export interface RuleDefinitions {
    [ruleName: string]: RuleDefinition;
}

export interface RuleApplication {
    definition: RuleDefinition;
    usage: RuleUsage | RuleUsage[];
}

export interface RuleApplications {
    [ruleName: string]: RuleApplication;
}

export interface FileToRule {
    [fileName: string]: RuleApplications;
}

export interface LogEntry {
    rule: string;
    errors: string[];
    warnings: string[];
    time: number;
}

export interface CliOptions {
    config: string | undefined;
    reporter: string | undefined;
    rulesToVerify: string[] | undefined;
    clearCache: boolean | undefined;
}

export interface StricterArguments {
    options: {
        configPath: string | undefined;
        rulesToVerify: string[] | undefined;
        clearCache: boolean | undefined;
    };
    reporter: Reporter;
    logger: Logger;
    cacheManager: CacheManager;
}

export interface ParsedImportsResult {
    staticImports: string[];
    dynamicImports: string[];
}

export type PathMatcher = (path: string) => boolean;

export interface Logger {
    debug: (message: any) => void;
    log: (message: any) => void;
}

export type Stricter = () => number;

export type ResolveImport = (importString: string, dir: string) => string;

export interface CacheContents {
    filesData: FileToData;
}
export interface CacheManager {
    clear: () => void;
    get: () => CacheContents;
    set: (contents: CacheContents) => void;
}

export type HashFunction = (contents: string) => string;
