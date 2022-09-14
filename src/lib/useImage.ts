import { useEffect, useState } from "react";
import { loadImage } from "./loadImage";

export function useImage(imageUrl?: string) {
  const [image, setImage] = useState<HTMLImageElement>();
  const [isLoading, setIsLoading] = useState(true);
  const isBroken = imageUrl && !image && !isLoading;

  useEffect(() => {
    if (!imageUrl) {
      return;
    }
    (async () => {
      try {
        setIsLoading(true);
        setImage(await loadImage(imageUrl));
      } catch {
        setImage(undefined);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [imageUrl]);

  return { image, isLoading, isBroken };
}
