import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * The real class list never goes into the repo. If a gitignored
 * `roster.local.txt` (one name per line) sits next to this file, its names
 * are baked into THIS build as the default roster — so the copy on the host's
 * laptop starts with the real class, while the public GitHub Pages build
 * (which has no such file) keeps the fictional sample.
 */
function localRoster() {
  const file = resolve(process.cwd(), 'roster.local.txt')
  if (!existsSync(file)) return []
  return readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('#'))
}

export default defineConfig({
  plugins: [react()],
  define: {
    __LOCAL_ROSTER__: JSON.stringify(localRoster()),
  },
  // The harness assigns a free port via the PORT env var (autoPort); 5173 is
  // only the fallback for a bare `npm run dev` outside the harness.
  server: { port: Number(process.env.PORT) || 5173, open: false },
  // GitHub Pages serves project sites from /<repo-name>/, not the domain
  // root. Vite rewrites this into every asset URL it processes at build
  // time; anything referenced by a hardcoded string (see game/audio.js)
  // must read it back via import.meta.env.BASE_URL instead.
  base: process.env.GITHUB_PAGES ? '/noodles/' : '/',
})
