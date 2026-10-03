// Vite configuration for GitHub Pages deployment
// Base path is set to relative ('./') so that it deploys seamlessly to any GitHub Pages repository path
const path = require('path');

module.exports = {
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
};
