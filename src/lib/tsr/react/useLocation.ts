import { useContext } from "react";
import { RouterContext } from "./RouterContext";

export function useLocation() {
  const { location } = useContext(RouterContext);
  return location;
}
