import { createRender, useModelState } from "@anywidget/react";
import { ThreeEvent } from "@react-three/fiber";
import React, { useCallback, useEffect, useState } from "react";

import { MapView, VirtualView } from "three-cityjson";

import "maplibre-gl/dist/maplibre-gl.css";

const render = createRender(() => {
  // const [initialViewState] = useModelState<any>("_initial_view_state");
  // const [_layers] = useModelState<any[]>("_layers");
  const [mode] = useModelState<string>("mode");

  const [width] = useModelState<number | string>("width");
  const [height] = useModelState<number | string>("height");

  const [theme] = useModelState<"light" | "dark">("theme");
  const [mapStyle] = useModelState<string>("map_style");

  const [data] = useModelState<string>("data");
  const [_click, setClick] = useModelState<any>("click");

  const [objectUrl, setObjectUrl] = useState<string>();

  // const [layers, updateLayers] = useState<any[]>([]);
  // const [_click, setClick] = useModelState<any>("click");

  useEffect(() => {
    let dataUrl = URL.createObjectURL(new Blob([data], { type: "text/plain" }));
    if (true) {
      dataUrl += "#format=jsonl";
    }
    console.log("dataUrl", dataUrl);
    setObjectUrl(dataUrl);
  }, [data]);

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

  if (!objectUrl) {
    return null;
  }

  return mode === "map" ? (
    <div
      style={{
        width: Number.isFinite(width) ? `${width}px` : width,
        height: Number.isFinite(height) ? `${height}px` : height,
      }}
    >
      <MapView
        url={objectUrl}
        theme={theme}
        mapStyle={mapStyle}
        onClick={handleObjectClick}
      />
    </div>
  ) : (
    <div
      style={{
        width: Number.isFinite(width) ? `${width}px` : width,
        height: Number.isFinite(height) ? `${height}px` : height,
      }}
    >
      <VirtualView url={objectUrl} theme={theme} onClick={handleObjectClick} />
    </div>
  );
});

export default { render };
