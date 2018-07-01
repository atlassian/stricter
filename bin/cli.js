#!/usr/bin/env node

var run = require('../lib').cli;
var result = run();
process.exit(result);
