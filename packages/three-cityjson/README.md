# three-cityjson

> CityJSON loader for three.js and react-three-fiber

## Installation

```bash
npm install three-cityjson
```

## Usage

### Basic

```javascript
import { CityJSONLoader } from "three-cityjson";

const loader = new CityJSONLoader();
loader.load("path/to/yourfile.city.json", (cityjson) => {
  // Do something with the CityJSON object
});
```

### React-three-fiber

```javascript
import { CityJSONLoader } from "three-cityjson";
import { useLoader } from "@react-three/fiber";

const cityjson = useLoader(CityJSONLoader, "path/to/yourfile.city.json");
```

## License

MIT
