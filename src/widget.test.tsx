import { act, render, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as threeCityjson from "three-cityjson";
import { WidgetView, deserializeLayer } from "./widget";

vi.mock("@anywidget/react", () => {
  const state = new Map<string, [any, (value: any) => void]>();

  const createSetter = (key: string) => {
    const setter = vi.fn((next: any) => {
      state.set(key, [next, setter]);
    });
    return setter;
  };

  return {
    createRender: (factory: any) => {
      return factory;
    },
    useModelState: (key: string) => {
      if (!state.has(key)) {
        throw new Error(`model state for "${key}" not initialised`);
      }
      return state.get(key)!;
    },
    __setModelState: (
      key: string,
      value: any,
      setter?: (value: any) => void,
    ) => {
      const finalSetter = setter ?? createSetter(key);
      state.set(key, [value, finalSetter]);
      return finalSetter;
    },
    __clearModelState: () => {
      state.clear();
    },
  };
});

vi.mock("react-shadow", () => {
  return {
    default: {
      div: ({ children, ...props }: any) =>
        React.createElement("div", props, children),
    },
  };
});

let mapViewSpy: vi.SpyInstance;
let virtualViewSpy: vi.SpyInstance;

declare module "@anywidget/react" {
  export function __setModelState(
    key: string,
    value: any,
    setter?: (value: any) => void,
  ): (value: any) => void;
  export function __clearModelState(): void;
}

const initialiseDefaults = async (
  mode: "map" | "virtual",
  layersPayload: any[],
) => {
  const anywidget = await import("@anywidget/react");
  const setModelState = (anywidget as any).__setModelState as (
    key: string,
    value: any,
    setter?: (value: any) => void,
  ) => (value: any) => void;
  const clearModelState = (anywidget as any).__clearModelState as () => void;

  clearModelState();

  setModelState("mode", mode);
  setModelState("width", "100%");
  setModelState("height", 500);
  setModelState("theme", mode === "map" ? "dark" : "light");
  setModelState("map_style", "dark");
  setModelState("_layers", layersPayload);
  setModelState("click", null, vi.fn());
};

describe("widget helpers", () => {
  it("drops nullish values before instantiating CityJSONLayer", async () => {
    const serialized = {
      type: "CityJSONLayer",
      data: { key: "value" },
      format: null,
      getFillColor: null,
    };

    const instance = deserializeLayer(serialized);

    expect(instance).toBeInstanceOf(threeCityjson.CityJSONLayer);
    expect((instance as threeCityjson.CityJSONLayer).data).toEqual({
      key: "value",
    });
    expect((instance as threeCityjson.CityJSONLayer).format).toBe("cityjson");
  });

  it("supports overriding layer format", () => {
    const serialized = {
      type: "CityJSONLayer",
      data: "value",
      format: "cityjsonseq" as const,
    };

    const instance = deserializeLayer(serialized);

    expect(instance).toBeInstanceOf(threeCityjson.CityJSONLayer);
    expect((instance as threeCityjson.CityJSONLayer).format).toBe(
      "cityjsonseq",
    );
  });
});

describe("WidgetView", () => {
  beforeEach(() => {
    mapViewSpy = vi
      .spyOn(threeCityjson, "MapView")
      .mockImplementation((props: any) => {
        return React.createElement("div", { "data-testid": "map-view" });
      });
    virtualViewSpy = vi
      .spyOn(threeCityjson, "VirtualView")
      .mockImplementation((props: any) => {
        return React.createElement("div", { "data-testid": "virtual-view" });
      });
  });

  afterEach(async () => {
    const anywidget = await import("@anywidget/react");
    const clearModelState = (anywidget as any).__clearModelState as () => void;
    clearModelState();
    vi.restoreAllMocks();
  });

  it("renders MapView when mode is map", async () => {
    await initialiseDefaults("map", [
      {
        type: "CityJSONLayer",
        data: "demo-data",
        format: "cityjsonseq",
      },
    ]);

    render(<WidgetView />);

    await waitFor(() => {
      expect(mapViewSpy).toHaveBeenCalled();
    });

    expect(virtualViewSpy).not.toHaveBeenCalled();
    const lastCall = mapViewSpy.mock.calls.at(-1)![0];
    expect(lastCall.layers).toHaveLength(1);
    expect(lastCall.theme).toBe("dark");
    expect(lastCall.mapStyle).toBe("dark");
  });

  it("renders VirtualView when mode is virtual", async () => {
    await initialiseDefaults("virtual", [
      {
        type: "CityJSONLayer",
        data: "demo-data",
        format: "cityjson",
      },
    ]);

    render(<WidgetView />);

    await waitFor(() => {
      expect(virtualViewSpy).toHaveBeenCalled();
    });

    expect(mapViewSpy).not.toHaveBeenCalled();
    const lastCall = virtualViewSpy.mock.calls.at(-1)![0];
    expect(lastCall.layers).toHaveLength(1);
    expect(lastCall.theme).toBe("light");
  });

  it("commits selected click payloads to the model", async () => {
    await initialiseDefaults("map", [
      {
        type: "CityJSONLayer",
        data: "demo-data",
        format: "cityjson",
      },
    ]);

    const anywidget = await import("@anywidget/react");
    const setModelState = (anywidget as any).__setModelState as (
      key: string,
      value: any,
      setter?: (value: any) => void,
    ) => (value: any) => void;

    const clickSetter = vi.fn();
    setModelState("click", null, clickSetter);

    render(<WidgetView />);

    await waitFor(() => {
      expect(mapViewSpy).toHaveBeenCalled();
    });

    const lastCall = mapViewSpy.mock.calls.at(-1)![0];

    await act(async () => {
      lastCall.onClick({
        geometries: [
          {
            userData: {
              selected: true,
              identifier: "feature-1",
            },
          },
        ],
        batchId: 0,
      });
    });

    expect(clickSetter).toHaveBeenCalledWith({ identifier: "feature-1" });
  });
});
