import { flatten, pick } from "lodash";
import { cropSurroundingColors, RGB } from "../../lib/cropSurroundingColors";
import {
  useUpdateMapBoundsMutation,
  useUploadMapImagesMutation,
  useUploadMapInfoMutation,
} from "../state/client";
import { fromBrowserFile } from "../../lib/rpc/RpcFile";
import { GrfBrowser } from "../../lib/grf/GrfBrowser";
import { MapBounds, MapBoundsRegistry } from "../../api/services/map/types";
import { parseGAT } from "../../lib/grf/parseGAT";
import { usePromiseTracker } from "./usePromiseTracker";

export function useMapFileUploader({
  cropColor = [255, 0, 255], // Magenta
}: {
  cropColor?: RGB;
} = {}) {
  const [uploadMapImages, imageUpload] = useUploadMapImagesMutation();
  const [uploadMapInfo, infoUpload] = useUploadMapInfoMutation();
  const [updateMapBounds, boundsUpdate] = useUpdateMapBoundsMutation();
  const tracker = usePromiseTracker();

  const parseError =
    infoUpload.data?.length === 0
      ? { message: "Invalid lub file." }
      : undefined;

  const error =
    imageUpload.error || infoUpload.error || parseError || boundsUpdate.error;

  async function upload(_files: readonly File[]) {
    tracker.reset();

    const files = _files.slice();
    const grfFiles = files.filter((file) => file.name.endsWith(".grf"));
    const grfBrowsers = await tracker.trackAll(
      grfFiles.map(GrfBrowser.load),
      "Initializing GRF loaders"
    );

    const filesFromGRF = flatten(
      await tracker.trackAll(
        flatten(grfBrowsers.map(unpackGATAndImageFiles)),
        "Unpacking GRF files"
      )
    );

    // Add any relevant files found
    files.push(...filesFromGRF);

    const lubFiles = files.filter((file) => file.name.endsWith(".lub"));
    const gatFiles = files.filter((file) => file.name.endsWith(".gat"));
    const imageFiles = files.filter((file) => isImage(file.name));

    if (lubFiles.length) {
      tracker
        .trackAll(lubFiles.map(fromBrowserFile), "Loading lub file")
        .then((files) =>
          tracker.trackOne(
            uploadMapInfo(files),
            `Uploading ${files.length} lub files`
          )
        );
    }

    if (gatFiles.length) {
      const gatObjects = await tracker.trackAll(
        gatFiles.map((file) => file.arrayBuffer().then(parseGAT)),
        "Reading map bounds from GAT files"
      );

      const registry = createMapBoundsRegistry(gatFiles, gatObjects);
      tracker.trackOne(
        updateMapBounds(registry),
        `Uploading ${gatObjects.length} map bounds`
      );
    }

    if (imageFiles.length) {
      const cropped = await tracker.trackAll(
        imageFiles.map(cropMapImage),
        `Cropping ${imageFiles.length} map images`
      );
      const rpcFiles = await tracker.trackAll(
        cropped.map(fromBrowserFile),
        `Preparing ${cropped.length} map images for upload`
      );

      tracker.trackAll(
        rpcFiles.map((file) => uploadMapImages([file])),
        `Uploading ${rpcFiles.length} map images`
      );
    }
  }

  const isImage = (fileName: string) =>
    imageExtensions.some((ext) => fileName.endsWith(ext));

  async function cropMapImage(file: File) {
    return cropSurroundingColors(file, [cropColor]);
  }

  return {
    ...pick(tracker, "isPending", "tasks", "progress"),
    upload,
    error,
    fileExtensions: [...imageExtensions, ".lub", ".gat", ".grf"],
  };
}

const fileNameToMapName = (filename: string) =>
  /([^/\\]+)\.\w+$/.exec(filename)?.[1] ?? "";

function unpackGATAndImageFiles(grf: GrfBrowser): Promise<File[]>[] {
  const gatFilePathRegex = /^data\\(.*)\.gat$/;

  return Array.from(grf.files.keys())
    .filter((file) => gatFilePathRegex.test(file))
    .map(async (gatFilePath) => {
      const out: File[] = [];

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const mapName = fileNameToMapName(gatFilePath)!;
      const imageFilePath = `data\\texture\\à¯àúàîåíæäàì½º\\map\\${mapName}.bmp`;

      const [grfImageFile, grfGatFile] = await Promise.all([
        grf.getFile(imageFilePath),
        grf.getFile(gatFilePath),
      ]);

      if (grfGatFile.data) {
        out.push(
          new File([grfGatFile.data], `${mapName}.gat`, {
            type: "application/gat",
          })
        );
      }

      if (grfImageFile.data) {
        out.push(
          new File([grfImageFile.data], `${mapName}.bmp`, {
            type: "image/bmp",
          })
        );
      }

      return out;
    });
}

async function readBoundsFromGAT(file: File) {
  const view = new DataView(await file.arrayBuffer());
  const width = view.getUint32(6, true);
  const height = view.getUint32(10, true);
  return { width, height };
}

function createMapBoundsRegistry(files: File[], bounds: MapBounds[]) {
  return bounds.reduce(
    (registry: MapBoundsRegistry, bounds, index) => ({
      ...registry,
      [fileNameToMapName(files[index].name)]: bounds,
    }),
    {}
  );
}

const imageExtensions = [".png", ".jpg", ".jpeg", ".bmp", ".tga"];
