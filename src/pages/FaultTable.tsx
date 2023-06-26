import { useEffect, useState } from "react";
import "../App.css";
import axios from "axios";
// import { Link, useNavigate } from "react-router-dom";
import { useHistory } from "react-router-dom";
import Modal from "../components/Modal";
import { strapi_url } from "../config/constant";

function FaultTable() {
  const history = useHistory();

  const [data, setData] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleModalOpen(item: any) {
    if (item.attributes.status === "pending") {
      setSelectedItemId(item.id);
      setIsModalOpen(true);
    }
  }

  function handleModalClose() {
    setIsModalOpen(false);
    const complain = async () => {
      try {
        const response = await axios.get(`${strapi_url}/api/complaints`);
        setData(response.data.data);
      } catch (error) {
        setData([]);
      }
    };
    complain();
  }

  useEffect(() => {
    const complain = async () => {
      try {
        const response = await axios.get(`${strapi_url}/api/complaints`);
        setData(response.data.data);
      } catch (error) {
        setData([]);
      }
    };
    complain();
  }, []);

  return (
    <>
      <div className="select-group">
        <button>Kuleshwor Distribution Office</button>
        <button>Select Date</button>
        <button onClick={() => history.push("/complaint-map")}>
          View All on Map
        </button>
        <button>Clear</button>
      </div>
      <div className="mask">
        <div>
          <table>
            <thead>
              <tr style={{ backgroundColor: "#8a8a8a" }}>
                <th>Concern Office</th>
                <th>Message</th>
                <th>Fault Location</th>
                <th></th>
                <th>Vehicle in Use (1/10)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? "even" : "odd"}>
                  <td>{item.attributes.concern_office}</td>
                  <td>{item.attributes.message}</td>
                  <td>{item.attributes.fault_location}</td>
                  <td style={{ minWidth: "130px" }}>
                    <button
                      onClick={() =>
                        history.push("/single-complaint-osm", {
                          state: {
                            longitude: item.attributes.fault_longitude,
                            latitude: item.attributes.fault_latitude,
                            id: item.id,
                            sc_number: item.attributes.sc_number,
                            customer_id: item.attributes.customer_id,
                            name: item.attributes.name,
                            phone: item.attributes.phone,
                            email: item.attributes.email,
                            provisional_office:
                              item.attributes.provisional_office,
                            concern_office: item.attributes.concern_office,
                            subject: item.attributes.subject,
                            message: item.attributes.message,
                            fault_location: item.attributes.fault_location,
                            created_at: new Date(
                              item.attributes.createdAt
                            ).toLocaleString(),
                            remarks: item.attributes.remarks,
                            status: item.attributes.status,
                          },
                        })
                      }
                      className="btn btn-primary"
                    >
                      View on OSM
                    </button>
                  </td>
                  <td style={{ minWidth: "200px" }}>
                    {item.attributes.assigned_vehicle}
                  </td>
                  <td style={{ minWidth: "112px", textAlign: "center" }}>
                    <span
                      style={{ cursor: "pointer" }}
                      className={`pill ${
                        item.attributes.status === "resolved"
                          ? "pill-status-resolved"
                          : item.attributes.status === "in-progress"
                          ? "pill-status-inprogress"
                          : "pill-status-pending"
                      }`}
                      onClick={() => handleModalOpen(item)}
                    >
                      {item.attributes.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isModalOpen && (
            <Modal
              handleClose={handleModalClose}
              selectedItemId={selectedItemId}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default FaultTable;
