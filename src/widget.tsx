import { createRender, useModelState } from "@anywidget/react";
import { ThreeEvent } from "@react-three/fiber";
import React, { useCallback, useEffect, useState } from "react";

import root from "react-shadow";

import { CityJSONLayer, MapView, VirtualView } from "three-cityjson";

import "maplibre-gl/dist/maplibre-gl.css";

function deserializeLayer(serializedLayer: any) {
  const { type, ..._args } = serializedLayer;

  let args = Object.entries(_args).reduce((acc, [key, value]) => {
    // console.log(key, value);
    return value === null ? acc : { ...acc, [key]: value };
  }, {});

  console.log("args.format", args.format);

  return new CityJSONLayer(args.data, args.format);
}

const render = createRender(() => {
  // const [initialViewState] = useModelState<any>("_initial_view_state");
  const [mode] = useModelState<string>("mode");

  const [width] = useModelState<number | string>("width");
  const [height] = useModelState<number | string>("height");

  const [theme] = useModelState<"light" | "dark">("theme");
  const [mapStyle] = useModelState<string>("map_style");

  // const [data] = useModelState<string>("data");
  const [_layers] = useModelState<any[]>("_layers");
  const [_click, setClick] = useModelState<any>("click");

  const [layers, updateLayers] = useState<CityJSONLayer[]>([]);

  useEffect(() => {
    console.log("_layers", _layers);
    const deserializedLayers = _layers.map((layer) => deserializeLayer(layer));
    updateLayers(deserializedLayers);
  }, [_layers]);

  const handleObjectClick = useCallback((ev: ThreeEvent<MouseEvent>) => {
    // ev.stopPropagation();
    const geometries = ev.geometries;
    const clicked = ev.batchId;
    const isSelected = geometries[clicked].userData?.selected;
    if (!isSelected) {
      return;
    }
    const value = geometries[clicked].userData;
    // console.log("handleObjectClick", value);
    // Delete `selected` property after copying
    const { selected, ...cityObject } = value;
    setClick(cityObject);
  }, []);

  return (
    <root.div
      style={{
        width: Number.isFinite(width) ? `${width}px` : width,
        height: Number.isFinite(height) ? `${height}px` : height,
      }}
    >
      {mode === "map" ? (
        <MapView
          layers={layers}
          theme={theme}
          mapStyle={mapStyle}
          onClick={handleObjectClick}
        />
      ) : (
        <VirtualView
          layers={layers}
          theme={theme}
          onClick={handleObjectClick}
        />
      )}
    </root.div>
  );
});

export default { render };
