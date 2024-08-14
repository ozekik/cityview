import { useCallback, useEffect, useRef, useState } from "react";

import { Object3DNode, ThreeEvent, useLoader } from "@react-three/fiber";
import { BatchedMesh, Color, Float32BufferAttribute } from "three";

import { useMap } from "react-three-map/maplibre";

import { useAtom } from "jotai";
import { originAtom } from "../store";

import { CityJSONLoader } from "../CityJSONLoader";

declare module "@react-three/fiber" {
  interface ThreeElements {
    batchedMesh: Object3DNode<BatchedMesh, typeof BatchedMesh>;
  }
}

function useExtendedHandler(handler: any, extraProperties: any) {
  if (!handler) return undefined;

  return useCallback(
    (ev: any) => {
      handler && handler({ ...ev, ...extraProperties });
    },
    [handler, extraProperties],
  );
}

export default function BatchedCityObject3D({
  url,
  colors = {
    default: "#e5e3e3",
    select: "#ffff00",
  },
  onClick,
  onPointerMove,
  onPointerOut,
  ...props
}: {
  url: string;
  colors?: { default: string; select: string };
  onClick?: (ev: ThreeEvent<MouseEvent>) => void;
  onPointerMove?: (ev: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (ev: ThreeEvent<PointerEvent>) => void;
} & JSX.IntrinsicElements["batchedMesh"]) {
  const [, setOrigin] = useAtom(originAtom);

  const [needsUpdate, setNeedsUpdate] = useState(true);

  // TODO: Add error handling
  const {
    geometries,
    vertexCount,
    indexCount,
    origin: modelOrigin,
  } = useLoader(CityJSONLoader, url, (loader) => {
    // console.log("loader", loader);
  });

  const map = useMap();

  useEffect(() => {
    if (!map || !modelOrigin || !setOrigin) return;
    // console.log("modelOrigin", modelOrigin);

    const _origin = { lon: modelOrigin[1], lat: modelOrigin[0] };
    setOrigin(_origin);
    map.setCenter(_origin);
  }, [modelOrigin, map, setOrigin]);

  const meshRef = useRef<BatchedMesh>(null!);

  useEffect(() => {
    const mesh = meshRef.current;

    // console.log("mesh", mesh);
    console.log("needsUpdate", needsUpdate);

    if (!mesh || !needsUpdate) return;

    // console.log("meshRef", mesh);

    // console.log("geometries", geometries);

    for (let i = 0; i < geometries.length; i++) {
      const geom = geometries[i];

      // Set vertex colors
      const baseColor = new Color(colors.default);
      const colorArray = new Float32Array(
        geom.attributes.position.array.length,
      );
      for (let j = 0; j < colorArray.length; j += 3) {
        colorArray[j] = baseColor.r;
        colorArray[j + 1] = baseColor.g;
        colorArray[j + 2] = baseColor.b;
      }
      geom.setAttribute("color", new Float32BufferAttribute(colorArray, 3));

      // mesh.addGeometry(geometries[i]);
      mesh.addGeometry(geom);
    }

    // console.log("mesh", mesh);

    setNeedsUpdate(false);

    return () => {
      mesh.geometry.dispose();
      // setNeedsUpdate(true);
      console.log("cleanup");
    };
  }, [colors, geometries, needsUpdate]);

  useEffect(() => {
    // TODO: Refactor this
    const mesh = meshRef.current;

    for (let i = 0; i < geometries.length; i++) {
      const geom = geometries[i];

      // Set vertex colors
      const baseColor = new Color(colors.default);
      const colorArray = new Float32Array(
        geom.attributes.position.array.length,
      );
      for (let j = 0; j < colorArray.length; j += 3) {
        colorArray[j] = baseColor.r;
        colorArray[j + 1] = baseColor.g;
        colorArray[j + 2] = baseColor.b;
      }
      geom.setAttribute("color", new Float32BufferAttribute(colorArray, 3));

      // mesh.addGeometry(geometries[i]);
      mesh.setGeometryAt(i, geom);
    }
  }, [colors]);

  const handlePointerMove = useExtendedHandler(onPointerMove, { geometries });
  const handlePointerOut = useExtendedHandler(onPointerOut, { geometries });

  const handleUserClick = useExtendedHandler(onClick, { geometries });

  const handleClick = useCallback(
    (ev: ThreeEvent<MouseEvent>) => {
      const geom = geometries[ev.batchId];
      geom.userData.selected = !geom.userData.selected;
      const updatedColor = new Color(
        geom.userData.selected ? colors.select : colors.default,
      );
      // const updatedColor = geom.userData.selected ? [1, 1, 0] : [1, 1, 1];
      const colorArray = new Float32Array(
        geom.attributes.position.array.length,
      );
      for (let j = 0; j < colorArray.length; j += 3) {
        colorArray[j] = updatedColor.r;
        colorArray[j + 1] = updatedColor.g;
        colorArray[j + 2] = updatedColor.b;
      }
      geom.setAttribute("color", new Float32BufferAttribute(colorArray, 3));
      meshRef.current.setGeometryAt(ev.batchId, geom);

      if (handleUserClick) {
        handleUserClick(ev);
      }
    },
    [handleUserClick, colors, geometries],
  );

  if (!geometries) return null;

  return (
    <>
      <batchedMesh
        ref={meshRef}
        args={[geometries.length, vertexCount, indexCount]}
        // scale={[20, 20, 20]}
        // position={[0, 0, 0]}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        {...props}
      >
        {/* <batchedStandardMaterial ref={matRef} args={[data.length]} /> */}
        {/* <meshNormalMaterial side={DoubleSide} /> */}
        <meshLambertMaterial
          color={0xffffff} // "#E5E3E3"
          vertexColors={true}
          // side={DoubleSide}
          // polygonOffset
          // polygonOffsetUnits={1}
        />
      </batchedMesh>
    </>
  );
}
