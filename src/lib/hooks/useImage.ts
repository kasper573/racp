import { useEffect, useState } from "react";
import { pick } from "lodash";
import { loadImage } from "../image/loadImage";

export function useImage(imageUrl?: string) {
  const [isReady, setIsReady] = useState(false);
  const [isBroken, setIsBroken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bounds, setBounds] = useState<{ width: number; height: number }>();

  useEffect(() => {
    setBounds(undefined);
    setIsReady(false);
    setIsBroken(false);
    if (!imageUrl) {
      return;
    }
    (async () => {
      let image: HTMLImageElement;
      try {
        setIsLoading(true);
        image = await loadImage(imageUrl);
      } catch {
        setIsBroken(true);
        return;
      } finally {
        setIsLoading(false);
      }
      setBounds(pick(image, "width", "height"));
      setIsReady(true);
    })();
  }, [imageUrl]);

  return {
    bounds,
    isLoading,
    isReady,
    isBroken,
  };
}
