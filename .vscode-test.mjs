import { defineConfig } from "@vscode/test-cli";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const testFolderPath = path.resolve(__dirname, "./sample_project");

export default defineConfig({
  files: "out/test/**/*.test.js",
  launchArgs: ["--folder-uri=file://" + testFolderPath],
});
