import { GrfBrowser } from "./GrfBrowser";

const fileNameToMapName = (filename: string) =>
  /([^/\\]+)\.\w+$/.exec(filename)?.[1] ?? "";

export async function loadMapDataFromGRFs(grfFiles: File[]) {
  const imageFiles: File[] = [];
  const gatFiles: File[] = [];

  const gatFilePathRegex = /^data\\(.*)\.gat$/;
  await Promise.all(
    grfFiles.map(async (file) => {
      const grf = new GrfBrowser(file);
      await grf.load();

      await Promise.all(
        Array.from(grf.files.keys())
          .filter((file) => gatFilePathRegex.test(file))
          .map(async (gatFilePath) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const mapName = fileNameToMapName(gatFilePath)!;
            const grfGatFile = await grf.getFile(gatFilePath);
            if (grfGatFile.data) {
              gatFiles.push(
                new File([grfGatFile.data], `${mapName}.gat`, {
                  type: "application/gat",
                })
              );
            }

            const imageFilePath = `data\\texture\\à¯àúàîåíæäàì½º\\map\\${mapName}.bmp`;
            const grfImageFile = await grf.getFile(imageFilePath);
            if (grfImageFile.data) {
              imageFiles.push(
                new File([grfImageFile.data], `${mapName}.bmp`, {
                  type: "image/bmp",
                })
              );
            }
          })
      );
    })
  );

  return { imageFiles, gatFiles };
}

export async function readBoundsFromGATs(files: File[]) {
  const bounds = await Promise.all(
    files.map(async (file) => {
      const view = new DataView(await file.arrayBuffer());
      const width = view.getUint32(6, true);
      const height = view.getUint32(10, true);
      return { width, height };
    })
  );

  return bounds.reduce(
    (boundsPerMap, bounds, index) => ({
      ...boundsPerMap,
      [fileNameToMapName(files[index].name)]: bounds,
    }),
    {} as Record<string, { width: number; height: number }>
  );
}
