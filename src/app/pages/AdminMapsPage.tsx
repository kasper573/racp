import { Box, Typography } from "@mui/material";
import { useState } from "react";
import { flatten } from "lodash";
import { Header } from "../layout/Header";

import { ErrorMessage } from "../components/ErrorMessage";
import { GrfBrowser } from "../../lib/GrfBrowser";
import { defined } from "../../lib/defined";
import {
  useCountMapImagesQuery,
  useCountMapInfoQuery,
  useUploadMapImagesMutation,
  useUploadMapInfoMutation,
} from "../state/client";
import { fromBrowserFile } from "../../lib/rpc/RpcFile";
import { FileUploader } from "../components/FileUploader";

export default function AdminMapsPage() {
  const { data: mapImageCount = 0 } = useCountMapImagesQuery();
  const { data: mapInfoCount = 0 } = useCountMapInfoQuery();
  const [isLoadingGRF, setIsLoadingGRF] = useState(false);
  const [uploadCount, setUploadCount] = useState<number>(0);
  const [uploadMapImages, imageUpload] = useUploadMapImagesMutation();
  const [uploadMapInfo, infoUpload] = useUploadMapInfoMutation();

  const parseError =
    infoUpload.data === false ? { message: "Invalid lub file." } : undefined;
  const isLoading =
    imageUpload.isLoading || isLoadingGRF || infoUpload.isLoading;
  const error = imageUpload.error || infoUpload.error || parseError;

  async function onFilesSelectedForUpload(files: File[]) {
    const grfFiles = files.filter((file) => file.name.endsWith(".grf"));
    if (grfFiles.length) {
      handleGrfFiles(grfFiles);
    }

    const lubFiles = files.filter((file) => file.name.endsWith(".lub"));
    if (lubFiles.length) {
      handleLubFiles(lubFiles);
    }
  }

  async function handleGrfFiles(grfFiles: File[]) {
    setIsLoadingGRF(true);
    const mapImages = flatten(
      await Promise.all(grfFiles.map(loadMapImagesFromGRF))
    );
    const rpcFiles = await Promise.all(mapImages.map(fromBrowserFile));
    setIsLoadingGRF(false);

    setUploadCount(rpcFiles.length);
    await uploadMapImages(rpcFiles);
  }

  async function handleLubFiles(lubFiles: File[]) {
    const rpcFiles = await Promise.all(lubFiles.map(fromBrowserFile));
    await uploadMapInfo(rpcFiles);
  }

  return (
    <>
      <Header>Maps</Header>
      <Typography paragraph>
        Database currently contain {mapInfoCount} map info entries and{" "}
        {mapImageCount} map images.
      </Typography>
      <FileUploader
        value={[]}
        sx={{ maxWidth: 380, margin: "0 auto" }}
        accept={[".grf", ".lub"]}
        isLoading={isLoading}
        onChange={onFilesSelectedForUpload}
        title={
          "Select your mapInfo.lub file to update the item info database. " +
          "Select your data.grf file to update the map images. " +
          "This will replace the existing entries."
        }
      />
      <ErrorMessage sx={{ textAlign: "center", mt: 1 }} error={error} />
      <Box sx={{ margin: "0 auto" }}>
        {infoUpload.isLoading && <Typography>Updating item info...</Typography>}
        {imageUpload.isLoading && (
          <Typography>Uploading {uploadCount} map images...</Typography>
        )}
        {isLoadingGRF && <Typography>Loading GRF file...</Typography>}
      </Box>
    </>
  );
}

async function loadMapImagesFromGRF(file: File) {
  const grf = new GrfBrowser(file);
  await grf.load();

  const mapImages = await Promise.allSettled(
    grf
      .dir(`data\\texture\\à¯àúàîåíæäàì½º\\map\\`)
      .map((file) => grf.getFileObject(file, "image/bmp"))
  );

  return defined(
    mapImages.map((res) => (res.status === "fulfilled" ? res.value : undefined))
  );
}
