import { useCallback, useEffect, useState } from "react";
import "../App.css";
import { v4 as uuid4 } from "uuid";
import Logo from "../assets/nea logo.png";
import axios from "axios";
import { strapi_url } from "../config/constant";

const ref_id = uuid4();

let mapMarkerWindow: (Window & { refId?: string }) | null = null;

const Complaint = () => {
  const [scnumber, setScnumber] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [provincialOffice, setProvincialOffice] = useState("");
  const [concernOffice, setConcernOffice] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationName, setLocationName] = useState("");
  const [remarks, setRemarks] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageId, setImageId] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const getLocationAndPlaceName = async () => {
      if ("geolocation" in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            }
          );

          const { latitude, longitude } = position.coords;
          const longlat = longitude + "," + latitude;
          const response = await axios.get(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longlat}.json`,
            {
              params: {
                country: "np",
                proximity: "ip",
                limit: 1,
                // access_token: mapConfig.accessToken,
              },
            }
          );
          const data = response.data.features;
          const location_name = data.map((d: any) => d.place_name);
          setLocationName(location_name.join(""));
          setLongitude(longitude.toString());
          setLatitude(latitude.toString());
        } catch (error) {
          console.log(error);
        }
      } else {
        console.log("Geolocation is not available");
      }
    };
    getLocationAndPlaceName();
  }, []);

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const image = event.target.files?.[0];
    setImage(image ?? null);
    if (image) {
      const formData = new FormData();
      formData.append("files", image);
      const response = await axios.post(`${strapi_url}/api/upload`, formData);
      setImageId(response.data.map((el: any) => el.id));
      console.log(response.data.map((el: any) => el.formats.thumbnail.url));
      setThumbnailUrl(
        `${strapi_url}${response.data.map(
          (el: any) => el.formats.thumbnail.url
        )}`
      );
    }
  };

  const handleImageDelete = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    await axios.delete(`${strapi_url}/api/upload/files/${imageId}`);
    setThumbnailUrl("");
  };

  useEffect(() => {
    // Clear form fields when the form is submitted
    if (submitted) {
      setScnumber("");
      setCustomerId("");
      setName("");
      setPhone("");
      setEmail("");
      setProvincialOffice("");
      setConcernOffice("");
      setSubject("");
      setMessage("");
      setLocation("");
      setLatitude("");
      setLongitude("");
      setLocationName("");
      setRemarks("");
      setImage(null);
      setImageId("");
      setThumbnailUrl("");
      setSubmitted(false);
      alert("Thank you for submitting a response");
    }
  }, [submitted]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = {
      data: {
        sc_number: scnumber,
        customer_id: customerId,
        name: name,
        phone: phone,
        email: email,
        provisional_office: provincialOffice,
        concern_office: concernOffice,
        subject: subject,
        message: message,
        fault_location: locationName,
        fault_latitude: latitude,
        fault_longitude: longitude,
        remarks: remarks,
        image: imageId,
      },
    };

    try {
      axios.post(`${strapi_url}/api/complaints`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setSubmitted(true);
    } catch (error) {
      console.error(error);
    }
    console.log("Form has been submitted");
  };

  // End Form submit

  const handleMessage = useCallback((event: MessageEvent) => {
    if (
      mapMarkerWindow &&
      event.data?.type === "save-event" &&
      event.data?.refId === mapMarkerWindow.refId
    ) {
      console.log({ d: event.data });
      setLocation(event?.data?.coordinates?.toString() ?? "");
      setLatitude(event?.data?.coordinates[1] ?? "");
      setLongitude(event?.data?.coordinates[0] ?? "");
      setLocationName(event?.data?.places?.toString() ?? "");
      mapMarkerWindow?.close?.();
    }
  }, []);

  const handleCancel = useCallback((event: Event) => {
    console.log(mapMarkerWindow?.closed);
    if (mapMarkerWindow?.closed) {
      console.log("Canceled");
    }
  }, []);

  const openMap = () => {
    if (mapMarkerWindow && !mapMarkerWindow.closed) {
      mapMarkerWindow.focus();
      return;
    }

    const params = new URLSearchParams();

    params.set("callback_url", "http://localhost");
    params.set("ref_id", ref_id);
    mapMarkerWindow = window.open(
      "/map-marker?" + params.toString(),
      "Location",
      "height=960px,width=940px"
    );
    if (mapMarkerWindow) {
      mapMarkerWindow.refId = ref_id;
      mapMarkerWindow.addEventListener("message", handleMessage);
      mapMarkerWindow.addEventListener("unload", handleCancel);

      setTimeout(() => {
        mapMarkerWindow?.close();
        mapMarkerWindow = null;
      }, 30 * 60 * 1000);
    }
  };

  useEffect(() => {
    mapMarkerWindow?.close();
    mapMarkerWindow = null;
  });

  useEffect(() => {
    if (subject === "") {
      setMessage("");
    }
  }, [subject]);

  useEffect(() => {
    if (provincialOffice === "") {
      setConcernOffice("");
    }
  }, [provincialOffice]);


  return (
    <>
      <div className="un-header">
        <div className="text-center" style={{ padding: "15px" }}>
          <img
            src={Logo}
            alt="NEA-logo"
            style={{ height: "50px", maxWidth: "100%" }}
          />
        </div>
      </div>
      <div className="bg-container container-fluid">
        <div className="bg-title text-center">
          <h1
            className="h4 mb-4 text-center text-white"
            style={{
              paddingTop: "15px",
              paddingBottom: "15px",
            }}
          >
            Add New Complain
          </h1>
        </div>
        <div className="row">
          <div className="col-md-6 form-complain" style={{ margin: "auto" }}>
            <div
              className="form-panel"
              style={{
                height: "74vh",
                width: "50vw",
                marginRight: "auto",
                marginLeft: "auto",
                marginBottom: "3rem",
                backgroundColor: "#fff",
                overflow: "scroll",
              }}
            >
              <form className="user" noValidate onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-12">
                    <div className="form-group">
                      <div className="row">
                        <label className="col-md-4">
                          SC Number
                          <small style={{ marginLeft: "2px", opacity: 0.5 }}>
                            (Optional)
                          </small>
                        </label>
                        <div className="col-md-8">
                          <input
                            type="text"
                            id="scnumber"
                            name="scnumber"
                            value={scnumber}
                            onChange={(e) => setScnumber(e.target.value)}
                            className="form-control"
                            placeholder="xxx.xx.xxx"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="row">
                        <label className="col-md-4">
                          Customer ID
                          <small style={{ marginLeft: "2px", opacity: 0.5 }}>
                            (Optional)
                          </small>{" "}
                        </label>
                        <div className="col-md-8">
                          <input
                            type="text"
                            id="customerId"
                            name="customerId"
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            className="form-control"
                            placeholder="Customer Id"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="row">
                        <label className="col-md-4">
                          Name{" "}
                          <small style={{ opacity: 0.5, marginLeft: "5px" }}>
                            *
                          </small>
                        </label>
                        <div className="col-md-8">
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="form-control"
                            placeholder="Full Name"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="row">
                        <label className="col-md-4">
                          Mobile/Phone{" "}
                          <small style={{ opacity: 0.5, marginLeft: "5px" }}>
                            *
                          </small>
                        </label>
                        <div className="col-md-8">
                          <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="form-control"
                            placeholder="Mobile/Phone"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="row">
                        <label className="col-md-4">
                          Email{" "}
                          <small style={{ marginLeft: "2px", opacity: 0.5 }}>
                            (Optional)
                          </small>{" "}
                        </label>
                        <div className="col-md-8">
                          <input
                            type="text"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-control"
                            placeholder="Email"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="row">
                        <label className="col-md-4">
                          Provincial Office{" "}
                          <small style={{ opacity: 0.5, marginLeft: "5px" }}>
                            *
                          </small>
                        </label>
                        <div className="col-md-8">
                          <select
                            id="provincialOffice"
                            name="provincialOffice"
                            value={provincialOffice}
                            onChange={(e) =>
                              setProvincialOffice(e.target.value)
                            }
                            required
                            className="form-control"
                          >
                            <option value="">
                              -- Select Provincial Office --
                            </option>
                            <option value="provincialOffice1">
                              Provincial Office 1
                            </option>
                            <option value="provincialOffice2">
                              Provincial Office 2
                            </option>
                            <option value="provincialOffice3">
                              Provincial Office 3
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="row">
                        <label className="col-md-4">
                          Concern Office{" "}
                          <small style={{ opacity: 0.5, marginLeft: "5px" }}>
                            *
                          </small>
                        </label>
                        <div className="col-md-8">
                          <select
                            id="concernOffice"
                            name="concernOffice"
                            value={concernOffice}
                            onChange={(e) => setConcernOffice(e.target.value)}
                            disabled={!provincialOffice}
                            required
                            className="form-control"
                          >
                            <option value="">
                              -- Select Concern Office --
                            </option>
                            <option
                              value="concernOffice1"
                              disabled={!provincialOffice}
                            >
                              Concern Office 1
                            </option>
                            <option
                              value="concernOffice2"
                              disabled={!provincialOffice}
                            >
                              Concern Office 2
                            </option>
                            <option
                              value="concernOffice3"
                              disabled={!provincialOffice}
                            >
                              Concern Office 3
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="row">
                        <label className="col-md-4">
                          Subject{" "}
                          <small style={{ opacity: 0.5, marginLeft: "5px" }}>
                            *
                          </small>
                        </label>
                        <div className="col-md-8">
                          <select
                            id="subject"
                            name="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                            className="form-control"
                          >
                            <option value="">-- Select Subject --</option>
                            <option value="subject1">Subject 1</option>
                            <option value="subject2">Subject 2</option>
                            <option value="subject3">Subject 3</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="row">
                        <label className="col-md-4">
                          Message{" "}
                          <small style={{ opacity: 0.5, marginLeft: "5px" }}>
                            *
                          </small>
                        </label>
                        <div className="col-md-8">
                          <select
                            id="message"
                            name="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={!subject}
                            required
                            className="form-control"
                          >
                            <option value="">-- Select Message --</option>
                            <option value="message1" disabled={!subject}>
                              Message 1
                            </option>
                            <option value="message2" disabled={!subject}>
                              Message 2
                            </option>
                            <option value="message3" disabled={!subject}>
                              Message 3
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="row">
                        <label className="col-md-4">Fault Location</label>
                        <div className="input-group col-md-8">
                          <div
                            onClick={openMap}
                            style={{ display: "flex", flexDirection: "row" }}
                          >
                            <input
                              type="text"
                              value={locationName}
                              onChange={(event) =>
                                setLocationName(event.currentTarget.value)
                              }
                              className="form-control"
                              placeholder="Fault Location"
                            />
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ fontSize: "small" }}
                            >
                              Choose Location
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="row">
                        <label className="col-md-4">
                          Remarks
                          <small style={{ marginLeft: "2px", opacity: 0.5 }}>
                            (Optional)
                          </small>
                        </label>
                        <div className="col-md-8">
                          <input
                            type="text"
                            id="remarks"
                            name="remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="form-control"
                            placeholder="Enter Complain Message"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="row">
                        <label className="col-md-4">Image</label>
                        <div className="col-md-8">
                          <div className="file-input">
                            <input
                              type="file"
                              id="image"
                              name="image"
                              className="file-input__input"
                              onChange={handleImageChange}
                            />
                            <label
                              className="btn btn-primary"
                              htmlFor="image"
                              style={{ cursor: "pointer", fontSize: "small" }}
                            >
                              <span>Select Image</span>
                            </label>
                            <br />
                            <small style={{ opacity: 0.5 }}>
                              Only png,jpeg,jpg image types and 2 MB size
                              allowed
                            </small>
                            <div>
                              {thumbnailUrl && (
                                <button
                                  className="btn btn-danger"
                                  style={{
                                    fontSize: "small",
                                    position: "absolute",
                                    opacity: 0.8,
                                  }}
                                  onClick={handleImageDelete}
                                >
                                  X
                                </button>
                              )}
                              {thumbnailUrl && (
                                // eslint-disable-next-line jsx-a11y/img-redundant-alt
                                <img
                                  src={thumbnailUrl}
                                  alt="image"
                                  style={{
                                    width: "200px",
                                    height: "auto",
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="row" style={{ justifyContent: "center" }}>
                        {!name ||
                        !phone ||
                        !provincialOffice ||
                        !concernOffice ||
                        !subject ||
                        !message ? (
                          <button
                            disabled
                            className="btn btn-user"
                            type="submit"
                            style={{ marginTop: "10px" }}
                          >
                            Post
                          </button>
                        ) : (
                          <button
                            className="btn btn-user btn-primary"
                            type="submit"
                            style={{ marginTop: "10px" }}
                          >
                            Post
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Complaint;
