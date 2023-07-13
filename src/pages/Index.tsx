import React from "react";
import { Link } from "react-router-dom";

const Index = () => {
  const searchParams = new URLSearchParams();
  searchParams.set("callback_url", "https://google.com");

  return (
    <div>
      <h2>This is a demo website for GPS Features</h2>

      <ul>
        <li>
          <Link to="/map-device">Map Device</Link>
        </li>
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
          <Link to="/complaint-map">Complaint Map OSM</Link>
        </li>
        <li>
          <Link to="/trip">Trip Table</Link>
        </li>
        <li>
          <Link to="/stop">Stop Table</Link>
        </li>
      </ul>
    </div>
  );
};

export default Index;
