    if (typeof global === "object") {
        global.require = require;
    }
    var _7690 = {};
    _7690.f = {}
    // cached modules
    _7690.m = {};
    _7690.s = function(id) {
        var result = _7690.r(id);
        if (result === undefined) {
            var result = require(id);
            return result;
        }
    }
    _7690.r = function(id) {
        var cached = _7690.m[id];
        // resolve if in cache
        if (cached) {
            return cached.m.exports;
        }
        var file = _7690.f[id];
        if (!file)
            return;
        cached = _7690.m[id] = {};
        cached.exports = {};
        cached.m = { exports: cached.exports };
        file.call(cached.exports, cached.m, cached.exports);
        return cached.m.exports;
    };
// stricter/index.js
_7690.f[0] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
var stricter_1 = _7690.r(1);
exports.stricter = stricter_1.default;
var cli_1 = _7690.r(20);
exports.cli = cli_1.default;
var processor_1 = _7690.r(9);
exports.readFilesData = processor_1.readFilesData;
var dependencies_1 = _7690.r(10);
exports.readDependencies = dependencies_1.default;
}
// stricter/stricter.js
_7690.f[1] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const config_1 = _7690.r(2);
const rule_1 = _7690.r(6);
const processor_1 = _7690.r(9);
const logger_1 = _7690.r(15);
const utils_1 = _7690.r(7);
const types_1 = _7690.r(14);
const debug_1 = _7690.r(19);
exports.default = ({silent = false, reporter = types_1.Reporter.CONSOLE, configPath}) => {
    const result = debug_1.measure('Total', () => {
        debug_1.default({
            silent,
            reporter,
            configPath
        });
        if (!silent) {
            console.log('Stricter: Checking...');
        }
        const config = debug_1.measure('Read config', () => config_1.getConfig(configPath));
        const fileList = debug_1.measure('Get file list', () => utils_1.listFiles(config.root, config.exclude));
        const ruleDefinitions = debug_1.measure('Get rule definitions', () => rule_1.getRuleDefinitions(config));
        const ruleApplications = debug_1.measure('Get rule applications', () => rule_1.getRuleApplications(config, ruleDefinitions));
        const filesToProcess = debug_1.measure('Get files to process', () => rule_1.filterFilesToProcess(config.root, fileList, ruleApplications));
        const filesData = debug_1.measure('Read files data', () => processor_1.readFilesData(filesToProcess, [config.root], config.extensions));
        const projectResult = debug_1.measure('Apply rules', () => processor_1.applyProjectRules(config.root, filesData, ruleApplications));
        const logs = debug_1.measure('Massage logs', () => logger_1.compactProjectLogs(projectResult));
        debug_1.measure('Write logs', () => {
            if (reporter === types_1.Reporter.MOCHA) {
                logger_1.mochaLogger(logs);
            } else {
                logger_1.consoleLogger(logs);
            }
        });
        const result = debug_1.measure('Count errors', () => logger_1.getErrorCount(logs));
        if (!silent) {
            if (result === 0) {
                console.log('Stricter: No errors');
            } else {
                console.log(`Stricter: ${ result } error${ result > 1 ? 's' : '' }`);
            }
        }
        return result;
    });
    return result;
};
}
// stricter/config/index.js
_7690.f[2] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const read_config_1 = _7690.r(3);
const process_config_1 = _7690.r(4);
const validate_config_1 = _7690.r(5);
exports.getConfig = configPath => {
    const foundConfig = read_config_1.default(configPath);
    validate_config_1.default(foundConfig);
    const processedConfig = process_config_1.default(foundConfig);
    return processedConfig;
};
}
// stricter/config/read-config.js
_7690.f[3] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const cosmiconfig = require('cosmiconfig');
const moduleName = 'stricter';
exports.default = configPath => {
    const explorer = cosmiconfig(moduleName, { searchPlaces: [`${ moduleName }.config.js`] });
    const foundConfigData = configPath ? explorer.loadSync(configPath) : explorer.searchSync();
    return foundConfigData;
};
}
// stricter/config/process-config.js
_7690.f[4] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const path = require('path');
exports.getDirResolver = filepath => dir => path.resolve(path.dirname(filepath), dir);
exports.default = foundConfig => {
    const {config, filepath} = foundConfig;
    const resolveDir = exports.getDirResolver(filepath);
    const result = {
        root: resolveDir(config.root),
        rules: {}
    };
    if (config.rulesDir) {
        result.rulesDir = resolveDir(config.rulesDir);
    }
    if (config.rules) {
        result.rules = config.rules;
    }
    if (config.extensions) {
        result.extensions = config.extensions;
    }
    if (config.exclude) {
        result.exclude = config.exclude;
    }
    return result;
};
}
// stricter/config/validate-config.js
_7690.f[5] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = foundConfig => {
    if (!foundConfig) {
        throw new Error('No config found');
    }
    if (!foundConfig.config) {
        throw new Error('No config contents found');
    }
    if (!foundConfig.config.root) {
        throw new Error('No root specified');
    }
};
}
// stricter/rule/index.js
_7690.f[6] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const path = require('path');
const utils_1 = _7690.r(7);
const default_rules_1 = _7690.r(8);
exports.defaultRules = { 'stricter/unused-files': default_rules_1.unusedFilesRule };
exports.RULE_SUFFIX = '.rule';
const stripOutSuffix = str => {
    return str.substring(0, str.length - exports.RULE_SUFFIX.length);
};
exports.getRuleDefinitions = config => {
    if (!config.rulesDir) {
        return exports.defaultRules;
    }
    const ruleFiles = utils_1.listFiles(config.rulesDir).filter(i => i.endsWith(`${ exports.RULE_SUFFIX }.js`));
    const customRules = ruleFiles.reduce((acc, filePath) => {
        const ruleName = path.basename(filePath, path.extname(filePath));
        const rule = _7690.s(filePath);
        if (!rule.onProject) {
            throw new Error(`Rule ${ ruleName } should have onProject.`);
        }
        acc[stripOutSuffix(ruleName)] = rule;
        return acc;
    }, {});
    return Object.assign({}, exports.defaultRules, customRules);
};
exports.getRuleApplications = (config, ruleDefinitions) => {
    const usages = Object.keys(config.rules);
    const notExistingRules = usages.filter(i => !ruleDefinitions[i]);
    if (notExistingRules.length) {
        throw new Error(`Unable to find definitions for following rules:\r\n${ notExistingRules.join('\r\n') }`);
    }
    const result = usages.reduce((acc, ruleName) => {
        acc[ruleName] = {
            definition: ruleDefinitions[ruleName],
            usage: config.rules[ruleName]
        };
        return acc;
    }, {});
    return result;
};
const getRuleUsages = ruleApplications => {
    return Object.values(ruleApplications).reduce((acc, i) => {
        if (Array.isArray(i.usage)) {
            return [
                ...acc,
                ...i.usage
            ];
        }
        return [
            ...acc,
            i.usage
        ];
    }, []);
};
exports.matchesRuleUsage = (directory, filePath, ruleUsage) => {
    const relativePath = filePath.replace(directory + path.sep, '');
    const matchesInclude = !ruleUsage.include || utils_1.getMatcher(ruleUsage.include)(relativePath);
    const matchesExclude = ruleUsage.exclude && utils_1.getMatcher(ruleUsage.exclude)(relativePath);
    return matchesInclude && !matchesExclude;
};
exports.filterFilesToProcess = (directory, files, ruleApplications) => {
    const ruleUsages = getRuleUsages(ruleApplications);
    const result = files.filter(i => ruleUsages.some(j => exports.matchesRuleUsage(directory, i, j)));
    return result;
};
}
// stricter/utils/index.js
_7690.f[7] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
exports.readFile = i => fs.readFileSync(i, 'utf8');
exports.innerListFiles = (directory, exclude, visited) => {
    if (visited[directory] || exclude(directory)) {
        return [];
    }
    let stats = fs.lstatSync(directory);
    let realPath = directory;
    if (stats.isSymbolicLink()) {
        realPath = fs.realpathSync(directory);
        stats = fs.statSync(realPath);
    }
    if (visited[realPath] || exclude(realPath)) {
        return [];
    }
    visited[realPath] = true;
    const isFile = !stats.isDirectory();
    if (isFile) {
        return [directory];
    }
    const files = fs.readdirSync(directory).reduce((acc, f) => [
        ...acc,
        ...exports.innerListFiles(path.join(directory, f), exclude, visited)
    ], []);
    return files;
};
exports.getMatcher = filter => {
    if (typeof filter === 'function') {
        return path => filter(path);
    }
    const regexSetting = Array.isArray(filter) ? filter : [filter];
    return path => regexSetting.some(i => i.test(path));
};
exports.listFiles = (directory, exclude) => {
    let excludeMatcher = () => false;
    if (exclude) {
        const matcher = exports.getMatcher(exclude);
        const rootToReplace = directory + path.sep;
        excludeMatcher = filePath => matcher(filePath.replace(rootToReplace, ''));
    }
    const result = exports.innerListFiles(directory, excludeMatcher, {});
    return result;
};
const defaultPlugins = [
    'flow',
    'jsx',
    'doExpressions',
    'objectRestSpread',
    [
        'decorators',
        { decoratorsBeforeExport: true }
    ],
    'classProperties',
    'classPrivateProperties',
    'classPrivateMethods',
    'exportExtensions',
    'asyncGenerators',
    'functionBind',
    'functionSent',
    'dynamicImport',
    'numericSeparator',
    'optionalChaining',
    'importMeta',
    'bigInt',
    'optionalCatchBinding',
    'throwExpressions',
    'pipelineOperator',
    'nullishCoalescingOperator'
];
exports.parse = source => {
    const plugins = defaultPlugins;
    const result = parser.parse(source, {
        plugins,
        allowImportExportEverywhere: true,
        sourceType: 'script'
    });
    return result;
};
}
// stricter/rule/default-rules/index.js
_7690.f[8] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const dfs = (stack, dependencies, seen) => {
    while (stack.length) {
        const fileName = stack.pop();
        seen[fileName] = true;
        if (dependencies[fileName]) {
            stack.push(...dependencies[fileName].filter(i => !seen[i]));
        }
    }
};
exports.unusedFilesRule = {
    onProject: ({config, dependencies, files}) => {
        if (!config || !config.entry || !Array.isArray(config.entry)) {
            return [];
        }
        const entries = config.entry;
        const related = config.relatedEntry || [];
        const fileList = Object.keys(files);
        const seen = {};
        const entryFiles = fileList.filter(i => checkForMatch(entries, i));
        dfs(entryFiles, dependencies, seen);
        const relatedFiles = fileList.filter(i => checkForMatch(related, i) && !seen[i]).filter(i => dependencies[i] && dependencies[i].some(j => seen[j]));
        dfs(relatedFiles, dependencies, seen);
        const unusedFiles = fileList.filter(i => !seen[i]);
        return unusedFiles;
    }
};
const checkForMatch = (setting, filePath) => {
    if (typeof setting === 'function') {
        return setting(filePath);
    }
    const regexSetting = Array.isArray(setting) ? setting : [setting];
    return regexSetting.some(i => i.test(filePath));
};
}
// stricter/processor/index.js
_7690.f[9] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const utils_1 = _7690.r(7);
const rule_1 = _7690.r(6);
const dependencies_1 = _7690.r(10);
const types_1 = _7690.r(14);
const readFileData = (filePath, root, extensions) => {
    const source = utils_1.readFile(filePath);
    const ast = filePath.endsWith('.js') ? () => utils_1.parse(source) : undefined;
    let dependencies;
    if (ast) {
        try {
            const parsedAst = ast();
            dependencies = dependencies_1.readDependencies(parsedAst, filePath, root, extensions);
        } catch (e) {
            console.error(`Unable to parse ${ filePath }`);
            throw e;
        }
    }
    return Object.freeze({
        source,
        ast,
        dependencies
    });
};
exports.readFilesData = (files, root, extensions) => {
    const filesData = Object.freeze(files.reduce((acc, filePath) => {
        acc[filePath] = readFileData(filePath, root, extensions);
        return acc;
    }, {}));
    return filesData;
};
const createRuleApplicationResult = (messageType, ruleMessages) => {
    let result;
    switch (messageType) {
    case types_1.Level.ERROR:
        result = { errors: ruleMessages };
        break;
    case types_1.Level.OFF:
        result = { errors: [] };
        break;
    case types_1.Level.WARNING:
    default:
        result = { warnings: ruleMessages };
    }
    return result;
};
const processRule = (directory, definition, ruleUsage, filesData, dependencies) => {
    const reducedFilesData = Object.keys(filesData).filter(i => rule_1.matchesRuleUsage(directory, i, ruleUsage)).reduce((acc, fileName) => {
        acc[fileName] = filesData[fileName];
        return acc;
    }, {});
    const ruleMessages = definition.onProject({
        dependencies,
        config: ruleUsage.config,
        include: ruleUsage.include,
        exclude: ruleUsage.exclude,
        files: reducedFilesData,
        rootPath: directory
    });
    let messageType = ruleUsage.level;
    if (!messageType || Object.values(types_1.Level).indexOf(messageType) === -1) {
        messageType = types_1.Level.WARNING;
    }
    const ruleApplicationResult = createRuleApplicationResult(messageType, ruleMessages);
    return ruleApplicationResult;
};
exports.applyProjectRules = (directory, filesData, ruleApplications) => {
    const dependencies = Object.entries(filesData).filter(([fileName, fileData]) => !!fileData.dependencies).reduce((acc, [fileName, fileData]) => {
        acc[fileName] = fileData.dependencies;
        return acc;
    }, {});
    const result = Object.entries(ruleApplications).reduce((acc, [ruleName, ruleApplication]) => {
        const usage = Array.isArray(ruleApplication.usage) ? ruleApplication.usage : [ruleApplication.usage];
        const definition = ruleApplication.definition;
        let ruleApplicationResult;
        ruleApplicationResult = usage.map(usage => processRule(directory, definition, usage, filesData, dependencies)).reduce((acc, i) => ({
            errors: [
                ...acc.errors || [],
                ...i.errors || []
            ],
            warnings: [
                ...acc.warnings || [],
                ...i.warnings || []
            ]
        }), {
            errors: [],
            warnings: []
        });
        acc[ruleName] = ruleApplicationResult;
        return acc;
    }, {});
    return result;
};
}
// stricter/dependencies/index.js
_7690.f[10] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const extract_path_1 = _7690.r(11);
const parse_imports_1 = _7690.r(13);
exports.readDependencies = (ast, filePath, root, extensions) => {
    const imports = parse_imports_1.default(ast);
    const dependencies = [
        ...imports.staticImports,
        ...imports.dynamicImports
    ].map(i => extract_path_1.default(i, filePath, root, extensions));
    return dependencies;
};
exports.default = (filesData, root, extensions) => {
    const result = Object.entries(filesData).reduce((acc, [filePath, data]) => {
        if (!data.ast) {
            return acc;
        }
        const dependencies = exports.readDependencies(data.ast(), filePath, root, extensions);
        acc[filePath] = dependencies;
        return acc;
    }, {});
    return result;
};
}
// stricter/dependencies/extract-path.js
_7690.f[11] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const path = require('path');
const resolve_import_1 = _7690.r(12);
exports.default = (importString, filePath, resolveRoots, extensions) => {
    const potentialImportPaths = importString.startsWith('.') ? [path.resolve(filePath, '..', importString)] : resolveRoots.map(i => path.resolve(i, importString));
    const result = resolve_import_1.default(potentialImportPaths, extensions) || importString;
    return result;
};
}
// stricter/dependencies/resolve-import.js
_7690.f[12] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const fs = require('fs');
const path = require('path');
exports.default = (potentialImportPaths, extensions) => {
    const extensionsToAdd = [
        'js',
        ...extensions || []
    ];
    const result = potentialImportPaths.reduce((acc, importPath) => [
        ...acc,
        path.join(importPath, 'index.js'),
        ...extensionsToAdd.map(i => `${ importPath }.${ i }`),
        importPath
    ], []).find(i => fs.existsSync(i) && !fs.lstatSync(i).isDirectory());
    return result;
};
}
// stricter/dependencies/parse-imports.js
_7690.f[13] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const babylon_walk_1 = require('babylon-walk');
exports.default = ast => {
    const state = {
        dynamicImports: [],
        staticImports: []
    };
    babylon_walk_1.simple(ast, {
        ImportDeclaration(node, state) {
            state.staticImports.push(node.source.value);
        },
        ExportNamedDeclaration(node, state) {
            if (node.source) {
                state.staticImports.push(node.source.value);
            }
        },
        ExportAllDeclaration(node, state) {
            if (node.source) {
                state.staticImports.push(node.source.value);
            }
        },
        CallExpression(node, state) {
            const callee = node.callee;
            if (callee && (callee.type === 'Import' || callee.type === 'Identifier' && callee.name === 'require') && node.arguments && node.arguments.length > 0 && node.arguments[0].type === 'StringLiteral') {
                state.dynamicImports.push(node.arguments[0].value);
            }
        }
    }, state);
    return state;
};
}
// stricter/types/index.js
_7690.f[14] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
var Level;
(function (Level) {
    Level['WARNING'] = 'warning';
    Level['ERROR'] = 'error';
    Level['OFF'] = 'off';
}(Level = exports.Level || (exports.Level = {})));
var Reporter;
(function (Reporter) {
    Reporter['CONSOLE'] = 'console';
    Reporter['MOCHA'] = 'mocha';
}(Reporter = exports.Reporter || (exports.Reporter = {})));
}
// stricter/logger/index.js
_7690.f[15] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
var console_1 = _7690.r(16);
exports.consoleLogger = console_1.default;
var mocha_1 = _7690.r(17);
exports.mochaLogger = mocha_1.default;
var flatten_1 = _7690.r(18);
exports.compactProjectLogs = flatten_1.compactProjectLogs;
exports.getErrorCount = projectLogs => Object.values(projectLogs).reduce((acc, i) => acc + (i.errors && i.errors.length || 0), 0);
}
// stricter/logger/console.js
_7690.f[16] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const chalk_1 = require('chalk');
exports.default = logs => {
    if (!logs.length) {
        return;
    }
    console.log(chalk_1.default.bgBlackBright('Project'));
    logs.forEach(log => {
        if (log.warnings) {
            log.warnings.forEach(warning => {
                console.log(chalk_1.default.yellow('warning: ') + chalk_1.default.gray(log.rule) + ' ' + warning);
            });
        }
        if (log.errors) {
            log.errors.forEach(error => {
                console.log(chalk_1.default.red('error: ') + chalk_1.default.gray(log.rule) + ' ' + error);
            });
        }
    });
};
}
// stricter/logger/mocha.js
_7690.f[17] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const fs = require('fs');
const reportFileName = 'stricter.json';
const encode = str => {
    const substitutions = {
        '&:': '&amp;',
        '"': '&quot;',
        '\'': '&apos;',
        '<': '&lt;',
        '>': '&gt;'
    };
    const result = Object.entries(substitutions).reduce((acc, [original, substitution]) => {
        return acc.replace(new RegExp(original, 'g'), substitution);
    }, str);
    return result;
};
exports.default = logs => {
    const now = new Date();
    const failuresCount = logs.reduce((acc, i) => acc + (i.errors && i.errors.length || 0), 0);
    const report = {
        stats: {
            tests: failuresCount,
            passes: 0,
            failures: failuresCount,
            duration: 0,
            start: now,
            end: now
        },
        failures: logs.map(log => ({
            title: log.rule,
            fullTitle: log.rule,
            duration: 0,
            errorCount: log.errors && log.errors.length || 0,
            error: log.errors && log.errors.map(i => encode(i)).join('\n')
        })),
        passes: [],
        skipped: []
    };
    fs.writeFileSync(reportFileName, JSON.stringify(report, null, 2), 'utf-8');
};
}
// stricter/logger/flatten.js
_7690.f[18] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
exports.compactProjectLogs = projectResult => {
    const result = Object.entries(projectResult).map(([rule, applicationResult]) => ({
        rule,
        errors: applicationResult.errors,
        warnings: applicationResult.warnings
    })).filter(i => i.warnings && i.warnings.length || i.errors && i.errors.length);
    return result;
};
}
// stricter/debug.js
_7690.f[19] = function(module,exports){
Object.defineProperty(exports, '__esModule', { value: true });
const debug = require('debug');
const debugWriter = debug('stricter');
exports.measure = (mark, fn) => {
    if (!debug.enabled) {
        return fn();
    }
    const now = Date.now();
    debugWriter(`⌛ ${ mark }`);
    const result = fn();
    debugWriter(`✔️ ${ mark } (${ Date.now() - now }ms)`);
    return result;
};
exports.default = debugWriter;
}
// stricter/cli.js
_7690.f[20] = function(module,exports){
var process = require('process');
Object.defineProperty(exports, '__esModule', { value: true });
const program = require('commander');
const isCi = require('is-ci');
const stricter_1 = _7690.r(1);
exports.default = () => {
    program.version('0.0.15').option('-c, --config <path>', 'specify config location').option('-r, --reporter <console|mocha>', 'specify reporter', /^(console|mocha)$/i, 'console').parse(process.argv);
    const result = stricter_1.default({
        configPath: program.config,
        reporter: program.reporter,
        silent: isCi
    });
    return result;
};
}
module.exports = _7690.r(0)