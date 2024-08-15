from __future__ import annotations

from dataclasses import dataclass


def to_camel(s: str):
    parts = iter(s.split("_"))
    return next(parts) + "".join(i.title() for i in parts)


@dataclass
class BaseLayer:
    type: str
    # data: Any | None = None
    # id: str | None = None

    # def __init__(
    #     self,
    #     data: Any | None = None,
    #     id: str | None = None,
    #     **kwargs,
    # ):
    #     self.id = id
    #     self.data = data
    #     self._kwargs = kwargs
