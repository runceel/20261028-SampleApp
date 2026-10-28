import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, ".", "");
  const apiUrl = env.API_HTTPS ?? env.services__api__https__0 ?? env.API_HTTP ?? env.services__api__http__0 ?? env.API_BASE_URL;
  if (command === "serve" && !apiUrl) {
    throw new Error("API の接続先がありません。Aspire から起動するか、API_BASE_URL を設定してください。");
  }
  return {
    plugins: [react()],
    css: { postcss: { plugins: [] } },
    server: {
      proxy: apiUrl ? { "/api": { target: apiUrl, changeOrigin: true } } : undefined,
      watch: {
        ignored: ["**/.vs/**", "**/.git/**", "**/node_modules/**", "**/dist/**", "**/bin/**", "**/obj/**", "**/src/SampleApp.AppHost/**"],
      },
    },
  };
});
