import { useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";

/**
 * Returns undefined until the page is ready.
 * Once the page is ready, returns true if the media query matches, false otherwise.
 */
export function useReadyMediaQuery(query: string) {
  const queryResult = useMediaQuery(query);
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    setIsReady(true);
  }, []);
  return isReady ? queryResult : undefined;
}
