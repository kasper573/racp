export function canvasToBlob(canvas: HTMLCanvasElement, type?: string) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      blob ? resolve(blob) : reject();
    }, type);
  });
}

export function imageToCanvas(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  canvasToContext(canvas).drawImage(image, 0, 0);
  return canvas;
}

export function canvasToData(canvas: HTMLCanvasElement) {
  return canvasToContext(canvas).getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );
}

export function imageDataToCanvas(imageData: ImageData) {
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
