import { Location } from "history";
import { RouteUrl } from "../Route";

export function normalizeLocation(location: Location): RouteUrl {
  return (location.pathname + location.search) as RouteUrl;
}