import { useRef } from "react";

import { MapControls, TrackballControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export default function Controls() {
  const mapControlsRef = useRef(null);
  const zoomControlsRef = useRef(null);

  useFrame(() => {
    if (!mapControlsRef.current || !zoomControlsRef.current) return;
    const target = mapControlsRef.current.target;
    zoomControlsRef.current.target = target;
  });

  return (
    <>
      <MapControls
        ref={mapControlsRef}
        enableDamping
        enableZoom={false}
        maxPolarAngle={Math.PI / 2}
        maxDistance={10000}
      />
      <TrackballControls
        ref={zoomControlsRef}
        noPan={true}
        noRotate={true}
        noZoom={false}
        zoomSpeed={0.5}
      />
    </>
  );
}
