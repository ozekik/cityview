import json

from cityview.layers.cityjson import CityJSONLayer


def test_cityjson_layer_serialize_preserves_core_fields():
    payload = json.dumps({"CityObjects": {}})
    layer = CityJSONLayer(
        id="demo-layer",
        data=payload,
        get_fill_color="item => item.color",
    )

    serialized = layer.serialize()

    assert serialized == {
        "id": "demo-layer",
        "format": "cityjson",
        "data": payload,
        "getFillColor": "item => item.color",
    }


def test_cityjson_layer_can_overwrite_format():
    layer = CityJSONLayer(id=None, data=None, format="cityjsonseq")

    assert layer.serialize()["format"] == "cityjsonseq"
