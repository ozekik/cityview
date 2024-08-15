import importlib.metadata

from .layers.cityjson import CityJSONLayer
from .view import MapView, VirtualView

try:
    __version__ = importlib.metadata.version("cityview")
except importlib.metadata.PackageNotFoundError:
    __version__ = "unknown"

__all__ = ["MapView", "VirtualView", "CityJSONLayer"]
