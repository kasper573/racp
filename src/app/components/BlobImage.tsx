import { ImgHTMLAttributes, useEffect, useState } from "react";

export function BlobImage({
  src: blob,
  ...props
}: { src: Blob } & Omit<ImgHTMLAttributes<HTMLImageElement>, "src">) {
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    const src = URL.createObjectURL(blob);
    setSrc(src);
    return () => URL.revokeObjectURL(src);
  }, [blob]);

  // eslint-disable-next-line jsx-a11y/alt-text
  return <img src={src} {...props} />;
}
