/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import "./SearchPanel.css";
import axios from "axios";

type SearchPanelProps = {
  coordinates: number[];
  clickAction: (c: number[]) => void;
};

const SearchPanel = ({ coordinates, clickAction }: SearchPanelProps) => {
  const [expand, setExpand] = useState(false);
  const [places, setPlaces] = useState([]);
  const [searchText, setSearchText] = useState("");

  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(
    null
  ); // State to store the debounce timer

  const handleSearch = (value: string) => {
    setSearchText(value);
    // Use a debounce to delay the API call by 500 milliseconds after the user has stopped typing
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }
    setSearchDebounce(
      setTimeout(async () => {
        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/search.php?q=${value}`,
            {
              params: {
                polygon_geojson: 1,
                countrycodes: "np",
                format: "jsonv2",
                limit: 5,
              },
            }
          );
          const data = response.data;
          setPlaces(data);
        } catch (error) {
          // Handle error
          console.error(error);
        }
      }, 500)
    );
  };

  const handlePlaceClick = (placeName: string, long: number, lat: number) => {
    const coordinates = [long, lat];
    console.log(`Place name clicked: ${placeName}\nCoordinates:${coordinates}`);
    clickAction(coordinates);
  };

  return (
    <div className="search-panel">
      {!expand ? (
        <button
          className="search-btn"
          type="button"
          onClick={() => setExpand(true)}
        >
          &#128269;
        </button>
      ) : (
        <div>
          <input
            name="search-location"
            className="search-txt"
            onBlur={(e) => {
              setExpand(true);
              e.preventDefault();
              e.stopPropagation();
            }}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <button
            className="search-btn"
            type="button"
            onClick={() => setExpand(false)}
          >
            Cancel
          </button>
          <ul style={{ backgroundColor: "white" }}>
            {places.map((place: any) => (
              <li key={place.place_id}>
                <a
                  href="#"
                  onClick={() =>
                    handlePlaceClick(
                      place.display_name,
                      parseFloat(place.lon),
                      parseFloat(place.lat)
                    )
                  }
                >
                  {place.display_name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchPanel;
