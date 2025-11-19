import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: { label: "language-client", color: "green" },
    printConsoleTrace: true,
    includeTaskLocation: true,
    logHeapUsage: true,
    isolate: true,
    // pool: 'vmThreads',
    root: __dirname,
    // logHeapUsage: true,
  },
});
