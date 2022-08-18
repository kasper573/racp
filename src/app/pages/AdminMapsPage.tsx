import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { flatten } from "lodash";
import { ExpandMore } from "@mui/icons-material";
import { Header } from "../layout/Header";

import { ErrorMessage } from "../components/ErrorMessage";
import { GrfBrowser } from "../../lib/GrfBrowser";
import { defined } from "../../lib/defined";
import {
  useCountMapImagesQuery,
  useCountMapInfoQuery,
  useGetMissingMapImagesQuery,
  useUploadMapImagesMutation,
  useUploadMapInfoMutation,
} from "../state/client";
import { fromBrowserFile } from "../../lib/rpc/RpcFile";
import { FileUploader } from "../components/FileUploader";

export default function AdminMapsPage() {
  const { data: mapImageCount = 0 } = useCountMapImagesQuery();
  const { data: mapInfoCount = 0 } = useCountMapInfoQuery();
  const { data: missingMapImages = [] } = useGetMissingMapImagesQuery();

  const [isPreparingUpload, setIsPreparingUpload] = useState(false);
  const [uploadCount, setUploadCount] = useState<number>(0);
  const [uploadMapImages, imageUpload] = useUploadMapImagesMutation();
  const [uploadMapInfo, infoUpload] = useUploadMapInfoMutation();

  const parseError =
    infoUpload.data?.length === 0
      ? { message: "Invalid lub file." }
      : undefined;

  const isLoading =
    imageUpload.isLoading || isPreparingUpload || infoUpload.isLoading;

  const error = imageUpload.error || infoUpload.error || parseError;

  async function onFilesSelectedForUpload(files: File[]) {
    const lubFiles = files.filter((file) => file.name.endsWith(".lub"));
    if (lubFiles.length) {
      handleLubFiles(lubFiles);
    }

    const grfFiles = files.filter((file) => file.name.endsWith(".grf"));
    const imageFiles = files.filter((file) => isImage(file.name));
    if (grfFiles.length) {
      setIsPreparingUpload(true);
      imageFiles.push(
        ...flatten(await Promise.all(grfFiles.map(loadMapImagesFromGRF)))
      );
      setIsPreparingUpload(false);
    }

    if (imageFiles.length) {
      setUploadCount(imageFiles.length);
      setIsPreparingUpload(true);
      const rpcFiles = await Promise.all(imageFiles.map(fromBrowserFile));
      setIsPreparingUpload(false);
      await uploadMapImages(rpcFiles);
    }
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
        accept={[".grf", ".lub", ...imageExtensions]}
        isLoading={isLoading}
        onChange={onFilesSelectedForUpload}
        title={
          "Select a mapInfo.lub file to update the item info database. " +
          "Select a data.grf file to automatically upload map images. " +
          "Select any image files to manually upload map images (file name must be map id)."
        }
      />

      <ErrorMessage sx={{ textAlign: "center", mt: 1 }} error={error} />

      <Box sx={{ margin: "0 auto" }}>
        {infoUpload.isLoading && <Typography>Updating item info...</Typography>}
        {isPreparingUpload && <Typography>Loading map images...</Typography>}
        {imageUpload.isLoading && (
          <Typography>Uploading {uploadCount} map images...</Typography>
        )}
      </Box>

      {missingMapImages.length > 0 && (
        <Accordion sx={{ [`&&`]: { marginTop: 2 } }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>
              {missingMapImages.length} missing map images:
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography sx={{ maxHeight: 300, overflowY: "auto" }}>
              {missingMapImages.join(", ")}
            </Typography>
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
}

const imageExtensions = [".png", ".jpg", ".jpeg", ".bmp", ".tga"];
const isImage = (fileName: string) =>
  imageExtensions.some((ext) => fileName.endsWith(ext));

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
