import { TileLayer } from "@deck.gl/geo-layers/typed";
import {
  BitmapBoundingBox,
  BitmapLayer,
  IconLayer,
  IconLayerProps,
} from "@deck.gl/layers/typed";
import DeckGL from "@deck.gl/react/typed";
import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import "../App.css";
import Circle from "../assets/circle.png";

export type IStatusType = {
  label: string;
  value: "resolved" | "in-progress" | "pending";
};
interface ComplainData {
  id: number;
  sc_number: string;
  customer_id: string;
  name: string;
  phone: string;
  email: string;
  provisional_office: string;
  concern_office: string;
  subject: string;
  message: string;
  fault_location: string;
  fault_latitude: number;
  fault_longitude: number;
  remarks: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
}

interface PopupProps {
  complain: ComplainData;
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ complain, onClose }) => {
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
            <strong>Complaint Date:</strong>
          </label>{" "}
          {complain.created_at}
        </li>
        <li className="list list-dark">
          <label className="label2">
            <strong>Name:</strong>
          </label>{" "}
          {complain.name}
        </li>
        <li className="list">
          <label className="label2">
            <strong>Customer ID:</strong>
          </label>{" "}
          {complain.customer_id}
        </li>
        <li className="list list-dark">
          <label className="label2">
            <strong>Email:</strong>
          </label>{" "}
          {complain.email}
        </li>
        <li className="list">
          <label className="label2">
            <strong>Province Office:</strong>
          </label>{" "}
          {complain.provisional_office}
        </li>
        <li className="list list-dark">
          <label className="label2">
            <strong>Concern Office:</strong>
          </label>{" "}
          {complain.concern_office}
        </li>
        <li className="list">
          <label className="label2">
            <strong>Phone:</strong>
          </label>{" "}
          {complain.phone}
        </li>
        <li className="list list-dark">
          <label className="label2">
            <strong>Subject:</strong>
          </label>{" "}
          {complain.subject}
        </li>
        <li className="list">
          <label className="label2">
            <strong>Message:</strong>
          </label>{" "}
          {complain.message}
        </li>
        <li className="list list-dark">
          <label className="label2">
            <strong>Fault Location:</strong>
          </label>{" "}
          {complain.fault_location}
        </li>
        <li className="list">
          <label className="label2">
            <strong>Remarks:</strong>
          </label>{" "}
          {complain.remarks}
        </li>
        <li className="list list-dark">
          <label className="label2">
            <strong>Status:</strong>
          </label>{" "}
          {complain.status}
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

function MapOsm() {
  const location = useLocation();

  /* @ts-ignore */
  const complain_coords = location.state.state;

  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedComplain, setselectedComplain] = useState<ComplainData | null>(
    null
  );

  // Viewport settings
  const INITIAL_VIEW_STATE = {
    longitude: complain_coords.longitude,
    latitude: complain_coords.latitude,
    zoom: 16,
    pitch: 0,
    bearing: 0,
  };

  const paths = [
    {
      coordinates: [complain_coords.longitude, complain_coords.latitude],
      sc_number: complain_coords.sc_number,
      customer_id: complain_coords.customer_id,
      name: complain_coords.name,
      phone: complain_coords.phone,
      email: complain_coords.email,
      provisional_office: complain_coords.provisional_office,
      concern_office: complain_coords.concern_office,
      subject: complain_coords.subject,
      message: complain_coords.message,
      fault_location: complain_coords.fault_location,
      created_at: new Date(complain_coords.createdAt).toLocaleString(),
      remarks: complain_coords.remarks,
      status: complain_coords.status,
    },
  ];

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
      new IconLayer({
        id: "complain",
        data: paths,
        pickable: true,
        iconAtlas: Circle,
        iconMapping: ICON_MAPPING,
        sizeScale: 6,
        getIcon: (d) => "marker",
        getPosition: (d) => d.coordinates,
        getSize: (d) => 6,
        onClick: (info: any) => {
          const clickedObject = info.object;
          if (clickedObject) {
            if (selectedComplain === clickedObject && popupVisible) {
              setselectedComplain(null);
              setPopupVisible(false);
            } else {
              setselectedComplain(clickedObject);
              setPopupVisible(true);
            }
          } else {
            setselectedComplain(null);
            setPopupVisible(false);
          }
        },
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
    ],
    [paths]
  );

  return (
    <div className="App">
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
      >
        {popupVisible && selectedComplain && (
          <div id="popup">
            <Popup
              complain={selectedComplain}
              onClose={() => {
                setselectedComplain(null);
                setPopupVisible(false);
              }}
            />
          </div>
        )}
        {/* @ts-ignore */}
        {/* <MapView id="map" controller={true}>
          <Map
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken="pk.eyJ1IjoiYXNuamVldiIsImEiOiJjbGRzbzRvYW0wcHF4M3JrZzFtamltdjVrIn0._iQNVWaEyUbp6GAzLd1RRA"
          />
        </MapView> */}
      </DeckGL>
    </div>
  );
}

export default MapOsm;
