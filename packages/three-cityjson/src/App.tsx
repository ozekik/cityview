import { useEffect, useState } from "react";
import MapView from "./components/MapView";
import VirtualView from "./components/VirtualView";
import { CityJSONLayer } from "./layers/CityJSONLayer";
import { useControls } from "leva";

const url = "/sample/daiba_sta.city.jsonl";
// const url = "/sample/tamachi_sta.city.jsonl";

function App() {
  // const mode: "map" | "virtual" = "virtual";
  const { mode, theme } = useControls({
    mode: { options: { virtual: "virtual", map: "map" } },
    theme: { options: { light: "light", dark: "dark" } },
  });

  const [layers, setLayers] = useState<CityJSONLayer[]>([]);

  // Fetch the CityJSON file from the url
  useEffect(() => {
    (async () => {
      const response = await fetch(url);
      const text = await response.text();
      // console.log("CityJSON", text);
      const layer = new CityJSONLayer(text, "cityjsonseq");
      console.log("CityJSONLayer", layer);
      setLayers([layer]);
      // let dataUrl = URL.createObjectURL(
      //   new Blob([text], { type: "text/plain" }),
      // );
      // if (url.endsWith(".jsonl")) {
      //   dataUrl += "#format=jsonl";
      // }
      // // console.log("dataUrl", dataUrl);
      // setDataUrl(dataUrl);
    })();
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {mode === "map" ? (
        <div
          style={{
            width: "900px",
            height: "600px",
          }}
        >
          <MapView layers={layers} theme={theme} mapStyle={theme}></MapView>
        </div>
      ) : (
        <VirtualView layers={layers} theme={theme}></VirtualView>
      )}
    </div>
  );
}

export default App;
