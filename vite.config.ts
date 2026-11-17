import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, ".", "");
  return {
    base: env.VITE_BASE_PATH || "/",
    plugins: [react()],
    define: { __GHOST_CONFIGURED__: JSON.stringify(Boolean(env.VITE_GHOST_API_URL || (command === "serve" && env.GHOST_LOCAL === "1"))) },
    server: { proxy: { "/api/ghost": { target: "http://127.0.0.1:8787", changeOrigin: true, rewrite: (path) => path.replace(/^\/api\/ghost/, "") } } }
  };
});
