# Changelog

## Master

## 0.5.0 - Ignore incorrect package exports

- **BREAKING** Ignore `package.json` `exports` field when resolving dependencies; this change might add missing entries to dependency graph, which could lead to rules finding the issues, not visible before
- Improve performance of files filter for the rules
- Bump dependencies

## 0.4.7 - Decrease memory consumption

- Do not cache file contents in memory for faster ast parsing; this will significantly decrease memory requirements for larger codebases

## 0.4.6 - Faster dependency resolution

- Bump dependencies
- Dependency resolution performance improvement (copied from https://github.com/atlassian-labs/webpack-deduplication-plugin)
- Fixed schema generation to avoid typeof

## 0.4.5 - Think about testing

- Bump dependencies
- Parse `jest.requireActual` as a direct dependency

## 0.4.4 - Bump dependencies

- Replace `greenkeeper` with `renovate`
- Bump dependencies
- Replace `chalk` with `ansi-colours` (#155 by @PepijnSenders)
- Wrap log messages to prevent break inside word (#154 and #201 by @PepijnSenders)

## 0.4.3 - Better webpack support

-   Dependencies bump
-   Test in node@14
-   Added possibility to use cache for `parseDependencies`, added it to the docs
-   Add possibility to pass custom resolve options from webpack (fixes #82)

## 0.4.2 - Fix it!

-   Switch from `tslint` to `eslint`
-   Dependencies bump
-   Drop node 8 support
-   Expose types from `index` (fixes #114)
-   Add a possibility for rules to provide fixes for violations; they can be applied via `stricter --fix` (fixes #107)
-   Code cleanup

## 0.4.1 - Dogfooding

-   Support for the scoped plugins (#93 by @nadiam84)
-   Dogfood stricter
-   Dependencies bump

## 0.4.0 - Typescript support, for real

-   **BREAKING** Migrate to using [`enhanced-resolve`](https://www.npmjs.com/package/enhanced-resolve) (fixes #86, native dependencies will now resolve to corresponding files in `node_modules`, if they exist)
-   Fixed security issue with [`set-value`](https://www.npmjs.com/package/set-value)
-   Dependencies bump

## 0.3.5 - Typescript support

-   Dependencies bump
-   TypeScript support (#83 by @gardnerjack)

## 0.3.4 - Cyclic dependencies exclusions

-   Allow `registries` to accept an array of globs, or single glob to be excluded from folder-level cyclic dependencies checks

## 0.3.3 - Packages support

-   Add new way of configuring rules via a function to support execution over multiple packages

## 0.3.2 - Plugins

-   Dependencies bump
-   Allow `rulesDir` to accept an array of folders
-   Add support for plugins

## 0.3.1 - New year, new release

-   Expose TypeScript definitions
-   Parse all the files in the project instead of the relevant only (the result is cached)
-   Add config validation
-   Dependencies bump
-   JUnit reporter no longer outputs warnings

## 0.3.0 - +1 rule, -1 external API

-   **BREAKING** Pass only the files included by the rule in dependencies object
-   **BREAKING** Removed external `readFilesData(files: string[]): FileToData` and
    `readDependencies(filesToData: FileToData): FileToDependency` in favour of
    `parseDependencies(files: string[]): FileToDependency`
-   Refactoring
-   Add default rule `stricter/circular-dependencies` created by @WorstCase00
-   `--clearCache` no longer performs a check

## 0.2.1 - Cache it

-   Add possibility to verify specific rules (`--rule ruleName`)
-   Use `rollup` instead of `fusebox` for bundling
-   Fix default rules handling
-   Refactoring
-   Cache dependency parsing
-   Add command to clear cache (`--clearCache`)
-   Dependency bumps

## 0.2.0 - More correct

-   **BREAKING** Dependency resolution is more correct now (and a bit slower)
-   Bump dependencies
-   Use OS-specific line-breaks
-   Refactoring
-   Improved JUnit reporter
-   Subtle console reporter changes
-   Add timing data for the rules (#23)

## 0.1.1 - JUnit reporter

-   JUnit reporter (`--reporter junit`) by @marcins (#22)

## 0.1.0 - Following the standard

-   **BREAKING** Require `node >=8.9.0` to run
-   **BREAKING** Use `require.resolve` to resolve imports - `stricter` will resolve `node_modules` imports (used to ignore them)
-   **BREAKING** No longer use `root` to resolving absolute paths, use `NODE_PATH` environment variable instead
-   **BREAKING** `extensions` field in config is no longer supported
-   **BREAKING** `readFilesData` no longer supports second argument `srcRoots: string[]`
-   Return exit code 1 whenever there are errors and 0 otherwise
-   Add node 10 to travis

## 0.0.16 - Symlinks: Inception

-   Remove `lib` from repository
-   Add possibility to have global `exclude` for files
-   Initial symlink support (works only for links referencing up the hierarchy and unique references to external locations)
-   Log file name if parser throws
-   Fixed a decorator issue caused by recent babel/parser bump
-   Dependencies bump
-   Add `CHANGELOG.md`

## 0.0.15 - Clean-up

-   Dependencies bump

## 0.0.14 - Precision

-   Add more precise time measurements for debug
-   Pass `include` and `exclude` into `onProject` - might be helpful for some rules

## 0.0.13 - Performance++

-   **BREAKING** `readFilesData` requires second argument `srcRoots: string[]`
-   Stop using `Object.assign` ([feels bad](https://jsperf.com/assign-vs-set-value))
-   Add [`debug`](https://www.npmjs.com/package/debug)
-   Collocate dependencies retrieval with file reads
-   Bump dependencies

## 0.0.12 - No more web code

-   Use [Quantum](https://fuse-box.org/page/quantum) compilation plugin (removes sniffing for web environment)
-   Replace `@babel/traverse` with `babylon-walk`
-   Add lib folder to the repo
-   Add more unit tests
-   Add coverage information
-   Bump dependencies

## 0.0.11 - Automated publish

-   Using `console.log` for logging - allows to pipe output
-   `readDependencies` accepts an array of source roots now
-   New `all-dependants` rule
-   Unit tests
-   Automated npm publish via Travis CI
-   Bump dependencies

## 0.0.9 - Technical release

-   Expose `readDependencies` and `readFilesData`
-   Bump dependencies

## 0.0.8 - yarn stricter --help

-   Add `--reporter` argument to cli
-   Add `--config` argument to cli
-   Stay quiet when run in continuous integration environment

## 0.0.7 - Improved imports

-   Support `require` import
-   Consider named and wildcard reexports as imports
-   Pass object into `onProject`
-   Pass `rootPath` into `onProject`
-   Support custom implicit extensions
-   `stricter/unused-files` support `relatedEntry` - entries only in case they import anything related to existing entries
-   Log 'Stricter: Checking...', so it's clear the script works
-   Adding unresolved dependencies to the list of dependencies - makes sense for `node_modules`
-   Readme update

## 0.0.6 - Plethora of goodness

-   Read configuration from `stricter.config.js` only
-   Rule files are required to end with `.rule.js`
-   `include` and `exclude` accept a regex, an array of regexes or a function
-   Pass file path relative to root folder to `include` and `exclude` tests
-   File `contents` was renamed into `source`
-   New log level `off`
-   Default log level is `warning`
-   `ast` is now a function that returns AST
-   Error code returned equals number of errors
-   Unit tests
-   Readme update

## 0.0.5 - First default rule

-   Pass rule usage config into `onProject`
-   Pass dependencies into `onProject`
-   Add `stricter/unused-files` rule
-   Remove `onFile` support for rules
-   Rules receive frozen objects as input
-   Improve readme
-   Unit tests

## 0.0.4 - Initial release with CLI

-   The very first pre-release
-   Includes CLI and possibility to add custom rules
