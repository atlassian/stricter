// @flow

import { spawn } from 'child_process';
import autoExternal from 'rollup-plugin-auto-external';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';

import pkg from './package.json';

const production = !process.env.ROLLUP_WATCH;
const extensions = ['.ts', '.mjs', '.js', '.json', '.node'];

function execute(commands) {
    return {
        name: 'execute',
        buildStart() {
            const copy = commands.slice(0);
            const that = this;
            const next = () => {
                if (!commands.length) {
                    return;
                }

                const command = commands.shift();
                spawn(command, {
                    shell: true,
                    stdio: 'inherit',
                    env: process.env,
                }).on('close', code => {
                    if (code !== 0) {
                        const message = `${command} failed`;

                        if (production) {
                            that.error(message);
                        } else {
                            that.warn(message);
                        }
                    } else {
                        next();
                    }
                });
            };
            next();
        },
    };
}

export default [
    {
        input: 'src/index.ts',
        output: [{ file: pkg.main, format: 'cjs' }, { file: pkg.module, format: 'es' }],
        plugins: [
            resolve({
                jsnext: true,
                extensions,
            }),
            babel({
                exclude: 'node_modules/**',
                extensions,
            }),
            autoExternal(),
            replace({
                'process.env.STRICTER_VERSION': JSON.stringify(pkg.version),
            }),
            execute(['tsc --noEmit', 'tslint --project .']),
        ],
    },
];
