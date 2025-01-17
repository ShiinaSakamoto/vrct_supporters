import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    base: "/vrct_supporters/",
    build: {
        outDir: path.resolve(__dirname, "docs"),
    },
    plugins: [react()],
})
