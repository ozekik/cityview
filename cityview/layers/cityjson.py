from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Literal

from .base import BaseLayer


@dataclass
class CityJSONLayer(BaseLayer):
    format: Literal["cityjson", "cityjsonseq"]

    type = "CityJSONLayer"

    def __init__(
        self,
        id: str | None = None,
        *,
        data: str | None = None,
        format: Literal["cityjson", "cityjsonseq"] = "cityjson",
        get_fill_color: str | None = None,
    ):
        self.id = id
        self.data = data
        self.format = format
        self.get_fill_color = get_fill_color

    def serialize(self):
        return {
            "id": self.id,
            "format": self.format,
            "data": self.data,
            "getFillColor": self.get_fill_color,
        }
