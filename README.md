# stricter

[![Greenkeeper badge](https://badges.greenkeeper.io/stricter/stricter.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/stricter/stricter.svg?branch=master)](https://travis-ci.org/stricter/stricter)
[![npm version](https://img.shields.io/npm/v/stricter.svg?style=flat-square)](https://www.npmjs.com/package/stricter)

A project-wide js-linting tool

# Configuration
Stricter uses `stricter.config.js` to read configuration.
The configuration file will be resolved starting from the current working directory location, and searching up the file tree until a config file is (or isn't) found.

# Basic Configuration
```
module.exports = {
    "root": "src",
    "rulesDir": "rules",
    "rules": {
        "hello-world-project": {
            "level": "error"
        },
        "stricter/unused-files": [{
            "level": "warning",
            "include" : ["foo\\\\.*", "bar\\\\.*"],
            "exclude" : ["baz\\\\.*"],
            "config": {
                "entry": [
                    "foo\\\\.*story\\.js",
                    "foo\\\\\\.eslintrc\\.js",
                    "foo\\\\.*spec\\.js",
                    "foo\\\\.*test\\.js",
                    "foo\\\\.*\\.md",
                    "foo\\\\bar\\\\index\\.js",
                    "foo\\\\baz\\\\index\\.js",
                ]
            }
        }],
    }
}

```
`root` - root folder for the project.

`rulesDir` - folder, containing custom rules. Rule files need to follow naming convention `<rulename>.rule.js`. They will be available for configuration as `<rulename>`.

`rules` - an object, containing configuration for rules:
  - `level` - `error | warning | off`, log level
  - `include` - `string | string[]`, regular expressions to match files, uses relative path from root
  - `exclude` - `string | string[]`, regular expressions to exclude from matched files, uses relative path from root
  - `config` - `any`, config to be passed into rule
  


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