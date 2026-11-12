import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  if (mode === 'production') {
    const apiUrl = env.VITE_API_URL?.trim()
    let parsedApiUrl

    try {
      parsedApiUrl = new URL(apiUrl)
    } catch {
      throw new Error('VITE_API_URL must be set to the production API base URL, for example https://api.example.com/api.')
    }

    const apiPath = parsedApiUrl.pathname.replace(/\/+$/, '')
    if (parsedApiUrl.protocol !== 'https:'
      || !parsedApiUrl.hostname
      || apiPath !== '/api'
      || parsedApiUrl.username
      || parsedApiUrl.password
      || parsedApiUrl.search
      || parsedApiUrl.hash
      || apiUrl.includes('YOUR-')) {
      throw new Error('VITE_API_URL must be a real HTTPS API URL ending in /api, without credentials, query parameters, or placeholders.')
    }
  }

  return {
    plugins: [react()],
  }
})
