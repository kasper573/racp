import { useEffect, useState } from "react";
import { pick } from "lodash";
import { loadImage } from "../image/loadImage";
import { imageToCanvas } from "../image/imageToCanvas";

export function useImage(imageUrl?: string) {
  const [bounds, setBounds] = useState<{ width: number; height: number }>();
  const [dataUrl, setDataUrl] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>();
  const isBroken = imageUrl && !dataUrl && isLoading === false;

  useEffect(() => {
    setBounds(undefined);
    setDataUrl(undefined);
    if (!imageUrl) {
      return;
    }
    (async () => {
      try {
        setIsLoading(true);
        const image = await loadImage(imageUrl);
        if (image) {
          const dataUrl = image ? imageToCanvas(image).toDataURL() : undefined;
          setBounds(pick(image, "width", "height"));
          setDataUrl(dataUrl);
        }
      } catch {
        setBounds(undefined);
        setDataUrl(undefined);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [imageUrl]);

  return {
    bounds,
    dataUrl,
    isLoading: !!isLoading,
    isReady: !!dataUrl,
    isBroken,
  };
}
