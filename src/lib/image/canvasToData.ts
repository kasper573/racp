import { canvasToContext } from "./canvasToContext";

export function canvasToData(canvas: HTMLCanvasElement) {
  return canvasToContext(canvas).getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );
}
