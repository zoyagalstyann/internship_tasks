const { defineConfig } = require("vite");
const react = require("@vitejs/plugin-react");

module.exports = defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/tasks": "http://localhost:3000",
      "/users": "http://localhost:3000",
      "/categories": "http://localhost:3000"
    }
  }
});