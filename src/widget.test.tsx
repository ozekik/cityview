import { act, render, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

vi.mock("three-cityjson", () => {
  const cityJsonLayerConstructs: Array<{ data: unknown; formatArg: unknown }> =
    [];
  const mapViewCalls: Array<any> = [];
  const virtualViewCalls: Array<any> = [];

  class CityJSONLayer {
    data: unknown;
    format: string;

    constructor(data: unknown, format?: "cityjson" | "cityjsonseq") {
      cityJsonLayerConstructs.push({ data, formatArg: format });
      this.data = data;
      this.format = format ?? "cityjson";
    }
  }

  const MapView = vi.fn((props: any) => {
    mapViewCalls.push(props);
    return React.createElement("div", { "data-testid": "map-view" });
  });

  const VirtualView = vi.fn((props: any) => {
    virtualViewCalls.push(props);
    return React.createElement("div", { "data-testid": "virtual-view" });
  });

  const reset = () => {
    cityJsonLayerConstructs.length = 0;
    mapViewCalls.length = 0;
    virtualViewCalls.length = 0;
    MapView.mockClear();
    VirtualView.mockClear();
  };

  return {
    CityJSONLayer,
    MapView,
    VirtualView,
    __mocks: {
      cityJsonLayerConstructs,
      mapViewCalls,
      virtualViewCalls,
      reset,
    },
  };
});

declare module "@anywidget/react" {
  export function __setModelState(
    key: string,
    value: any,
    setter?: (value: any) => void,
  ): (value: any) => void;
  export function __clearModelState(): void;
}

declare module "three-cityjson" {
  export const __mocks: {
    cityJsonLayerConstructs: Array<{ data: unknown; formatArg: unknown }>;
    mapViewCalls: Array<any>;
    virtualViewCalls: Array<any>;
    reset: () => void;
  };
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

const resetThreeCityJsonMocks = async () => {
  const module = await import("three-cityjson");
  const reset = (module as any).__mocks.reset as () => void;
  reset();
};

describe("widget helpers", () => {
  beforeEach(async () => {
    await resetThreeCityJsonMocks();
  });

  it("drops nullish values before instantiating CityJSONLayer", async () => {
    const module = await import("three-cityjson");
    const mocks = (module as any).__mocks;

    const serialized = {
      type: "CityJSONLayer",
      data: { key: "value" },
      format: null,
      getFillColor: null,
    };

    const instance = deserializeLayer(serialized);

    expect(instance).toBeInstanceOf(Object);
    expect(mocks.cityJsonLayerConstructs).toHaveLength(1);
    expect(mocks.cityJsonLayerConstructs[0]).toEqual({
      data: { key: "value" },
      formatArg: undefined,
    });
  });
});

describe("WidgetView", () => {
  beforeEach(async () => {
    await resetThreeCityJsonMocks();
  });

  afterEach(async () => {
    const anywidget = await import("@anywidget/react");
    const clearModelState = (anywidget as any).__clearModelState as () => void;
    clearModelState();
  });

  it("renders MapView when mode is map", async () => {
    const module = await import("three-cityjson");
    const mocks = (module as any).__mocks;

    await initialiseDefaults("map", [
      {
        type: "CityJSONLayer",
        data: "demo-data",
        format: "cityjsonseq",
      },
    ]);

    render(<WidgetView />);

    await waitFor(() => {
      expect(mocks.mapViewCalls.length).toBeGreaterThan(0);
    });

    expect(mocks.virtualViewCalls).toHaveLength(0);
    const lastCall = mocks.mapViewCalls.at(-1);
    expect(lastCall.layers).toHaveLength(1);
    expect(lastCall.theme).toBe("dark");
    expect(lastCall.mapStyle).toBe("dark");
  });

  it("renders VirtualView when mode is virtual", async () => {
    const module = await import("three-cityjson");
    const mocks = (module as any).__mocks;

    await initialiseDefaults("virtual", [
      {
        type: "CityJSONLayer",
        data: "demo-data",
        format: "cityjson",
      },
    ]);

    render(<WidgetView />);

    await waitFor(() => {
      expect(mocks.virtualViewCalls.length).toBeGreaterThan(0);
    });

    expect(mocks.mapViewCalls).toHaveLength(0);
    const lastCall = mocks.virtualViewCalls.at(-1);
    expect(lastCall.layers).toHaveLength(1);
    expect(lastCall.theme).toBe("light");
  });

  it("commits selected click payloads to the model", async () => {
    const module = await import("three-cityjson");
    const mocks = (module as any).__mocks;

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
      expect(mocks.mapViewCalls.length).toBeGreaterThan(0);
    });

    const lastCall = mocks.mapViewCalls.at(-1);

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
