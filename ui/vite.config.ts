import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root,
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: {
    // One self-contained index.html: the Worker serves it from the ASSETS binding and only has
    // to patch a single file to inject the session token.
    outDir: fileURLToPath(new URL('../public', import.meta.url)),
    emptyOutDir: true,
  },
});
