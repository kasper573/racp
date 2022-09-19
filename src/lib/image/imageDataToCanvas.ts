import { canvasToContext } from "./canvasToContext";

export function imageDataToCanvas(imageData: ImageData) {
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  canvasToContext(canvas).putImageData(imageData, 0, 0);
  return canvas;
}