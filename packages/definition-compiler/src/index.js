const { register } = require('esbuild-register/dist/node');

register({
    jsxFragment: 'FRAGMET',
    jsxFactory: 'h',
    jsx: 'transform',
});
