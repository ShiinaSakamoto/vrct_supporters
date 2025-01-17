import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],

    build: {
      outDir: path.resolve(__dirname, "dist"),
      rollupOptions: {
          input: {
              main: path.resolve(__dirname, "index.html"),
          },
      },
  },
})
