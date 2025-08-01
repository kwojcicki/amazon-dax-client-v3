import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['index.ts'],
    dts: true, // Generate TypeScript declaration files
    clean: true, // Clean output directory before build
    target: 'es2022',
    splitting: false, // Disable code splitting for better compatibility
    sourcemap: true, // Generate source maps
    minify: false, // Set to true for production builds
    outDir: 'dist',
    // Ensure proper file extensions
    outExtension({ format }) {
        return {
            js: format === 'cjs' ? '.cjs' : '.mjs',
        };
    }
});