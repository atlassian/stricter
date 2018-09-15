import autoExternal from 'rollup-plugin-auto-external';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';

import pkg from './package.json';

const extensions = ['.ts', '.mjs', '.js', '.json', '.node'];

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
        ],
    },
];
