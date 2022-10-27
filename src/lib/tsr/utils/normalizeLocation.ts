import { Location } from "history";
import { RouteLocation } from "../types";

export function normalizeLocation(location: Location): RouteLocation {
  return (location.pathname + location.search) as RouteLocation;
}
