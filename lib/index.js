(function(FuseBox){FuseBox.$fuse$=FuseBox;
FuseBox.pkg("stricter", {}, function(___scope___){
___scope___.file("index.js", function(exports, require, module, __filename, __dirname){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stricter_1 = require("./stricter");
exports.stricter = stricter_1.default;
var cli_1 = require("./cli");
exports.cli = cli_1.default;
var processor_1 = require("./processor");
exports.readFilesData = processor_1.readFilesData;
var dependencies_1 = require("./dependencies");
exports.readDependencies = dependencies_1.default;
//# sourceMappingURL=index.js.map
});
___scope___.file("stricter.js", function(exports, require, module, __filename, __dirname){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const rule_1 = require("./rule");
const processor_1 = require("./processor");
const dependencies_1 = require("./dependencies");
const logger_1 = require("./logger");
const utils_1 = require("./utils");
const types_1 = require("./types");
exports.default = ({ silent = false, reporter = types_1.Reporter.CONSOLE, configPath, }) => {
    if (!silent) {
        console.log('Stricter: Checking...');
    }
    const config = config_1.getConfig(configPath);
    const fileList = utils_1.listFiles(config.root);
    const ruleDefinitions = rule_1.getRuleDefinitions(config);
    const ruleApplications = rule_1.getRuleApplications(config, ruleDefinitions);
    const filesToProcess = rule_1.filterFilesToProcess(config.root, fileList, ruleApplications);
    const filesData = processor_1.readFilesData(filesToProcess);
    const dependencies = dependencies_1.default(filesData, [config.root], config.extensions);
    const projectResult = processor_1.applyProjectRules(config.root, filesData, dependencies, ruleApplications);
    const logs = logger_1.compactProjectLogs(projectResult);
    if (reporter === types_1.Reporter.MOCHA) {
        logger_1.mochaLogger(logs);
    }
    else {
        logger_1.consoleLogger(logs);
    }
    const result = logger_1.getErrorCount(logs);
    if (!silent) {
        if (result === 0) {
            console.log('Stricter: No errors');
        }
        else {
            console.log(`Stricter: ${result} error${result > 1 ? 's' : ''}`);
        }
    }
    return result;
};
//# sourceMappingURL=stricter.js.map
});
___scope___.file("config/index.js", function(exports, require, module, __filename, __dirname){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const read_config_1 = require("./read-config");
const process_config_1 = require("./process-config");
const validate_config_1 = require("./validate-config");
exports.getConfig = (configPath) => {
    const foundConfig = read_config_1.default(configPath);
    validate_config_1.default(foundConfig);
    const processedConfig = process_config_1.default(foundConfig);
    return processedConfig;
};
//# sourceMappingURL=index.js.map
});
___scope___.file("config/read-config.js", function(exports, require, module, __filename, __dirname){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cosmiconfig = require("cosmiconfig");
const moduleName = 'stricter';
exports.default = (configPath) => {
    const explorer = cosmiconfig(moduleName, {
        configPath,
        sync: true,
        packageProp: false,
        rc: false,
        format: 'js',
    });
    const foundConfigData = explorer.load(process.cwd());
    return foundConfigData;
};
//# sourceMappingURL=read-config.js.map
});
___scope___.file("config/process-config.js", function(exports, require, module, __filename, __dirname){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
exports.getDirResolver = (filepath) => (dir) => path.resolve(path.dirname(filepath), dir);
exports.default = (foundConfig) => {
    const { config, filepath } = foundConfig;
    const resolveDir = exports.getDirResolver(filepath);
    const result = {
        root: resolveDir(config.root),
        rules: {},
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
    return result;
};
//# sourceMappingURL=process-config.js.map
});
___scope___.file("config/validate-config.js", function(exports, require, module, __filename, __dirname){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (foundConfig) => {
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
//# sourceMappingURL=validate-config.js.map
});
___scope___.file("rule/index.js", function(exports, require, module, __filename, __dirname){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const utils_1 = require("./../utils");
const default_rules_1 = require("./default-rules");
exports.defaultRules = {
    'stricter/unused-files': default_rules_1.unusedFilesRule,
};
exports.RULE_SUFFIX = '.rule';
const stripOutSuffix = (str) => {
    return str.substring(0, str.length - exports.RULE_SUFFIX.length);
};
exports.getRuleDefinitions = (config) => {
    if (!config.rulesDir) {
        return exports.defaultRules;
    }
    const ruleFiles = utils_1.listFiles(config.rulesDir).filter(i => i.endsWith(`${exports.RULE_SUFFIX}.js`));
    const customRules = ruleFiles.reduce((acc, filePath) => {
        const ruleName = path.basename(filePath, path.extname(filePath));
        const rule = require(filePath);
        if (!rule.onProject) {
            throw new Error(`Rule ${ruleName} should have onProject.`);
        }
        return Object.assign({}, acc, { [stripOutSuffix(ruleName)]: rule });
    }, {});
    return Object.assign({}, exports.defaultRules, customRules);
};
exports.getRuleApplications = (config, ruleDefinitions) => {
    const usages = Object.keys(config.rules);
    const notExistingRules = usages.filter(i => !ruleDefinitions[i]);
    if (notExistingRules.length) {
        throw new Error(`Unable to find definitions for following rules:\r\n${notExistingRules.join('\r\n')}`);
    }
    const result = usages.reduce((acc, ruleName) => {
        return Object.assign({}, acc, { [ruleName]: {
                definition: ruleDefinitions[ruleName],
                usage: config.rules[ruleName],
            } });
    }, {});
    return result;
};
const getRuleUsages = (ruleApplications) => {
    return Object.values(ruleApplications).reduce((acc, i) => {
        if (Array.isArray(i.usage)) {
            return [...acc, ...i.usage];
        }
        return [...acc, i.usage];
    }, []);
};
const checkForMatch = (setting, filePath) => {
    if (typeof setting === 'function') {
        return setting(filePath);
    }
    const regexSetting = Array.isArray(setting) ? setting : [setting];
    return regexSetting.some(i => i.test(filePath));
};
exports.matchesRuleUsage = (directory, filePath, ruleUsage) => {
    const relativePath = filePath.replace(directory + path.sep, '');
    const matchesInclude = !ruleUsage.include || checkForMatch(ruleUsage.include, relativePath);
    const matchesExclude = ruleUsage.exclude && checkForMatch(ruleUsage.exclude, relativePath);
    return matchesInclude && !matchesExclude;
};
exports.filterFilesToProcess = (directory, files, ruleApplications) => {
    const ruleUsages = getRuleUsages(ruleApplications);
    const result = files.filter(i => ruleUsages.some(j => exports.matchesRuleUsage(directory, i, j)));
    return result;
};
//# sourceMappingURL=index.js.map
});
___scope___.file("utils/index.js", function(exports, require, module, __filename, __dirname){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const parser = require("babylon");
exports.readFile = (i) => fs.readFileSync(i, 'utf8');
exports.listFiles = (directory) => {
    const files = fs.statSync(directory).isDirectory()
        ? fs
            .readdirSync(directory)
            .reduce((acc, f) => [...acc, ...exports.listFiles(path.join(directory, f))], [])
        : [directory];
    return files;
};
const defaultPlugins = [
    'flow',
    'jsx',
    'doExpressions',
    'objectRestSpread',
    'decorators',
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
    'nullishCoalescingOperator',
];
exports.parse = (source) => {
    const plugins = defaultPlugins;
    const result = parser.parse(source, {
        plugins,
        allowImportExportEverywhere: true,
        sourceType: 'script',
    });
    return result;
};
//# sourceMappingURL=index.js.map
});
___scope___.file("rule/default-rules/index.js", function(exports, require, module, __filename, __dirname){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    onProject: ({ config, dependencies, files }) => {
        if (!config || !config.entry || !Array.isArray(config.entry)) {
            return [];
        }
        const entries = config.entry;
        const related = config.relatedEntry || [];
        const fileList = Object.keys(files);
        const seen = {};
        const entryFiles = fileList.filter(i => checkForMatch(entries, i));
        dfs(entryFiles, dependencies, seen);
        const relatedFiles = fileList
            .filter(i => checkForMatch(related, i) && !seen[i])
            .filter(i => dependencies[i] && dependencies[i].some(j => seen[j]));
        dfs(relatedFiles, dependencies, seen);
        const unusedFiles = fileList.filter(i => !seen[i]);
        return unusedFiles;
    },
};
const checkForMatch = (setting, filePath) => {
    if (typeof setting === 'function') {
        return setting(filePath);
    }
    const regexSetting = Array.isArray(setting) ? setting : [setting];
    return regexSetting.some(i => i.test(filePath));
};
//# sourceMappingURL=index.js.map
});
___scope___.file("processor/index.js", function(exports, require, module, __filename, __dirname){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./../utils");
const rule_1 = require("./../rule");
const types_1 = require("./../types");
const readFileData = (filePath) => {
    const source = utils_1.readFile(filePath);
    const ast = filePath.endsWith('.js') ? () => utils_1.parse(source) : undefined;
    return {
        [filePath]: Object.freeze({
            source,
            ast,
        }),
    };
};
exports.readFilesData = (files) => {
    const result = Object.freeze(files.reduce((acc, filePath) => {
        return Object.assign({}, acc, readFileData(filePath));
    }, {}));
    return result;
};
const createRuleApplicationResult = (messageType, ruleMessages) => {
    let result;
    switch (messageType) {
        case types_1.Level.ERROR:
            result = {
                errors: ruleMessages,
            };
            break;
        case types_1.Level.OFF:
            result = {
                errors: [],
            };
            break;
        case types_1.Level.WARNING:
        default:
            result = {
                warnings: ruleMessages,
            };
    }
    return result;
};
const processRule = (directory, definition, ruleUsage, filesData, dependencies) => {
    const reducedFilesData = Object.freeze(Object.keys(filesData)
        .filter(i => rule_1.matchesRuleUsage(directory, i, ruleUsage))
        .reduce((acc, fileName) => (Object.assign({}, acc, { [fileName]: filesData[fileName] })), {}));
    const ruleMessages = definition.onProject({
        dependencies,
        config: ruleUsage.config,
        files: reducedFilesData,
        rootPath: directory,
    });
    let messageType = ruleUsage.level;
    if (!messageType || Object.values(types_1.Level).indexOf(messageType) === -1) {
        messageType = types_1.Level.WARNING;
    }
    const ruleApplicationResult = createRuleApplicationResult(messageType, ruleMessages);
    return ruleApplicationResult;
};
exports.applyProjectRules = (directory, filesData, dependencies, ruleApplications) => {
    const result = Object.entries(ruleApplications).reduce((acc, [ruleName, ruleApplication]) => {
        const usage = Array.isArray(ruleApplication.usage)
            ? ruleApplication.usage
            : [ruleApplication.usage];
        const definition = ruleApplication.definition;
        let ruleApplicationResult;
        ruleApplicationResult = usage
            .map(usage => processRule(directory, definition, usage, filesData, dependencies))
            .reduce((acc, i) => ({
            errors: [...(acc.errors || []), ...(i.errors || [])],
            warnings: [...(acc.warnings || []), ...(i.warnings || [])],
        }), {
            errors: [],
            warnings: [],
        });
        return Object.assign({}, acc, { [ruleName]: ruleApplicationResult });
    }, {});
    return result;
};
//# sourceMappingURL=index.js.map
});
___scope___.file("types/index.js", function(exports, require, module, __filename, __dirname){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Level;
(function (Level) {
    Level["WARNING"] = "warning";
    Level["ERROR"] = "error";
    Level["OFF"] = "off";
})(Level = exports.Level || (exports.Level = {}));
var Reporter;
(function (Reporter) {
    Reporter["CONSOLE"] = "console";
    Reporter["MOCHA"] = "mocha";
})(Reporter = exports.Reporter || (exports.Reporter = {}));
//# sourceMappingURL=index.js.map
});
___scope___.file("dependencies/index.js", function(exports, require, module, __filename, __dirname){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extract_path_1 = require("./extract-path");
const parse_imports_1 = require("./parse-imports");
exports.default = (filesData, root, extensions) => {
    const result = Object.entries(filesData).reduce((acc, [filePath, data]) => {
        if (!data.ast) {
            return acc;
        }
        const imports = parse_imports_1.default(data.ast());
        const dependencies = [...imports.staticImports, ...imports.dynamicImports].map(i => extract_path_1.default(i, filePath, root, extensions));
        return Object.assign({}, acc, { [filePath]: dependencies });
    }, {});
    return result;
};
//# sourceMappingURL=index.js.map
});
___scope___.file("dependencies/extract-path.js", function(exports, require, module, __filename, __dirname){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const resolve_import_1 = require("./resolve-import");
exports.default = (importString, filePath, resolveRoots, extensions) => {
    const potentialImportPaths = importString.startsWith('.')
        ? [path.resolve(filePath, '..', importString)]
        : resolveRoots.map(i => path.resolve(i, importString));
    const result = resolve_import_1.default(potentialImportPaths, extensions) || importString;
    return result;
};
//# sourceMappingURL=extract-path.js.map
});
___scope___.file("dependencies/resolve-import.js", function(exports, require, module, __filename, __dirname){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
exports.default = (potentialImportPaths, extensions) => {
    const extensionsToAdd = ['js', ...(extensions || [])];
    const result = potentialImportPaths
        .reduce((acc, importPath) => [
        ...acc,
        path.join(importPath, 'index.js'),
        ...extensionsToAdd.map(i => `${importPath}.${i}`),
        importPath,
    ], [])
        .find(i => fs.existsSync(i) && !fs.lstatSync(i).isDirectory());
    return result;
};
//# sourceMappingURL=resolve-import.js.map
});
___scope___.file("dependencies/parse-imports.js", function(exports, require, module, __filename, __dirname){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const traverse_1 = require("@babel/traverse");
exports.default = (ast) => {
    const state = {
        dynamicImports: [],
        staticImports: [],
    };
    traverse_1.default(ast, {
        Identifier(path) {
        },
        ImportDeclaration(path, state) {
            state.staticImports.push(path.node.source.value);
        },
        ExportNamedDeclaration(path, state) {
            if (path.node.source) {
                state.staticImports.push(path.node.source.value);
            }
        },
        ExportAllDeclaration(path, state) {
            if (path.node.source) {
                state.staticImports.push(path.node.source.value);
            }
        },
        CallExpression(path, state) {
            if (path.node.callee &&
                (path.node.callee.type === 'Import' ||
                    (path.node.callee.type === 'Identifier' &&
                        path.node.callee.name === 'require')) &&
                path.node.arguments &&
                path.node.arguments.length > 0) {
                state.dynamicImports.push(path.node.arguments[0].value);
            }
        },
    }, null, state);
    return state;
};
//# sourceMappingURL=parse-imports.js.map
});
___scope___.file("logger/index.js", function(exports, require, module, __filename, __dirname){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var console_1 = require("./console");
exports.consoleLogger = console_1.default;
var mocha_1 = require("./mocha");
exports.mochaLogger = mocha_1.default;
var flatten_1 = require("./flatten");
exports.compactProjectLogs = flatten_1.compactProjectLogs;
exports.getErrorCount = (projectLogs) => Object.values(projectLogs).reduce((acc, i) => acc + ((i.errors && i.errors.length) || 0), 0);
//# sourceMappingURL=index.js.map
});
___scope___.file("logger/console.js", function(exports, require, module, __filename, __dirname){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
exports.default = (logs) => {
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
//# sourceMappingURL=console.js.map
});
___scope___.file("logger/mocha.js", function(exports, require, module, __filename, __dirname){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const reportFileName = 'stricter.json';
const encode = (str) => {
    const substitutions = {
        '&:': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
        '<': '&lt;',
        '>': '&gt;',
    };
    const result = Object.entries(substitutions).reduce((acc, [original, substitution]) => {
        return acc.replace(new RegExp(original, 'g'), substitution);
    }, str);
    return result;
};
exports.default = (logs) => {
    const now = new Date();
    const failuresCount = logs.reduce((acc, i) => acc + ((i.errors && i.errors.length) || 0), 0);
    const report = {
        stats: {
            tests: failuresCount,
            passes: 0,
            failures: failuresCount,
            duration: 0,
            start: now,
            end: now,
        },
        failures: logs.map(log => ({
            title: log.rule,
            fullTitle: log.rule,
            duration: 0,
            errorCount: (log.errors && log.errors.length) || 0,
            error: log.errors && log.errors.map(i => encode(i)).join('\n'),
        })),
        passes: [],
        skipped: [],
    };
    fs.writeFileSync(reportFileName, JSON.stringify(report, null, 2), 'utf-8');
};
//# sourceMappingURL=mocha.js.map
});
___scope___.file("logger/flatten.js", function(exports, require, module, __filename, __dirname){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compactProjectLogs = (projectResult) => {
    const result = Object.entries(projectResult)
        .map(([rule, applicationResult]) => ({
        rule,
        errors: applicationResult.errors,
        warnings: applicationResult.warnings,
    }))
        .filter(i => (i.warnings && i.warnings.length) || (i.errors && i.errors.length));
    return result;
};
//# sourceMappingURL=flatten.js.map
});
___scope___.file("cli.js", function(exports, require, module, __filename, __dirname){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const isCi = require("is-ci");
const stricter_1 = require("./stricter");
exports.default = () => {
    program
        .version("0.0.12")
        .option('-c, --config <path>', 'specify config location')
        .option('-r, --reporter <console|mocha>', 'specify reporter', /^(console|mocha)$/i, 'console')
        .parse(process.argv);
    const result = stricter_1.default({
        configPath: program.config,
        reporter: program.reporter,
        silent: isCi,
    });
    return result;
};
//# sourceMappingURL=cli.js.map
});
return ___scope___.entry = "index.ts";
});
FuseBox.target = "server"
FuseBox.expose([{"alias":"*","pkg":"stricter/index.js"}]);
FuseBox.main("stricter/index.js");
FuseBox.defaultPackageName = "stricter";
})
(function(e){function r(e){var r=e.charCodeAt(0),n=e.charCodeAt(1);if((p||58!==n)&&(r>=97&&r<=122||64===r)){if(64===r){var t=e.split("/"),i=t.splice(2,t.length).join("/");return[t[0]+"/"+t[1],i||void 0]}var o=e.indexOf("/");if(o===-1)return[e];var a=e.substring(0,o),u=e.substring(o+1);return[a,u]}}function n(e){return e.substring(0,e.lastIndexOf("/"))||"./"}function t(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];for(var n=[],t=0,i=arguments.length;t<i;t++)n=n.concat(arguments[t].split("/"));for(var o=[],t=0,i=n.length;t<i;t++){var a=n[t];a&&"."!==a&&(".."===a?o.pop():o.push(a))}return""===n[0]&&o.unshift(""),o.join("/")||(o.length?"/":".")}function i(e){var r=e.match(/\.(\w{1,})$/);return r&&r[1]?e:e+".js"}function o(e){if(p){var r,n=document,t=n.getElementsByTagName("head")[0];/\.css$/.test(e)?(r=n.createElement("link"),r.rel="stylesheet",r.type="text/css",r.href=e):(r=n.createElement("script"),r.type="text/javascript",r.src=e,r.async=!0),t.insertBefore(r,t.firstChild)}}function a(e,r){for(var n in e)e.hasOwnProperty(n)&&r(n,e[n])}function u(e){return{server:require(e)}}function f(e,n){var o=n.path||"./",a=n.pkg||"default",f=r(e);if(f&&(o="./",a=f[0],n.v&&n.v[a]&&(a=a+"@"+n.v[a]),e=f[1]),e)if(126===e.charCodeAt(0))e=e.slice(2,e.length),o="./";else if(!p&&(47===e.charCodeAt(0)||58===e.charCodeAt(1)))return u(e);var s=g[a];if(!s){if(p&&"electron"!==x.target)throw"Package not found "+a;return u(a+(e?"/"+e:""))}e=e?e:"./"+s.s.entry;var l,c=t(o,e),d=i(c),v=s.f[d];return!v&&d.indexOf("*")>-1&&(l=d),v||l||(d=t(c,"/","index.js"),v=s.f[d],v||"."!==c||(d=s.s&&s.s.entry||"index.js",v=s.f[d]),v||(d=c+".js",v=s.f[d]),v||(v=s.f[c+".jsx"]),v||(d=c+"/index.jsx",v=s.f[d])),{file:v,wildcard:l,pkgName:a,versions:s.v,filePath:c,validPath:d}}function s(e,r,n){if(void 0===n&&(n={}),!p)return r(/\.(js|json)$/.test(e)?v.require(e):"");if(n&&n.ajaxed===e)return console.error(e,"does not provide a module");var i=new XMLHttpRequest;i.onreadystatechange=function(){if(4==i.readyState)if(200==i.status){var n=i.getResponseHeader("Content-Type"),o=i.responseText;/json/.test(n)?o="module.exports = "+o:/javascript/.test(n)||(o="module.exports = "+JSON.stringify(o));var a=t("./",e);x.dynamic(a,o),r(x.import(e,{ajaxed:e}))}else console.error(e,"not found on request"),r(void 0)},i.open("GET",e,!0),i.send()}function l(e,r){var n=h[e];if(n)for(var t in n){var i=n[t].apply(null,r);if(i===!1)return!1}}function c(e,r){if(void 0===r&&(r={}),58===e.charCodeAt(4)||58===e.charCodeAt(5))return o(e);var t=f(e,r);if(t.server)return t.server;var i=t.file;if(t.wildcard){var a=new RegExp(t.wildcard.replace(/\*/g,"@").replace(/[.?*+^$[\]\\(){}|-]/g,"\\$&").replace(/@@/g,".*").replace(/@/g,"[a-z0-9$_-]+"),"i"),u=g[t.pkgName];if(u){var d={};for(var m in u.f)a.test(m)&&(d[m]=c(t.pkgName+"/"+m));return d}}if(!i){var h="function"==typeof r,x=l("async",[e,r]);if(x===!1)return;return s(e,function(e){return h?r(e):null},r)}var _=t.pkgName;if(i.locals&&i.locals.module)return i.locals.module.exports;var y=i.locals={},w=n(t.validPath);y.exports={},y.module={exports:y.exports},y.require=function(e,r){return c(e,{pkg:_,path:w,v:t.versions})},p||!v.require.main?y.require.main={filename:"./",paths:[]}:y.require.main=v.require.main;var j=[y.module.exports,y.require,y.module,t.validPath,w,_];return l("before-import",j),i.fn.apply(0,j),l("after-import",j),y.module.exports}if(e.FuseBox)return e.FuseBox;var d="undefined"!=typeof WorkerGlobalScope,p="undefined"!=typeof window&&window.navigator||d,v=p?d?{}:window:global;p&&(v.global=d?{}:window),e=p&&"undefined"==typeof __fbx__dnm__?e:module.exports;var m=p?d?{}:window.__fsbx__=window.__fsbx__||{}:v.$fsbx=v.$fsbx||{};p||(v.require=require);var g=m.p=m.p||{},h=m.e=m.e||{},x=function(){function r(){}return r.global=function(e,r){return void 0===r?v[e]:void(v[e]=r)},r.import=function(e,r){return c(e,r)},r.on=function(e,r){h[e]=h[e]||[],h[e].push(r)},r.exists=function(e){try{var r=f(e,{});return void 0!==r.file}catch(e){return!1}},r.remove=function(e){var r=f(e,{}),n=g[r.pkgName];n&&n.f[r.validPath]&&delete n.f[r.validPath]},r.main=function(e){return this.mainFile=e,r.import(e,{})},r.expose=function(r){var n=function(n){var t=r[n].alias,i=c(r[n].pkg);"*"===t?a(i,function(r,n){return e[r]=n}):"object"==typeof t?a(t,function(r,n){return e[n]=i[r]}):e[t]=i};for(var t in r)n(t)},r.dynamic=function(r,n,t){this.pkg(t&&t.pkg||"default",{},function(t){t.file(r,function(r,t,i,o,a){var u=new Function("__fbx__dnm__","exports","require","module","__filename","__dirname","__root__",n);u(!0,r,t,i,o,a,e)})})},r.flush=function(e){var r=g.default;for(var n in r.f)e&&!e(n)||delete r.f[n].locals},r.pkg=function(e,r,n){if(g[e])return n(g[e].s);var t=g[e]={};return t.f={},t.v=r,t.s={file:function(e,r){return t.f[e]={fn:r}}},n(t.s)},r.addPlugin=function(e){this.plugins.push(e)},r.packages=g,r.isBrowser=p,r.isServer=!p,r.plugins=[],r}();return p||(v.FuseBox=x),e.FuseBox=x}(this))
//# sourceMappingURL=index.js.map