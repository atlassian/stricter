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

export enum Reporter {
    CONSOLE = 'console',
    MOCHA = 'mocha',
}

export interface RuleUsageConfig {
    [prop: string]: any;
}

export interface RuleUsage {
    include?: RegExp | RegExp[] | Function;
    exclude?: RegExp | RegExp[] | Function;
    level?: Level;
    config?: RuleUsageConfig;
}

export interface Config {
    root: string;
    rulesDir?: string;
    extensions?: string[];
    rules: {
        [ruleName: string]: RuleUsage | RuleUsage[];
    };
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
    errors?: string[];
    warnings?: string[];
}

export interface RuleToRuleApplicationResult {
    [rule: string]: RuleApplicationResult;
}

export interface OnProjectArgument {
    config?: RuleUsageConfig;
    dependencies: FileToDependency;
    files: FileToData;
    rootPath: string;
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
    errors?: string[];
    warnings?: string[];
}

export interface StricterArguments {
    silent?: boolean;
    configPath?: string;
    reporter?: Reporter;
}

export interface ParsedImportsResult {
    staticImports: string[];
    dynamicImports: string[];
}
