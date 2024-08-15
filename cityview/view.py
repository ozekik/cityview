from __future__ import annotations

from logging import getLogger
from pathlib import Path
from typing import Literal

import anywidget
import traitlets

logger = getLogger(__name__)


class BaseView(anywidget.AnyWidget):
    _esm = Path(__file__).parent / "static/widget.js"
    _css = Path(__file__).parent / "static/widget.css"

    mode = traitlets.Unicode().tag(sync=True)

    theme = traitlets.Unicode("light").tag(sync=True)

    width = traitlets.Union([traitlets.Unicode(), traitlets.Int()]).tag(sync=True)
    height = traitlets.Union([traitlets.Unicode(), traitlets.Int()]).tag(sync=True)

    data = traitlets.Unicode().tag(sync=True)
    click = traitlets.Dict(allow_none=True).tag(sync=True)

    layers = traitlets.List()
    _layers = traitlets.List().tag(sync=True)


class MapView(BaseView):
    map_style = traitlets.Unicode().tag(sync=True)
    map_provider = traitlets.Unicode("carto").tag(sync=True)

    def __init__(
        self,
        *,
        # layers: List[Layer] = [],
        # initial_view_state: ViewState = ViewState(latitude=0, longitude=0, zoom=1),
        width: int | str = "100%",
        height: int | str = 500,
        theme: Literal["light", "dark"] = "dark",
        map_style=None,
        map_provider="carto",
        api_keys=None,
    ):
        # self.inital_view_state = initial_view_state
        # self.layers = layers
        self.mode = "map"

        self.theme = theme

        self.map_style = map_style or theme
        self.map_provider = map_provider

        self.width = width
        self.height = height

        # self._tooltip = tooltip

        # if map_style in DefaultBaseMap.short_names:
        #     map_style = DefaultBaseMap.short_names[map_style]
        # self.map_style = map_style

        # self._initial_view_state = asdict(initial_view_state)
        # self._layers = list(map(lambda x: x.serialize(), layers))

        super().__init__()

    def update(self):
        self._layers = list(map(lambda x: x.serialize(), self.layers))


class VirtualView(BaseView):
    def __init__(
        self,
        *,
        # layers: List[Layer] = [],
        # initial_view_state: ViewState = ViewState(latitude=0, longitude=0, zoom=1),
        theme: Literal["light", "dark"] = "light",
        width: int | str = "100%",
        height: int | str = 500,
    ):
        # self.inital_view_state = initial_view_state
        # self.layers = layers
        self.mode = "virtual"

        self.theme = theme

        self.width = width
        self.height = height
        # self._tooltip = tooltip

        # self._initial_view_state = asdict(initial_view_state)
        # self._layers = list(map(lambda x: x.serialize(), layers))

        super().__init__()

    def update(self):
        self._layers = list(map(lambda x: x.serialize(), self.layers))

    # def update(self, data: str):
    #     self.data = data
