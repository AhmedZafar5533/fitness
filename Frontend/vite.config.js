import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
const isProduction = true;

// https://vite.dev/config/
export default defineConfig({
    logLevel: isProduction ? "silent" : "error",
    esbuild: {
        // Remove console.log in production builds
        pure: isProduction ? ["console.log"] : [],
        // drop: isProduction ? ['console', 'debugger'] : [], // More aggressive
    },
    build: {
        minify: "terser",
        terserOptions: {
            compress: {
                drop_console: true, // Remove console logs in production
            },
        },
    },
    plugins: [tailwindcss(), react()],
});

