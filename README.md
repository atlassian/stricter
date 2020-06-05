# stricter

[![Greenkeeper badge](https://badges.greenkeeper.io/atlassian/stricter.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/atlassian/stricter.svg?branch=master)](https://travis-ci.org/atlassian/stricter)
[![npm version](https://img.shields.io/npm/v/stricter.svg?style=flat-square)](https://www.npmjs.com/package/stricter)
[![Coverage Status](https://coveralls.io/repos/github/atlassian/stricter/badge.svg?branch=master)](https://coveralls.io/github/atlassian/stricter?branch=master)

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
    plugins: ['tangerine'],
    resolve: {
        modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    },
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
        'stricter/circular-dependencies': [{
            level: 'error',
            config: {
                checkSubTreeCycle: true,
                registries: ['**/foo/bar', 'baz'],
            },
        }],
        'tangerine/project-structure': {
            level: 'error',
            config: { ... },
        }
    }
}

```

## Description

`root` - `string` required, root folder for the project.

`rulesDir` - `string | string[]`, folder(s), containing custom rules. Rule files need to follow naming convention `<rulename>.rule.js`. They will be available for configuration as `<rulename>`.

`exclude` - `RegExp | RegExp[] | Function`, regular expressions to exclude files, uses relative path from root or function accepting relative path and returning boolean

`plugins` - `string[]`, packages that contain third-party rule definitions that you can use in `rules`. See [Plugins](#Plugins) for more details.

`resolve` - `Object`, if you are using webpack, and you want to pass custom resolution options to `stricter`, the options are passed from the `resolve` key of your webpack configuration.

`rules` - required, an object containing configuration for rules.

The keys should be rule names and values should be an object, array of objects or a function. Arrays will result in the rule being executed once per each entry in the array, see [rule functions](#rule-functions) for more info on that syntax. The objects (`RuleObject`) should be of the form:

-   `level` - `error | warning | off`, log level
-   `include` - `RegExp | RegExp[] | Function`, regular expressions to match files, uses relative path from root or function accepting relative path and returning boolean
-   `exclude` - `RegExp | RegExp[] | Function`, regular expressions to exclude from matched files, uses relative path from root or function accepting relative path and returning boolean
-   `config` - `any`, config to be passed into rule

`packages` - `string[]`, an array of globs that match paths to packages if you are in a multi-package repo. This can be used to override the default list of packages that are provided to rules configured using a [function](#rule-functions).

### Rule functions

The default way of configuring rules is to provide objects, however, each rule value may also be a function that returns an object instead.
This provides an easy way to configure rules designed to be executed against each package separately in a monorepo.

Signature: `(args: { packages: string[] }) => RuleObject | RuleObject[]`

where `packages` is a list of package directory paths in your project that are automatically detected by searching for package.json's in sub-directories, i.e. `*/**/package.json`.
To override where `packages` are searched, you can use the top-level `packages` config to provide an array of globs instead. For example, this could be sourced from the yarn workspaces field in your project's root package.json.

E.g.

```js
module.exports = {
    ...
    rules: {
        'package-structure': ({ packages }) => packages.map(pkg => ({
            level: 'error',
            config: {
                pkgRoot: pkg,
            },
        })),
        'rule-that-does-not-need-to-execute-multiple-times': {
            level: 'error',
            ...
        }
    },
    ...
}
```

Here, the `package-structure` rule enforces a specific structure for a package and takes the root path of the package as a config argument. In a single-package repo, the `rule` can just use the object syntax and specify the root path of the project as the package root.
However, in a multi-package repo this rule should be executed against each package separately rather than once at the root of the project so the function syntax can be used.

# Default rules

## stricter/circular-dependencies

Checks for circular dependencies in the code. Has a configuration to additionally check for cycles on folder level with ability to exclude particular directory from check by providing path to it in registries.

```
'stricter/circular-dependencies': {
    config: {
        checkSubTreeCycle: Boolean, // true to check for folder-lever cycles
        registries?: string[] | string, // Optional: values should be a glob
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
        include?: RegExp | RegExp[] | Function;
        exclude?: RegExp | RegExp[] | Function;
    }) => (string | { message: string; fix?: () => void; })[];
}
```

`onProject` will be called once with `files` and `dependencies` calculated for current project.

`rootPath` is an absolute path to project root.

`config` is an optional object that may be specifified in configuration.

`onProject` should return an array of objects, describing violations and their fixes, or an empty array if there is none.

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
  --fix           Apply fixes for rule violations
```

# Plugins

Stricter supports consuming rule definitions from other packages by specifying them in the `plugins` field of your stricter config.

The package names of plugins must be named `stricter-plugin-<name>`, e.g. `stricter-plugin-tangerine`. This guarantees unique
rule names across different plugins.

## Configuration

In the `plugins` field, you can specify the plugin using its short name `<name>` or its long form `stricter-plugin-<name>`. You can then
enable and configure rules from a plugin by specifying the rules in the `rules` field.

When configuring rules from a plugin, they must be prefixed by their short plugin name `<name>/<ruleName>`, e.g. `tangerine/project-structure`.

e.g.

```js
// stricter.config.js
module.exports = {
    root: '.',
    plugins: ['tangerine'],
    rules: {
        'tangerine/project-structure': {
            level: 'error',
            config: {...},
        }
    }
}
```

## Creating plugins

To create a stricter plugin, ensure the package name is of the format `stricter-plugin-<name>`.

The main file of the package should then export a `rules` key that contains the rule definitions you wish to provide.

e.g.

```js
module.exports = {
    rules: {
        'project-structure': {
            onProject: (...) => {...}
        },
        'another-rule': {
            onProject: (...) => {...}
        }
    }
}
```

Note that the rule names should not be prefixed when defining them inside the plugin, they are only prefixed when specifying them in configuration.

## Pre-configured plugin rules

Rules provided by a plugin are not enabled by default, they must be configured by the end-user. If you would like to provide a preset configuration of rules provided by your plugin, simply export your preset configuration under a certain key. Consumers can then import that configuration and spread it into the `rules` field of their stricter config.

E.g.

### Plugin

```js
// stricter-plugin-tangerine/index.js
module.exports = {
    // This key can be arbitrarily named
    config: {
        'tangerine/project-structure': {
            level: 'error',
            config: {
                '.': {
                    'package.json': { type: 'file' },
                    'src': { type: 'dir' }
                }
            }
        }
    },
    rules: {
        'project-structure': {
            onProject: (...) => {...}
        },
    }
}
```

### Stricter config

```js
// stricter.config.js

// This import key `config` must match what is exported by the plugin
const { config: tangerineConfig } = require('stricter-plugin-tangerine');

module.exports = {
    root: '.',
    plugins: ['tangerine'],
    rules: {
        ...tangerineConfig,
    },
};
```

# Exposed utilities

## parseDependencies

Parses files and returns an object, containing filenames as keys and array of their dependencies as values.

```js
const parseDependencies = (
    files: string[],
    { useCache = false, resolve = {} } = { useCache: false, resolve: {} }
): {
    [fileName: string]: string[];
}
```

`useCache` - pass `true` to leverage `stricter` filesystem cache  
`resolve` - `Object`, if you are using webpack, and you want to pass custom resolution options to `stricter`, the options are passed from the `resolve` key of your webpack configuration

usage:

```js
const { parseDependencies } = require('stricter');
const dependencies = parseDependencies(['foo.js', 'bar.js']);
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
            "env": { "TS_NODE_FILES": "true" },
            "runtimeArgs": ["-r", "ts-node/register"],
            "cwd": "${workspaceRoot}"
        }
    ]
}
```
