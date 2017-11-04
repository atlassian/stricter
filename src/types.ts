export interface CosmiConfig {
    filepath: string;
    config: {
        [prop: string]: any;
    };
}

export enum Level {
    WARNING = 'warning',
    ERROR = 'error',
}

export interface RuleUsage {
    include?: string;
    exclude?: string;
    level?: Level;
}

export interface Config {
    root: string;
    rulesDir?: string;
    rules: {
        [ruleName: string]: RuleUsage | RuleUsage[];
    };
}

export enum RuleRequirement {
    NONE = 'none',
    CONTENTS = 'contents',
    AST = 'ast',
}

export interface FileData {
    ast?: any;
    contents?: string;
}

export interface FileToData {
    [fileName: string]: FileData;
}

export interface RuleApplicationResult {
    errors?: string[];
    warnings?: string[];
}

export interface RuleToRuleApplicationResult {
    [rule: string]: RuleApplicationResult;
}

export interface FileToRuleToRuleApplicationResult {
    [filePath: string]: RuleToRuleApplicationResult;
}

export interface RuleDefinition {
    requirement: RuleRequirement;
    onFile: (fileData: FileData) => string[];
    onProject: (projectData: FileToData) => string[];
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
