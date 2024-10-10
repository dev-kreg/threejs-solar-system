import { defineConfig } from 'vite'
import restart from 'vite-plugin-restart'

export default defineConfig({
    base: '/threejs-solar-system/',
    root: 'src/',
    publicDir: 'assets',
    server: {
        port: 4200,
        host: true,
        open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env)
    },
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        sourcemap: true,
        assetsDir: 'assets',
        rollupOptions: {
            input: {
                main: 'src/index.html',
            },
        },
    },
    plugins: [
        restart({ restart: ['assets/**',] })
    ],
})