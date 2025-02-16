const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['src/app.bootstrap.ts'],
    bundle: true,
    platform: 'node',
    outdir: 'build',
    sourcemap: true,
    minify: true,
    target: 'node20',
    format: 'cjs',
    external: ['aws-sdk', 'mock-aws-s3', 'nock'],
    loader: { '.html': 'text' },
    logLevel: 'error'
}).catch((err) => {
    console.error('Build failed:', err);
    process.exit(1);
});