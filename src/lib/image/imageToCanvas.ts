import { canvasToContext } from "./canvasToContext";

export function imageToCanvas(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  canvasToContext(canvas).drawImage(image, 0, 0);
  return canvas;
}
