import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // The harness assigns a free port via the PORT env var (autoPort); 5173 is
  // only the fallback for a bare `npm run dev` outside the harness.
  server: { port: Number(process.env.PORT) || 5173, open: false },
  // GitHub Pages serves project sites from /<repo-name>/, not the domain
  // root. Vite rewrites this into every asset URL it processes at build
  // time; anything referenced by a hardcoded string (see game/audio.js)
  // must read it back via import.meta.env.BASE_URL instead.
  base: process.env.GITHUB_PAGES ? '/noodles/' : '/',
})
