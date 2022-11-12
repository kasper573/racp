import { useEffect, useState } from "react";

export function useObjectUrl(blob?: Blob) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    const url = blob ? URL.createObjectURL(blob) : undefined;
    setUrl(url);
    if (url) {
      return () => URL.revokeObjectURL(url);
    }
  }, [blob]);
  return url;
}
