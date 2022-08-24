export function loadImage(source: string | File) {
  return new Promise<HTMLImageElement | undefined>((resolve, reject) => {
    const isFile = typeof source !== "string";
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = isFile ? URL.createObjectURL(source) : source;
    image.onload = () => {
      if (isFile) {
        URL.revokeObjectURL(image.src);
      }
      resolve(image);
    };
    image.onerror = () => {
      if (isFile) {
        URL.revokeObjectURL(image.src);
      }
      reject(undefined);
    };
  });
}
