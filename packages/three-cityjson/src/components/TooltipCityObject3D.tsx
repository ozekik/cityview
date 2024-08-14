import { useCallback, useState } from "react";

import { Html } from "@react-three/drei";

import type { ThreeEvent } from "@react-three/fiber";
import BatchedCityObject3D from "./BatchedCityObject3D";

export default function TooltipCityObject3D({
  url,
  colors,
  ...props
}: {
  url: string;
  colors: { default: string; select: string };
}) {
  const [hovered, hover] = useState<number>();
  const [displayValue, setDisplayValue] = useState<string>();
  const [pointer, updatePointer] = useState<{
    x: number;
    y: number;
    z: number;
  }>();
  const [geometries, setGeometries] = useState<any>([]);

  const handleHover = useCallback((ev: ThreeEvent<PointerEvent>) => {
    ev.stopPropagation();
    const geometries = ev.geometries;
    setGeometries(geometries);
    updatePointer({ x: ev.point.x, y: ev.point.y, z: ev.point.z });
    const hovered = ev.batchId;
    hover(hovered);
    const value =
      geometries[hovered].userData?.attributes?.name ||
      geometries[hovered].userData?.attributes?.buildingId ||
      null;
    setDisplayValue(value);
  }, []);

  return (
    <>
      <BatchedCityObject3D
        url={url}
        onPointerMove={handleHover}
        onPointerOut={() => hover(undefined)}
        colors={colors}
        {...props}
      />
      {hovered && displayValue && (
        <Html
          position={[pointer?.x || 0, pointer?.y || 0, pointer?.z || 0]}
          style={{ pointerEvents: "none", userSelect: "none" }}
          className="tooltip"
        >
          <div
            style={{
              background: "#333",
              color: "#fff",
              // border: "1px solid #eee",
              borderRadius: "4px",
              fontSize: "0.7rem",
              fontFamily: "sans-serif",
              padding: "4px 8px",
              width: "max-content",
              maxWidth: "200px",
            }}
          >
            <span>{hovered !== undefined ? `${displayValue}` : null}</span>
          </div>
        </Html>
      )}
    </>
  );
}
