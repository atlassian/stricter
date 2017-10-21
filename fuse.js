const FuseBox = require('fuse-box').FuseBox;
const isProduction = process.env.NODE_ENV === 'production';

const fuse = FuseBox.init({
    globals: { stricter: '*' },
    package: {
        name: 'stricter',
        entry: 'src/index.js',
    },
    homeDir: 'src',
    output: 'dist/$name.js',
    target : 'server',
});
const bundle = fuse.bundle('stricter')
    .instructions(`>[index.ts]`)
    .sourceMaps(true);

if (!isProduction) {
    bundle.watch();
}

fuse.run();