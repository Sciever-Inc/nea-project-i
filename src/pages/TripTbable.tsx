import { useEffect, useState } from "react";
import "../App.css";
import axios from "axios";
// import { useNavigate } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { backend_url } from "../config/constant";

export function formatDuration(duration: number) {
  const minutes = Math.floor(duration / 60000); // Convert milliseconds to minutes
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours} hour(s) ${remainingMinutes} minute(s)`;
  } else {
    return `${remainingMinutes} minute(s)`;
  }
}

function TripTable() {
  const currentDate = new Date();
  const currentDateTimeString = currentDate.toISOString().slice(0, 16);

  const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneWeekAgoDateTimeString = oneWeekAgo.toISOString().slice(0, 16);

  const [data, setData] = useState<any[]>([]);
  const [fromDateTime, setFromDateTime] = useState<string>(
    () => localStorage.getItem("fromDateTime") || oneWeekAgoDateTimeString
  );
  const [toDateTime, setToDateTime] = useState<string>(
    () => localStorage.getItem("toDateTime") || currentDateTimeString
  );
  const [deviceId, setDeviceId] = useState<string>(
    () => localStorage.getItem("deviceId") || ""
  );

  const history = useHistory();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      let url = `${backend_url}/trips`;

      if (fromDateTime && toDateTime) {
        url += `?from=${encodeURIComponent(
          fromDateTime
        )}&to=${encodeURIComponent(toDateTime)}`;

        if (deviceId) {
          url += `&device_id=${encodeURIComponent(deviceId)}`;
        }
      } else if (deviceId) {
        url += `?device_id=${encodeURIComponent(deviceId)}`;
      }

      localStorage.setItem("fromDateTime", fromDateTime);
      localStorage.setItem("toDateTime", toDateTime);
      localStorage.setItem("deviceId", deviceId);
      const response = await axios.get(url);
      setData(response.data);
      console.log(response.data);
    } catch (error) {
      setData([]);
    }
  };

  const handleFilter = () => {
    fetchData();
  };

  return (
    <>
      <h2 className="text-center">Trip Table</h2>
      <div className="select-group">
        <span>From :</span>
        <input
          type="datetime-local"
          value={fromDateTime}
          onChange={(e) => setFromDateTime(e.target.value)}
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "16px",
          }}
        />
        <span>To :</span>
        <input
          type="datetime-local"
          value={toDateTime}
          onChange={(e) => setToDateTime(e.target.value)}
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "16px",
          }}
        />
        <input
          type="text"
          onChange={(e) => setDeviceId(e.target.value)}
          placeholder="Device ID"
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "16px",
          }}
        />
        <button onClick={handleFilter} className="btn btn-primary">
          Filter
        </button>
        {/* <button onClick={() => navigate("/trips")}>View All on Map</button> */}
        <button onClick={() => history.push("/trips")}>View All on Map</button>
      </div>

      <div className="mask">
        <div className="table-container">
          <table>
            <thead>
              <tr style={{ backgroundColor: "#8a8a8a" }}>
                <th>Device ID</th>
                <th>Device Name</th>
                <th>Start Address</th>
                <th>End Address</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Duration</th>
                <th>Distance</th>
                <th>Max Speed</th>
                <th>Avg Speed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? "even" : "odd"}>
                  <td>{item.device_id}</td>
                  <td>{item.device_name}</td>
                  <td>{item.start_address}</td>
                  <td>{item.end_address}</td>
                  <td>{new Date(item.start_time).toLocaleString()}</td>
                  <td>{new Date(item.end_time).toLocaleString()}</td>
                  <td>{formatDuration(item.duration)}</td>
                  <td>{(item.distance / 1000).toFixed(2)} km</td>
                  <td>{item.max_speed.toFixed(2)} km/h</td>
                  <td>{item.average_speed.toFixed(2)} km/h</td>
                  {/* <td style={{ minWidth: "126px" }}>
                    <button
                      onClick={() =>
                        // navigate("/single-trip", {
                        history.push("/trip-map", {
                          state: {
                            trip: item,
                          },
                        })
                      }
                    >
                      View on Map
                    </button>
                  </td> */}

                  <td style={{ minWidth: "126px" }}>
                    {item.road_snap !== null && item.road_snap !== undefined ? (
                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          history.push("/trip-map", {
                            state: { trip: item },
                          })
                        }
                      >
                        View on Map
                      </button>
                    ) : (
                      <span>Unavailable</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default TripTable;
