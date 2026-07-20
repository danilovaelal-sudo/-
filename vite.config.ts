import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Base path matches the GitHub Pages project URL: https://<user>.github.io/-/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/-/' : '/',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}))
