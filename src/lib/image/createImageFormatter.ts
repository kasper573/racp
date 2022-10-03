import * as Jimp from "jimp";

export type ImageFormatter = ReturnType<typeof createImageFormatter>;

export function createImageFormatter({
  extension,
  quality,
}: {
  extension: string;
  quality: number;
}) {
  return {
    fileExtension: extension,
    write(targetPath: string, data: Buffer) {
      return Jimp.read(data).then((image) =>
        image.quality(quality).writeAsync(setExtension(targetPath, extension))
      );
    },
  };
}

const setExtension = (path: string, ext: string) =>
  hasExtension(path) ? path.replace(/\.[^/.]+$/, ext) : path + ext;

const hasExtension = (path: string): boolean => {
  const lastDot = path.lastIndexOf(".");
  const lastSlash = path.lastIndexOf("/");
  return lastDot > lastSlash;
};
