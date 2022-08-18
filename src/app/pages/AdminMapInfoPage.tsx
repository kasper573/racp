import FileUpload from "react-material-file-upload";
import { Box, Typography } from "@mui/material";
import { useState } from "react";
import { Header } from "../layout/Header";

import { ErrorMessage } from "../components/ErrorMessage";
import { GrfBrowser } from "../../lib/GrfBrowser";
import { defined } from "../../lib/defined";
import {
  useCountMapImagesQuery,
  useUploadMapImagesMutation,
} from "../state/client";
import { fromBrowserFile } from "../../lib/rpc/RpcFile";

export default function AdminMapInfoPage() {
  const [infoCount] = useState(0);
  const { data: mapImageCount = 0 } = useCountMapImagesQuery();
  const [isLoadingMapImages, setIsLoadingMapImages] = useState(false);
  const [uploadCount, setUploadCount] = useState<number>(0);
  const [uploadMapImages, { isLoading: isUploading, error: uploadError }] =
    useUploadMapImagesMutation();

  async function onFileSelectedForUpload(file: File) {
    if (file.name.endsWith(".grf")) {
      setIsLoadingMapImages(true);
      const files = await loadMapImages(file);
      setIsLoadingMapImages(false);
      setUploadCount(files.length);
      await uploadMapImages(files);
    } else if (file.name.endsWith(".lub")) {
      // TODO implement lub upload
    }
  }

  return (
    <>
      <Header>Map info</Header>
      <Typography paragraph>
        Database currently contain {infoCount} map info entries and{" "}
        {mapImageCount} map images.
      </Typography>
      <FileUpload
        value={[]}
        sx={{ maxWidth: 380, margin: "0 auto" }}
        accept={[".grf", ".lub"]}
        disabled={isUploading}
        onChange={([file]) => onFileSelectedForUpload(file)}
        maxFiles={1}
        title={
          "Select your mapInfo.lub file to update the item info database. " +
          "Select your data.grf file to update the map images." +
          "This will replace the existing entries."
        }
      />
      <ErrorMessage sx={{ textAlign: "center", mt: 1 }} error={uploadError} />
      <Box sx={{ margin: "0 auto" }}>
        {isUploading && (
          <Typography>Uploading {uploadCount} map images</Typography>
        )}
        {isLoadingMapImages && <Typography>Loading GRF file</Typography>}
      </Box>
    </>
  );
}

async function loadMapImages(file: File) {
  const grf = new GrfBrowser(file);
  await grf.load();

  const mapImages = await Promise.allSettled(
    grf
      .dir(`data\\texture\\à¯àúàîåíæäàì½º\\map\\`)
      .map((file) => grf.getFileObject(file, "image/bmp"))
  );

  const successfullyLoadedMapImages = defined(
    mapImages.map((res) => (res.status === "fulfilled" ? res.value : undefined))
  );

  const rpcFiles = await Promise.all(
    successfullyLoadedMapImages.map(fromBrowserFile)
  );

  return rpcFiles;
}
