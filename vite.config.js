import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";
// https://vitejs.dev/config/;

export default defineConfig(({ command, mode }) => {
  const { SERVER_PORT, DEV_SERVER_PORT } = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [eslint(), react()],
    define: {
      global: {}
    },
    build: {
      outDir: "./build/client",
      sourceMap: true
    },
    server: {
      cors: true,
      port: DEV_SERVER_PORT,
      proxy: {
        "/api": {
          target: `http://localhost:${SERVER_PORT}/`,
          changeOrigin: true,
          secure: false
        },
        "/auth": {
          target: `http://localhost:${SERVER_PORT}/`,
          changeOrigin: true,
          secure: false
        }
      }
    },
    // remove following "esbuild" section from config once bug with esbuild is fixed (http://47.57.228.104/vitejs/vite/discussions/8640)
    esbuild: {
      define: {
        this: "window"
      }
    },
    compilerOptions: {
      types: ["vite/client"] // needed for import.meta.env in TS
    }
  };
});
