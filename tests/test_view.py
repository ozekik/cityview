from cityview.view import MapView, VirtualView


class DummyLayer:
    def __init__(self, payload):
        self.payload = payload

    def serialize(self):
        return self.payload


def test_map_view_configures_defaults_and_mode():
    view = MapView()

    assert view.mode == "map"
    assert view.theme == "dark"
    # map_style falls back to the selected theme when not provided
    assert view.map_style == "dark"
    assert view.map_provider == "carto"


def test_map_view_update_synchronizes_layers():
    view = MapView()
    layer_payload = {"id": "layer-1"}
    view.layers = [DummyLayer(layer_payload)]

    view.update()

    assert view._layers == [layer_payload]


def test_virtual_view_update_synchronizes_layers_and_defaults():
    view = VirtualView()
    layer_payload = {"id": "virtual-layer"}
    view.layers = [DummyLayer(layer_payload)]

    view.update()

    assert view.mode == "virtual"
    assert view.theme == "light"
    assert view._layers == [layer_payload]
