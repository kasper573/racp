import { useEffect, useState } from "react";

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

function loadImage(imageUrl: string) {
  return new Promise<HTMLImageElement | undefined>((resolve, reject) => {
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => resolve(image);
    image.onerror = () => reject(undefined);
  });
}
