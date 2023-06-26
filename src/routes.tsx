import { RouteProps } from "react-router-dom";
import Complaint from "./pages/Complaint";
import ComplaintMap from "./pages/ComplaintMap";
import FaultTable from "./pages/FaultTable";
import Index from "./pages/Index";
import MapMarker from "./pages/MapMarker";
import MapOsm from "./pages/SingleComplaint";

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
    path: "/fault-table",
    component: FaultTable,
  },
  {
    path: "/single-complaint-osm",
    component: MapOsm,
  },
  {
    path: "/",
    component: Index,
    exact: true,
  },
];
