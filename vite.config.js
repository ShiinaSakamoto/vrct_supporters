import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import svgr from "vite-plugin-svgr";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), svgr()],
    base: "/vrct_supporters/",
    build: {
        outDir: path.resolve(__dirname, "docs"),
    },

    resolve: {
        alias: {
            "@root": path.resolve(__dirname),

            "@images": path.resolve(__dirname, "src/assets"),
            "@supporters_page_assets": path.resolve(__dirname, "public/supporters"),
            "@utils": path.resolve(__dirname, "src/utils.js"),
        },
    },
})
