import trimImageData from "trim-image-data";

export type RGB = [number, number, number];

export function cropSurroundingColors(
  image: HTMLImageElement,
  backgroundColors: RGB[]
) {
  const imageData = canvasToData(imageToCanvas(image));
  const trimmed = trimImageData(imageData, {
    trimColor: ({ red, green, blue }) =>
      !backgroundColors.some(
        ([r, g, b]) => r === red && g === green && b === blue
      ),
  });
  return canvasToImage(imageDataToCanvas(trimmed));
}

function canvasToImage(canvas: HTMLCanvasElement) {
  const image = new Image();
  image.src = canvas.toDataURL("image/png");
  image.width = canvas.width;
  image.height = canvas.height;
  return image;
}

function imageToCanvas(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  canvasToContext(canvas).drawImage(image, 0, 0);
  return canvas;
}

function canvasToData(canvas: HTMLCanvasElement) {
  return canvasToContext(canvas).getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );
}

function imageDataToCanvas(imageData: ImageData) {
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  canvasToContext(canvas).putImageData(imageData, 0, 0);
  return canvas;
}

function canvasToContext(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }
  return ctx;
}
