import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

import "@testing-library/jest-dom/vitest";

vi.mock("maplibre-gl/dist/maplibre-gl.css", () => ({}), { virtual: true });

afterEach(() => {
  cleanup();
});
