import "../App.css";
import DeckGL from "@deck.gl/react/typed";
import { Color, MapView } from "@deck.gl/core/typed";
import { BitmapBoundingBox, BitmapLayer, IconLayer, IconLayerProps, PathLayer } from "@deck.gl/layers/typed";
import { useMemo, useState } from "react";
import Circle from "../assets/icons.png";
import { useLocation } from "react-router-dom";
import { PathStyleExtension } from "@deck.gl/extensions/typed";
import * as d3 from "d3";
import { formatDuration } from "./TripTbable";
import { TileLayer } from "@deck.gl/geo-layers/typed";


export function getColor(idx: number) {
  const nColors = d3.schemePaired.length;
  const selColor = d3.schemePaired[idx % nColors];
  const selRGB = d3.rgb(selColor);

  return [selRGB.r, selRGB.g, selRGB.b] as Color;
}

interface TripData {
  device_id: number;
  device_name: string;
  start_address: string;
  end_address: string;
  start_time: Date;
  end_time: Date;
  duration: number;
  distance: number;
}

interface PopupProps {
  trip: TripData;
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ trip, onClose }) => {
  return (
    <div className="popup">
      <button onClick={onClose} className="cross">
        &times;
      </button>
      <ul
        style={{
          listStyle: "none",
          margin: "20px",
          padding: 0,
        }}
      >
        <li className="list">
          <label className="label2">
            <strong>Device ID:</strong>
          </label>{" "}
          {trip.device_id}
        </li>
        <li className="list list-dark">
          <label className="label2">
            <strong>Device Name:</strong>
          </label>{" "}
          {trip.device_name}
        </li>
        <li className="list">
          <label className="label2">
            <strong>Start Address:</strong>
          </label>{" "}
          {trip.start_address}
        </li>
        <li className="list list-dark">
          <label className="label2">
            <strong>End Address:</strong>
          </label>{" "}
          {trip.end_address}
        </li>
        <li className="list">
          <label className="label2">
            <strong>Start Time:</strong>
          </label>{" "}
          {new Date(trip.start_time).toLocaleString()}
        </li>
        <li className="list list-dark">
          <label className="label2">
            <strong>End Time:</strong>
          </label>{" "}
          {new Date(trip.end_time).toLocaleString()}
        </li>
        <li className="list">
          <label className="label2">
            <strong>Duration:</strong>
          </label>{" "}
          {formatDuration(trip.duration)}
        </li>
        <li className="list list-dark">
          <label className="label2">
            <strong>Distance:</strong>
          </label>{" "}
          {(trip.distance / 1000).toFixed(2)} km
        </li>
      </ul>
    </div>
  );
};

const ICON_MAPPING: IconLayerProps["iconMapping"] = {
  circle: { x: 0, y: 0, width: 128, height: 128, mask: true },
  marker: { x: 180, y: 0, width: 135, height: 150, mask: true },
  vehicle: { x: 0, y: 150, width: 180, height: 108, mask: true },
};
// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: 85.2982953,
  latitude: 27.7058544,
  zoom: 13,
  pitch: 0,
  bearing: 0,
};

function SingleTrip() {
  const location = useLocation();
  const data = location.state.state;

  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedTrip, setselectedTrip] = useState<TripData | null>(null);

  console.log(data);
  const processedData = [
    {
      coordinates: JSON.parse(data.trip.road_snap),
      id: data.trip.id,
      device_id: data.trip.device_id,
      device_name: data.trip.device_name,
      start_address: data.trip.start_address,
      end_address: data.trip.end_address,
      start_time: data.trip.start_time,
      end_time: data.trip.end_time,
      duration: data.trip.duration,
      distance: data.trip.distance,
    },
  ];
  console.log("trips", processedData);

  const layers = useMemo(
    () => [
      new TileLayer({
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
      }),
      new PathLayer({
        id: "path-layer",
        data: processedData,
        widthMinPixels: 3,
        pickable: true,
        highlightColor: [128, 128, 128, 256],
        autoHighlight: true,
        capRounded: true,
        jointRounded: true,
        billboard: true,
        getWidth: 0,
        getPath: (d) => {
          return d.coordinates;
        },
        getColor: (d) => {
          const col = getColor(d.id);

          return col;
        },
        onClick: (info: any) => {
          const clickedObject = info.object;
          if (clickedObject) {
            if (selectedTrip === clickedObject && popupVisible) {
              setselectedTrip(null);
              setPopupVisible(false);
            } else {
              setselectedTrip(clickedObject);
              setPopupVisible(true);
            }
          } else {
            setselectedTrip(null);
            setPopupVisible(false);
          }
        },
        // getColor: [0, 255, 0, 255],
        getDashArray: [4, 4],
        dashJustified: true,
        parameters: {
          depthMask: false,
        },
        extensions: [
          new PathStyleExtension({
            dash: true,
          }),
        ],
      }),
      new IconLayer({
        id: "icon-layer-1",
        data: processedData,
        pickable: true,
        iconAtlas: Circle,
        iconMapping: ICON_MAPPING,
        sizeScale: 5,
        getIcon: () => "marker",
        getPosition: (d) => d.coordinates[d.coordinates.length - 1],
        getSize: 6,
        getColor: [13, 188, 23, 255],
      }),
      new IconLayer({
        id: "icon-layer-2",
        data: processedData,
        pickable: true,
        iconAtlas: Circle,
        iconMapping: ICON_MAPPING,
        sizeScale: 4,
        getIcon: () => "circle",
        getPosition: (d) => d.coordinates[0],
        getSize: 4,
        getColor: [245, 39, 58, 255],
      }),
    ],
    [processedData]
  );

  return (
    <div className="App">
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
      >
        {popupVisible && selectedTrip && (
          <div id="popup">
            <Popup
              trip={selectedTrip}
              onClose={() => {
                setselectedTrip(null);
                setPopupVisible(false);
              }}
            />
          </div>
        )}
      </DeckGL>
    </div>
  );
}

export default SingleTrip;
