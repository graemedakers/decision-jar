
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        include: ['**/*.test.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'tests/',
                '**/*.config.ts',
                '**/*.d.ts',
                '.next/',
            ],
        },
        alias: [
            { find: /^next\/server$/, replacement: resolve(__dirname, './tests/mocks/next-server.ts') },
            { find: /^@\/(.*)$/, replacement: resolve(__dirname, './$1') },
        ]
    },
})
