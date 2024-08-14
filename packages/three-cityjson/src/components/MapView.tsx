import { useEffect, useMemo } from "react";

import { AdaptiveDpr } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useThree } from "@react-three/fiber";
import { DirectionalLight } from "three";

import Map, { NavigationControl } from "react-map-gl/maplibre";
import { Canvas, Coordinates } from "react-three-map/maplibre";

import TooltipCityObject3D from "./TooltipCityObject3D";

import { useAtom } from "jotai";
import { originAtom } from "../store";

import "maplibre-gl/dist/maplibre-gl.css";
import { themes } from "../themes";

const theme = themes.dark;

function Lighting() {
  const { camera, scene } = useThree();

  const light = useMemo(() => {
    const light = new DirectionalLight(0xffffff, 0.8);
    light.position.set(0, 20000, 20000);
    return light;
  }, []);

  useEffect(() => {
    if (!camera || !scene || !light) return;
    // console.log("camera1", camera);
    camera.add(light);
    // scene.add(light);
  }, [camera, scene, light]);

  return null;
}

const MAP_STYLES = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

export default function MapView({
  url,
  theme: themeName = "dark",
  mapStyle: _mapStyle = "dark",
  onClick,
  children,
}: {
  url: string;
  children?: React.ReactNode;
  theme: "light" | "dark";
  mapStyle?: "light" | "dark";
  onClick?: (ev: ThreeEvent<MouseEvent>) => void;
}) {
  const [origin] = useAtom(originAtom);

  const colors = useMemo(() => {
    const theme = themes[themeName];
    return {
      default: theme.primary,
      select: theme.secondary,
    };
  }, [themeName]);

  const mapStyle = useMemo(() => {
    return MAP_STYLES[_mapStyle] || _mapStyle;
  }, [_mapStyle]);

  // useEffect(() => {
  //   console.log("origin(App)", origin);
  // }, [origin]);

  return (
    <Map
      initialViewState={{
        latitude: 0,
        longitude: 0,
        zoom: 13,
        pitch: 40,
      }}
      maxPitch={85}
      mapStyle={mapStyle}
      cursor="default"
      boxZoom={false}
      doubleClickZoom={false}
      antialias={true}
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <Canvas latitude={0} longitude={0} flat={true}>
        <AdaptiveDpr pixelated />
        <Coordinates latitude={origin.lat || 0} longitude={origin.lon || 0}>
          <ambientLight intensity={2} />
          <TooltipCityObject3D url={url} colors={colors} onClick={onClick} />
          <Lighting />
          {children}
        </Coordinates>
      </Canvas>
      <NavigationControl />
    </Map>
  );
}
