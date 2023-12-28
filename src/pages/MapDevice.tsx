import "../App.css";
import DeckGL from "@deck.gl/react/typed";
import { Color } from "@deck.gl/core/typed";
import {
  BitmapBoundingBox,
  BitmapLayer,
  IconLayer,
  IconLayerProps,
  PathLayer,
} from "@deck.gl/layers/typed";
import { useEffect, useMemo, useState } from "react";
import { PathStyleExtension } from "@deck.gl/extensions/typed";
import axios from "axios";
import * as d3 from "d3";
import { backend_url, strapi_url, strapi_token } from "../config/constant";
import Circle from "../assets/icons.png";
import { TileLayer } from "@deck.gl/geo-layers/typed";

const ICON_MAPPING: IconLayerProps["iconMapping"] = {
  circle: { x: 0, y: 0, width: 128, height: 128, mask: true },
  marker: { x: 180, y: 0, width: 135, height: 150, mask: true },
  vehicle: { x: 0, y: 150, width: 180, height: 108, mask: true },
  top_car: { x: 180, y: 150, width: 180, height: 160, mask: true },
};

function getColor(idx: number) {
  const nColors = d3.schemePaired.length;
  const selColor = d3.schemePaired[idx % nColors];
  const selRGB = d3.rgb(selColor);

  return [selRGB.r, selRGB.g, selRGB.b] as Color;
}

const MapDevice = () => {
  const INITIAL_VIEW_STATE = {
    longitude: 85.2982953,
    latitude: 27.7058544,
    zoom: 12.5,
    pitch: 0,
    bearing: 0,
  };

  const [data, setData] = useState<any[]>([]);
  const [complain, setComplain] = useState<any[]>([]);

  const paths = complain.map((x: any) => ({
    coordinates: [x.attributes.fault_longitude, x.attributes.fault_latitude],
    status: x.attributes.status,
  }));

  useEffect(() => {
    const complain = async () => {
      try {
        const response = await axios.get(`${strapi_url}/api/complaints`, {
          headers: { Authorization: `Bearer ${strapi_token}` },
        });
        setComplain(response.data.data);
      } catch (error) {
        setComplain([]);
      }
    };

    complain();
  }, []);

  const processedData = data.map((item, idx) => ({
    path: item.coordinates
      .split(";")
      .map((coord: any) => coord.split(",").map(parseFloat)),
    idx,
    device_id: item.device_id,
    adjusted_path: JSON.parse(item.coordinates),
    heading: JSON.parse(item.heading),
  }));

  useEffect(() => {
    const refresh = () => {
      axios
        .get(`${backend_url}/data`)
        .then((response) => {
          try {
            const json = response.data;
            setData(json);
          } catch (e) {
            setData([]);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    };
    const interval = setInterval(refresh, 10000);

    // also call immediately
    refresh();

    return () => clearInterval(interval);
  }, []);

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
      //   new PathLayer({
      //     id: "path-layer",
      //     data: processedData,
      //     widthMinPixels: 5,
      //     pickable: true,
      //     highlightColor: [128, 128, 128, 256],
      //     autoHighlight: true,
      //     capRounded: true,
      //     jointRounded: true,
      //     billboard: true,
      //     getWidth: 0,
      //     getPath: (d) => d.adjusted_path,
      //     getColor: (d) => {
      //       const col = getColor(d.idx);

      //       return col;
      //     },
      //     getDashArray: [4, 4],
      //     dashJustified: true,
      //     parameters: {
      //       depthMask: false,
      //     },
      //     extensions: [
      //       new PathStyleExtension({
      //         dash: true,
      //       }),
      //     ],
      //   }),
      new IconLayer({
        id: "complain",
        data: paths,
        // pickable: true,
        iconAtlas: Circle,
        iconMapping: ICON_MAPPING,
        sizeScale: 6,
        getIcon: (d) => "marker",
        getPosition: (d) => d.coordinates,
        getSize: (d) => 6,

        getColor: (d: any) => {
          switch (d.status) {
            case "resolved":
              return [0, 255, 0, 255]; // green
            case "pending":
              return [255, 0, 0, 255]; // red
            case "in-progress":
              return [255, 164, 0, 255]; // yellow
            default:
              return [0, 0, 255, 255]; // blue
          }
        },
      }),
      //   new IconLayer({
      //     id: "icon-layer-1",
      //     data: processedData,
      //     pickable: true,
      //     iconAtlas: Circle,
      //     iconMapping: ICON_MAPPING,
      //     sizeScale: 4,
      //     getIcon: () => "circle",
      //     getPosition: (d) => d.adjusted_path[d.adjusted_path.length - 1],
      //     getSize: 6,
      //     getColor: [0, 128, 0, 255],
      //   }),
      new IconLayer({
        id: "icon-layer-2",
        data: processedData,
        pickable: true,
        iconAtlas: Circle,
        iconMapping: ICON_MAPPING,
        sizeScale: 6,
        getIcon: () => "top_car",
        getPosition: (d) => d.adjusted_path[0],
        getAngle: (d) => d.heading[0],
        getSize: 6,
        getColor: [20, 52, 164, 255],
      }),
    ],
    [processedData, paths]
  );

  return (
    <div className="App">
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        getTooltip={({ object }) => object && `Device ID: ${object.device_id}`}
      ></DeckGL>
    </div>
  );
};

export default MapDevice;
