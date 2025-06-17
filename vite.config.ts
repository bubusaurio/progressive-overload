import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'

export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(), tailwindcss()
    ],
    server: {
      host: '192.168.68.119',
      https: {
        key: fs.readFileSync(env.VITE_HTTPS_KEY),
        cert: fs.readFileSync(env.VITE_HTTPS_CERT),
      },
    },
  }
})


