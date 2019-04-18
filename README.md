# stricter

[![Greenkeeper badge](https://badges.greenkeeper.io/stricter/stricter.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/stricter/stricter.svg?branch=master)](https://travis-ci.org/stricter/stricter)
[![npm version](https://img.shields.io/npm/v/stricter.svg?style=flat-square)](https://www.npmjs.com/package/stricter)
[![Coverage Status](https://coveralls.io/repos/github/stricter/stricter/badge.svg?branch=master)](https://coveralls.io/github/stricter/stricter?branch=master)

A project-wide js-linting tool

# Installation

```
yarn add stricter --dev
```

# Usage
```
yarn stricter
```
You can run `yarn stricter --help` for help.

# Configuration
Stricter uses `stricter.config.js` to read configuration.
The configuration file will be resolved starting from the current working directory location, and searching up the file tree until a config file is (or isn't) found.

## Sample configuration
```javascript
module.exports = {
    root: 'src',
    rulesDir: 'rules',
    exclude: /\.DS_Store/,
    rules: {
        'hello-world-project': {
            level: 'error'
        },
        'stricter/unused-files': [{
            level: 'warning',
            include : [/foo\.*/, /bar\.*/],
            exclude : (i) => i.includes('testFolder'),
            config: {
                entry: [
                    /foo\.eslintrc\.js/,
                    /foo\.*\.md/,
                    /foo\/bar\/index\.js/,
                    /foo\/baz\/index\.js/,
                ],
                relatedEntry: [
                    /foo\.*spec\.js/,
                    /foo\.*test\.js/,
                    /foo\.*story\.js/,
                ]
            }
        }],
    }
}

```

## Description
`root` - `string`, root folder for the project.

`rulesDir` - `string | string[]`, folder(s), containing custom rules. Rule files need to follow naming convention `<rulename>.rule.js`. They will be available for configuration as `<rulename>`.

`exclude` - `RegExp | RegExp[] | Function`, regular expressions to exclude files, uses relative path from root or function accepting relative path and returning boolean

`rules` - an object, containing configuration for rules:
  - `level` - `error | warning | off`, log level
  - `include` - `RegExp | RegExp[] | Function`, regular expressions to match files, uses relative path from root or function accepting relative path and returning boolean
  - `exclude` - `RegExp | RegExp[] | Function`, regular expressions to exclude from matched files, uses relative path from root or function accepting relative path and returning boolean
  - `config` - `any`, config to be passed into rule

# Default rules

## stricter/circular-dependencies
Checks for circular dependencies in the code. Has a configuration to additionally check for cycles on folder level.

```
'stricter/circular-dependencies': {
    config: {
        checkSubTreeCycle: Boolean; // true to check for folder-lever cycles
    }
}
```

## stricter/unused-files
Checks for unused files. 
`entry` - application entry points. Usually these files are mentioned in `entry` part of webpack config or they are non-js files you want to keep (configs, markdown, etc.)
`relatedEntry` - related entry points, they are considered used only if any of its dependencies are used by an `entry` or its transitive dependencies. Usually these are tests and storybooks.

```
'stricter/unused-files': {
    config: {
        entry: RegExp | RegExp[] | Function; // if function, will get file path as an argument
        relatedEntry: RegExp | RegExp[] | Function; // if function, will get file path as an argument
    }
}
```

# Custom rules
A rule is a javascript module that exports an object that implements the following interface
```typescript
interface RuleDefinition {
    onProject: ({
        config?: { [prop: string]: any; };
        dependencies: {
            [fileName: string]: string[];
        };
        files: {
            [fileName: string]: {
                ast?: () => any;
                source?: string;
            };
        };
        rootPath: string;
        id?: string;
        include?: RegExp | RegExp[] | Function;
        exclude?: RegExp | RegExp[] | Function;
    }) => string[];
}
```
`onProject` will be called once with `files` and `dependencies` calculated for current project.

`rootPath` is an absolute path to project root.

`config` is an optional object that may be specifified in configuration.

`onProject` should return an array of strings, describing violations, or an empty array if there is none.

`include` value of `include` from the rule

`exclude` value of `exclude` from the rule

# CLI
```
Options:
  --help          Show help                                            [boolean]
  --version       Show version number                                  [boolean]
  --config, -c    Specify config location                               [string]
  --reporter, -r  Specify reporter        [choices: "console", "mocha", "junit"]
  --rule          Verify particular rule                                 [array]
  --clearCache    Clears cache
```

# Debugging
It helps to use `src/debug.ts` as an entry point for debugging.
A sample launch.json for VS Code might look like
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Current TS File",
            "type": "node",
            "request": "launch",
            "args": ["${relativeFile}"],
            "runtimeArgs": ["--nolazy", "-r", "ts-node/register"],
            "sourceMaps": true,
            "cwd": "${workspaceRoot}",
            "protocol": "inspector"
        }
    ]
}
```
