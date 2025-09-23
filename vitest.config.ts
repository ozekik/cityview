import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    deps: {
      optimizer: {
        web: {
          include: ["three-cityjson"],
        },
      },
    },
    coverage: {
      reporter: ["text", "lcov"],
    },
  },
  esbuild: {
    jsx: "automatic",
  },
});
