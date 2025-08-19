import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/GameMED/',   // repo name (for GitHub Pages)
  plugins: [react()],
})
