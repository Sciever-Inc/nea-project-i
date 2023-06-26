import { Layer } from "@deck.gl/core/typed";
import { useLocation } from "react-router-dom";
import DeckGL, { DeckGLRef } from "@deck.gl/react/typed";
import {
  BitmapBoundingBox,
  BitmapLayer,
  IconLayer,
} from "@deck.gl/layers/typed";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import InfoPanel from "../components/InfoPanel";
import axios from "axios";
import { IconMapping } from "@deck.gl/layers/typed/icon-layer/icon-manager";
import SearchPanel from "../components/SearchPanel";
import Circle from "../assets/circle.png";
import useDebouncedCallback from "../hooks/useDebouncedCallback";
import { TileLayer } from "@deck.gl/geo-layers/typed";

// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: 85.2982953,
  latitude: 27.7058544,
  zoom: 14,
  pitch: 0,
  bearing: 0,
};

const ICON_MAPPING: IconMapping = {
  marker: { x: 180, y: 0, width: 135, height: 150, mask: true },
};

const initialData = [85.2982953, 27.7058544];

const MapMarker = () => {
  const ref = useRef<DeckGLRef>(null);

  const { search } = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const callbackUrl = searchParams.get("callback_url");
  const refId = searchParams.get("ref_id");

  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  const [coordinates, setCoordinates] = useState(initialData);
  const [controller, setController] = useState(true);
  const [layers, setLayers] = useState<Layer[]>([]);

  const [places, setPlaces] = useState<string>("");

  const handleSearch = useDebouncedCallback(
    async () => {
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse.php?lat=${coordinates[1]}&lon=${coordinates[0]}`,
          {
            params: {
              format: "jsonv2",
            },
          }
        );
        setPlaces(response.data.display_name);
      } catch (error) {
        // Handle error
        setPlaces("Error...");
      }
    },
    1000,
    [coordinates]
  );

  const tileLayer = new TileLayer({
    // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
    data: "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
    minZoom: 0,
    maxZoom: 19,
    tileSize: 256,
    renderSubLayers: (props) => {
      const { boundingBox } = props.tile;

      return new BitmapLayer(props, {
        data: undefined,
        image: props.data,
        bounds: boundingBox.flatMap((x) => x) as BitmapBoundingBox,
      });
    },
  });

  const iconLayer = useMemo(
    () =>
      new IconLayer({
        id: "select-position",
        data: [
          {
            name: "",
            address: `${coordinates[0]},${coordinates[1]}`,
            coordinates,
          },
        ],
        pickable: true,

        iconAtlas: Circle,
        iconMapping: ICON_MAPPING,
        getIcon: (d) => "marker",

        sizeScale: 15,
        getPosition: (d) => d.coordinates,
        getSize: (d) => 3,
        getColor: (d) => [255, 0, 0, 255],
      }),
    [coordinates]
  );

  useEffect(() => {
    setPlaces("Loading...");
    handleSearch();
  }, [coordinates, handleSearch]);

  const onSearchClick = (coordinates: number[]) => {
    setCoordinates(coordinates);
    setViewState({
      ...INITIAL_VIEW_STATE,
      latitude: coordinates[1],
      longitude: coordinates[0],
    });
  };

  useEffect(() => {
    setLayers([tileLayer, iconLayer]);
  }, [setLayers, iconLayer]);

  useEffect(() => {
    window.postMessage("Meow");
  }, [controller]);

  const handleSave = async () => {
    console.log({ callbackUrl });
    if (!callbackUrl) {
      return;
    }

    try {
      await axios.post(callbackUrl, { coordinates, places });
    } catch {}

    window.postMessage({ type: "save-event", coordinates, refId, places });
  };

  return (
    <>
      <div>MapMarker Callback to: {callbackUrl}</div>

      <DeckGL
        ref={ref}
        initialViewState={viewState}
        controller={controller}
        layers={layers}
        getTooltip={({ object }) =>
          object && `${object.name}\n${object.address}`
        }
        onClick={({ coordinate }) => {
          setCoordinates(coordinate ?? initialData);
        }}
      >
      </DeckGL>

      <SearchPanel coordinates={coordinates} clickAction={onSearchClick} />
      <InfoPanel
        coordinates={coordinates}
        name={places}
        okAction={handleSave}
      />
    </>
  );
};

export default MapMarker;
