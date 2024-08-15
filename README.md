# CityView

CityJSON loader and renderer for three.js, react-three-fiber, and Jupyter Notebook / JupyterLab.

## Contents

- [Packages](#packages)
- [Installation](#installation)
- [Usage](#usage)
- [Roadmap](#roadmap)
- [License](#license)

## Packages

|  Package Name  | Description |
|----------------|-------------|
| [cityview](https://github.com/ozekik/cityview) (top-level package) | Python package |
| [three-cityjson](https://github.com/ozekik/cityview/tree/master/packages/three-cityjson) | JavaScript / TypeScript package |

## Installation

```bash
pip install cityview
```

## Usage

### Basic usage

```python
import cityview as cv

view = cv.MapView(theme="light")

with open("./packages/three-cityjson/public/sample/daiba_sta.city.jsonl", "r") as f:
    data = f.read()

view.update(data)

view
```

### Handling click events

```python
import cityview as cv

view = cv.MapView(theme="light")

with open("./packages/three-cityjson/public/sample/daiba_sta.city.jsonl", "r") as f:
    data = f.read()

def handler(change):
    print(change["new"])

view.observe(handler, names="click")

view.update(data)

view
```


## Roadmap

TBA

## License

MIT
