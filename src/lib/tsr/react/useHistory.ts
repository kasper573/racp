import { useContext } from "react";
import { RouterContext } from "./RouterContext";

export function useHistory() {
  const { history } = useContext(RouterContext);
  return history;
}
