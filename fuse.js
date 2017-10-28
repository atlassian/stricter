const FuseBox = require('fuse-box').FuseBox;
const { TypeScriptHelpers } = require('fuse-box');
const TypeHelper = require('fuse-box-typechecker').TypeHelper;
const isProduction = process.env.NODE_ENV === 'production';

const typeHelper = TypeHelper({
    tsConfig: './tsconfig.json',
    basePath: './',
    tsLint: './tslint.json',
    name: 'App typechecker',
});

const fuse = FuseBox.init({
    globals: { stricter: '*' },
    package: {
        name: 'stricter',
        entry: 'src/index.js',
    },
    plugins: [TypeScriptHelpers()],
    homeDir: 'src',
    output: 'dist/$name.js',
    target: 'server',
});

const bundle = fuse
    .bundle('stricter')
    .instructions(`>[index.ts]`)
    .sourceMaps(true)
    .target('server');

if (!isProduction) {
    bundle.watch().cache(false);
}

bundle.completed(proc => {
    console.log(`\x1b[36m%s\x1b[0m`, `client bundled`);
    typeHelper.runSync();
});

fuse.run();
