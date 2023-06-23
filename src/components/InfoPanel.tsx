import React, { useState } from "react";
import "./InfoPanel.css";

type InfoPanelProps = {
  coordinates: number[];
  name: string;
  okAction?: () => Promise<void>;
};

const InfoPanel = ({ coordinates, name, okAction }: InfoPanelProps) => {
  const [busy, setBusy] = useState(false);
  const [expand, setExpand] = useState(true);

  const onClick = () => {
    if (okAction) {
      setBusy(true);
      okAction().finally(() => setBusy(false));
    }
  };

  return (
    <div className="info-panel">
      {!expand ? (
        <button
          className="info-expand"
          type="button"
          onClick={() => setExpand(true)}
        >
          +
        </button>
      ) : (
        <div>
          <div className="info-header">
            <button
              className="info-expand"
              type="button"
              onClick={() => setExpand(false)}
            >
              -
            </button>
          </div>
          <div className="info-content">
            <div>
              <b>Coordinates:</b>{" "}
              <small>
                {" "}
                [{coordinates?.[0] && coordinates[0]},
                {coordinates?.[1] && coordinates[1]}]
              </small>
              <br />
              <b>Name: </b>
              <small>{name}</small>
            </div>
            {okAction && (
              <>
                <hr />
                <button disabled={busy} onClick={okAction}>
                  Save
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(InfoPanel);
