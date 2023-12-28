import { Link } from "react-router-dom";

const Nea = () => {
  const searchParams = new URLSearchParams();
  searchParams.set("callback_url", "https://google.com");

  return (
    <div>
      <div className="row col-md-8">
        <div style={{ marginRight: "5%" }}>
          <h3>Customer Location</h3>
          <ul>
            <li>
              <Link to="/complaint">Complaint Form</Link>
            </li>
            <li>
              <Link
                to={{
                  pathname: "/map-marker",
                  search: searchParams.toString(),
                }}
              >
                Map Marker
              </Link>
            </li>
            <li>
              <Link to="/fault-table">Fault Table</Link>
            </li>
            <li>
              <Link to="/complaint-map">Complaint on OSM</Link>
            </li>{" "}
            <li>
              <Link to="/complaint-mapbox">Complaint on Mapbox</Link>
            </li>
          </ul>
        </div>

        {/* <div>
          <h3>GPS Tracker</h3>
          <ul>
            <li>
              <Link to="/map-device">Map Device</Link>
            </li>
            <li>
              <Link to="/trip">Trip Table</Link>
            </li>
            <li>
              <Link to="/stop">Stop Table</Link>
            </li>
          </ul>
        </div> */}
      </div>
    </div>
  );
};

export default Nea;
