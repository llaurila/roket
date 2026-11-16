import path from "path";
import { existsSync, readFileSync } from "node:fs";
import { defineConfig } from "vite";
import { parse } from "yaml";

const LOCAL_CERTIFICATE_DIRECTORY = path.resolve(import.meta.dirname, ".certs");
const LOCAL_KEY_PATH = path.join(LOCAL_CERTIFICATE_DIRECTORY, "lan-key.pem");
const LOCAL_CERTIFICATE_PATH = path.join(LOCAL_CERTIFICATE_DIRECTORY, "lan-cert.pem");

function getLocalHttpsOptions() {
  const hasKey = existsSync(LOCAL_KEY_PATH);
  const hasCertificate = existsSync(LOCAL_CERTIFICATE_PATH);

  if (!hasKey && !hasCertificate) return undefined;
  if (!hasKey || !hasCertificate) {
    throw new Error("Both .certs/lan-key.pem and .certs/lan-cert.pem are required for HTTPS.");
  }

  return {
    key: readFileSync(LOCAL_KEY_PATH),
    cert: readFileSync(LOCAL_CERTIFICATE_PATH)
  };
}

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
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    https: getLocalHttpsOptions(),
    hmr: {
      port: 5174,
    },
    watch: {
      usePolling: true
    }
  }
});
