import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  publicDir: command === "build" ? false : "public",
  plugins: [react(), dts({ rollupTypes: true })],
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        // mapview: resolve(__dirname, "src/components/MapView.tsx"),
      },
      name: "THREECityJSON",
      // the proper extensions will be added
      fileName: "three-cityjson",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["react", "THREE"], // "@react-three/drei", "maplibre-gl", "react-map-gl"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: "React",
        },
      },
    },
  },
}));
