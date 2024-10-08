# three-cityjson

[![npm](https://img.shields.io/npm/v/three-cityjson)](https://www.npmjs.com/package/three-cityjson)

CityJSON loader and viewer for [Three.js](https://threejs.org/) and [React-three-fiber](https://github.com/pmndrs/react-three-fiber)

## Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Loader](#loader)
  - [Viewer](#viewer)
- [License](#license)

## Installation

```bash
npm install three-cityjson
```

## Usage

### Loader

#### Three.js

```javascript
import { CityJSONLoader } from "three-cityjson";

const loader = new CityJSONLoader();
loader.load("path/to/yourfile.city.json", (cityjson) => {
  // Do something with the CityJSON object
});
```

#### React-three-fiber

```javascript
import { CityJSONLoader } from "three-cityjson";
import { useLoader } from "@react-three/fiber";

export default function Component() {
  const {
    geometries,
    vertexCount,
    indexCount,
    origin: modelOrigin,
  } = useLoader(CityJSONLoader, "path/to/yourfile.city.json");

  return <></>;
}
```

### Viewer

WIP

## License

MIT
