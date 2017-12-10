# stricter

[![Greenkeeper badge](https://badges.greenkeeper.io/stricter/stricter.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/stricter/stricter.svg?branch=master)](https://travis-ci.org/stricter/stricter)
[![npm version](https://img.shields.io/npm/v/stricter.svg?style=flat-square)](https://www.npmjs.com/package/stricter)

A project-wide js-linting tool

# Configuration
Stricter uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) for configuration. You can provide configuration via
- .stricterrc file, written in YAML or JSON, with optional extensions: .yaml/.yml/.json/.js.
- stricter.config.js file that exports an object.
- "stricter" key in your package.json file.

The configuration file will be resolved starting from the current working directory location, and searching up the file tree until a config file is (or isn't) found.

# Basic Configuration
```
{
    "root": "src",
    "rulesDir": "rules",
    "rules": {
        "hello-world-project": {
            "level": "error"
        },
        "all-files-project": {
            "level": "warning"
        },
    }
}

```


# Debugging
It helps to use `src/cli.ts` as an entry point for debugging.
A sample launch.json for VS Code might look like
```
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