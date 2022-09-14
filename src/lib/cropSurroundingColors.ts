import trimImageData, { TrimOptions } from "trim-image-data";
import { loadImage } from "./loadImage";
import {
  canvasToBlob,
  canvasToData,
  imageDataToCanvas,
  imageToCanvas,
} from "./imageUtils";

export type RGB = [number, number, number];

export async function cropSurroundingColors(
  imageFile: File,
  colors: RGB[]
): Promise<File> {
  const image = await loadImage(imageFile);
  if (!image) {
    throw new Error("Could not load image");
  }
  const originalData = canvasToData(imageToCanvas(image));
  const croppedData = trimImageData(originalData, createTrimOptions(colors));
  const croppedCanvas = imageDataToCanvas(croppedData);
  const blob = await canvasToBlob(croppedCanvas, imageFile.type);
  return new File([blob], imageFile.name, { type: imageFile.type });
}

const createTrimOptions = (colors: RGB[]): TrimOptions => ({
  trimColor: ({ red, green, blue }) =>
    !colors.some(([r, g, b]) => r === red && g === green && b === blue),
});
