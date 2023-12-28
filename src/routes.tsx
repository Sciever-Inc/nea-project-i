import { RouteProps } from "react-router-dom";
import CallbackHandler from "./pages/CallBackHandler";
import Complaint from "./pages/Complaint";
import ComplaintMap from "./pages/ComplaintMap";
import FaultTable from "./pages/FaultTable";
import Index from "./pages/Index";
import LoginPage from "./pages/Login";
import MapMarker from "./pages/MapMarker";
import MapOsm from "./pages/SingleComplaint";
import TripTable from "./pages/TripTbable";
import StopTable from "./pages/StopTable";
import MapDevice from "./pages/MapDevice";
import SingleTrip from "./pages/TripMap";
import ComplaintMapbox from "./pages/ComplaintMapbox";
import Nea from "./pages/NEA";

export const routes: RouteProps[] = [
  {
    path: "/complaint",
    component: Complaint,
  },
  {
    path: "/map-marker",
    component: MapMarker,
  },
  {
    path: "/complaint-map",
    component: ComplaintMap,
  },
  {
    path: "/complaint-mapbox",
    component: ComplaintMapbox,
  },
  {
    path: "/fault-table",
    component: FaultTable,
  },
  {
    path: "/single-complaint-osm",
    component: MapOsm,
  },
  {
    path: "/login",
    component: LoginPage,
  },
  {
    path: "/callback",
    component: CallbackHandler,
  },
  {
    path: "/",
    component: Index,
    exact: true,
  },

  {
    path: "/trip",
    component: TripTable,
  },
  {
    path: "/trip-map",
    component: SingleTrip,
  },
  {
    path: "/stop",
    component: StopTable,
  },
  {
    path: "/map-device",
    component: MapDevice,
  },
];
