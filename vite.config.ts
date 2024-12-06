import path from "path";
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import { parse } from "yaml";

export default defineConfig({
  plugins: [
    {
      name: "yaml-plugin",
      load(id, options) {
        if (id.endsWith(".yaml")) {
          const content = readFileSync(id, "utf8");
          const yaml = parse(content);

          return {
            code: `export default ${JSON.stringify(yaml)}`
          };
        }
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    hmr: {
      port: 5174,
    },
    watch: {
      usePolling: true
    }
  }
});
