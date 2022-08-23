export function loadImage(imageUrl: string) {
  return new Promise<HTMLImageElement | undefined>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = imageUrl;
    image.onload = () => resolve(image);
    image.onerror = () => reject(undefined);
  });
}
