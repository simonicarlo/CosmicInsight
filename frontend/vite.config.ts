import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(() => {
  const env = loadEnv("", process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      port: parseInt(env.VITE_FRONTEND_PORT) || 5100, // Set port for preview
      proxy: {
        "/api": {
          target: env.VITE_API_URL,
        },
      },
    },
    preview: {
      port: parseInt(env.VITE_FRONTEND_PORT) || 5100, // Set port for preview
    },
  };
});
