import { useEffect, useState } from "react";
import "../App.css";
import axios from "axios";
import { strapi_token, strapi_url } from "../config/constant";

interface ModalProps {
  handleClose: () => void;
  selectedItemId: any;
}

function Modal(props: ModalProps) {
  const [data, setData] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://sgs.scieverinc.com/api/v1/data"
        );
        setData(response.data);
      } catch (error) {
        setData([]);
      }
    };

    fetchData();
  }, []);

  const handleVehicleAssign = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    const vehicleSelect = document.getElementById(
      "vehicles"
    ) as HTMLSelectElement;
    const selectedVehicle = vehicleSelect.value;
    const response = await axios.put(
      `${strapi_url}/api/complaints/${props.selectedItemId}`,
      {
        data: {
          assigned_vehicle: selectedVehicle,
          status: "in-progress",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${strapi_token}`,
        },
      }
    );
    if (response.status === 200) {
      props.handleClose();
    }
  };

  return (
    <>
      <div className="modal-background">
        <div className="modal-content">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <h3 style={{ marginTop: 0 }}>Confirmation</h3>
              <button className="modal-close" onClick={props.handleClose}>
                &times;
              </button>
            </div>
            <div style={{ textAlign: "center" }}>
              Please select the vehicle to change the status to "In Progress"{" "}
              <br />
              <br />
              Vehicle:
              <select
                className="select"
                style={{ marginLeft: "20px" }}
                name="vehicles"
                id="vehicles"
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                required
              >
                <option style={{ display: "none" }} value="" disabled selected>
                  Select Vehicle
                </option>
                {data.map((item, index) => (
                  <option key={index}>{item.device_id}</option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button
                className="modal-button modal-button-no"
                onClick={props.handleClose}
              >
                No
              </button>
              <button
                className="modal-button modal-button-yes"
                onClick={handleVehicleAssign}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default Modal;
