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
      return Jimp.read(data).then(
        (image) =>
          new Promise<void>((resolve, reject) => {
            image
              .quality(quality)
              .write(changeExtension(targetPath, extension), (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              });
          })
      );
    },
  };
}

const changeExtension = (path: string, ext: string) =>
  path.replace(/\.[^/.]+$/, ext);
