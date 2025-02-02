import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import svgr from "vite-plugin-svgr";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        svgr(),
        viteStaticCopy({
            targets: [
                {
                    src: "src/assets/supporters/*",
                    dest: "assets"
                },
            ],
        }),
    ],
    base: "/vrct_supporters/",
    build: {
        outDir: path.resolve(__dirname, "public"),
    },

    resolve: {
        alias: {
            "@root": path.resolve(__dirname),

            "@supporters_settings": path.resolve(__dirname, "./supporters_settings.js"),

            "@images": path.resolve(__dirname, "src/assets"),
            "@supporters_page_assets": path.resolve(__dirname, "src/assets/supporters"),
            "@utils": path.resolve(__dirname, "src/utils.js"),
        },
    },
})
