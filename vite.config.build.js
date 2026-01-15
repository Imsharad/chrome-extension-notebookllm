import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                content: resolve(__dirname, 'src/content.js'),
                background: resolve(__dirname, 'src/background.js'),
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name].[hash].js',
                assetFileNames: '[name].[ext]',
            },
        },
    },
});
