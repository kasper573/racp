import { useEffect, useState } from "react";

export function useDocumentReadyState() {
  const [readyState, setReadyState] = useState(document.readyState);
  useEffect(() => {
    const onChange = () => setReadyState(document.readyState);
    document.addEventListener("readystatechange", onChange);
    return () => {
      document.removeEventListener("readystatechange", onChange);
    };
  }, []);
  return readyState;
}
