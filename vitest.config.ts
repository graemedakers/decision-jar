
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    plugins: [],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: [],
        include: ['**/*.test.{ts,tsx}'],
        alias: {
            '@': resolve(__dirname, './')
        }
    },
})
