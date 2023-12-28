import "../App.css";
import DeckGL from "@deck.gl/react/typed";
import { MapView } from "@deck.gl/core/typed";
import { IconLayer, IconLayerProps } from "@deck.gl/layers/typed";
import { Map } from "react-map-gl";
import { useEffect, useMemo, useState } from "react";
import Circle from "../assets/icons.png";
import axios from "axios";
import { strapi_token, strapi_url } from "../config/constant";

const statusLabel: IStatusType[] = [
  { label: "Resolved", value: "resolved" },
  { label: "In Progress", value: "in-progress" },
  { label: "pending", value: "pending" },
];

export type IStatusType = {
  label: string;
  value: "resolved" | "in-progress" | "pending";
};
interface ComplainData {
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

// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: 85.2982953,
  latitude: 27.7058544,
  zoom: 12.5,
  pitch: 0,
  bearing: 0,
};

const ICON_MAPPING: IconLayerProps["iconMapping"] = {
  circle: { x: 0, y: 0, width: 128, height: 128, mask: true },
  marker: { x: 180, y: 0, width: 135, height: 150, mask: true },
  vehicle: { x: 0, y: 150, width: 180, height: 108, mask: true },
};

function ComplaintMapbox() {
  const [data, setData] = useState<any[]>([]);

  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedComplain, setselectedComplain] = useState<ComplainData | null>(
    null
  );

  const paths = data.map((x: any) => ({
    coordinates: [x.attributes.fault_longitude, x.attributes.fault_latitude],
    sc_number: x.attributes.sc_number,
    customer_id: x.attributes.customer_id,
    name: x.attributes.name,
    phone: x.attributes.phone,
    email: x.attributes.email,
    provisional_office: x.attributes.provisional_office,
    concern_office: x.attributes.concern_office,
    subject: x.attributes.subject,
    message: x.attributes.message,
    fault_location: x.attributes.fault_location,
    created_at: new Date(x.attributes.createdAt).toLocaleString(),
    remarks: x.attributes.remarks,
    status: x.attributes.status,
  }));

  useEffect(() => {
    const complain = async () => {
      try {
        const response = await axios.get(`${strapi_url}/api/complaints`, {
          headers: { Authorization: `Bearer ${strapi_token}` },
        });
        setData(response.data.data);
      } catch (error) {
        setData([]);
      }
    };

    complain();
  }, []);

  const layers = useMemo(
    () => [
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
        <MapView id="map" controller={true}>
          <Map
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken="pk.eyJ1IjoibWFkYW5zdGhhMSIsImEiOiJjbGllMzhlMGUwbmtmM2VvYnNtd3FlNG45In0.BEn9FtgMvKePBKbaroClYA"
          />
        </MapView>
      </DeckGL>
    </div>
  );
}

export default ComplaintMapbox;
