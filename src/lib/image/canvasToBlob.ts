export function canvasToBlob(canvas: HTMLCanvasElement, type?: string) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      blob ? resolve(blob) : reject();
    }, type);
  });
}
