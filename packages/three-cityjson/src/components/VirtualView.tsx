import { ReactNode, useMemo } from "react";

import { AdaptiveDpr } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { Canvas } from "@react-three/fiber";
import { DirectionalLight } from "three";

// import { useAtom } from "jotai";
// import { originAtom } from "../store";

import { themes } from "../themes";
import Controls from "./Controls";
import TooltipCityObject3D from "./TooltipCityObject3D";

export default function VirtualView({
  url,
  theme: themeName = "light",
  background: _background,
  onClick,
  children,
}: {
  url: string;
  theme: "light" | "dark";
  background?: string;
  onClick?: (ev: ThreeEvent<MouseEvent>) => void;
  children?: ReactNode;
}) {
  // const [origin] = useAtom(originAtom);

  // const { camera } = useThree();

  // useEffect(() => {
  //   console.log("origin(App)", origin);
  // }, [origin]);

  const colors = useMemo(() => {
    const theme = themes[themeName];
    return {
      default: theme.primary,
      select: theme.secondary,
    };
  }, [themeName]);

  const background = useMemo(() => {
    if (_background) {
      return _background;
    }
    return themes[themeName].background;
  }, [_background, themeName]);

  const light = useMemo(() => {
    const light = new DirectionalLight(0xffffff, 0.8);
    light.position.set(0, 20000, 20000);
    return light;
  }, []);

  return (
    <div
      style={{
        background: background,
        // border: "1px solid #eee",
        // width: "600px",
        // height: "400px",
        width: "100%",
        height: "100%",
      }}
    >
      <Canvas
        camera={{
          // fov: 70,
          position: [0, 1000, 1000],
          near: 0.1,
          far: 1000 * 40,
        }}
        flat={true}
        onCreated={({ camera, scene }) => {
          camera.add(light);
          scene.add(camera);
        }}
      >
        <AdaptiveDpr pixelated />
        <Controls />
        <ambientLight intensity={2} />
        <TooltipCityObject3D url={url} colors={colors} onClick={onClick} />
        {children}
      </Canvas>
      {/* <div
        className="nav"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          padding: "10px",
          border: "1px solid #eee",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            // border: "1px solid #aaa",
            background: "#fff",
            borderRadius: "4px",
            boxShadow: "0 0 0 2px rgba(0,0,0,.1)",
          }}
        ></div>
      </div> */}
    </div>
  );
}
