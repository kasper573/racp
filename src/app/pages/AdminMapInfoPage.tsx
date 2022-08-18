import FileUpload from "react-material-file-upload";
import { LinearProgress, Typography } from "@mui/material";
import { useState } from "react";
import { Header } from "../layout/Header";

import { ErrorMessage } from "../components/ErrorMessage";
import { GrfBrowser } from "../../lib/GrfBrowser";
import { defined } from "../../lib/defined";
import { useUploadMapImageMutation } from "../state/client";

export default function AdminMapInfoPage() {
  const [itemCount] = useState(0);
  const [uploadError, setUploadError] = useState<string>();
  const [uploadProgress, setUploadProgress] = useState<[number, number]>();
  const [uploadMapImage, { isLoading }] = useUploadMapImageMutation();

  async function loadMapImagesFromGrfFile(grf: GrfBrowser) {
    const mapImages = await Promise.allSettled(
      grf
        .dir(`data\\texture\\à¯àúàîåíæäàì½º\\map\\`)
        .map((file) => grf.getFileObject(file, "image/bmp"))
    );

    return defined(
      mapImages.map((res) =>
        res.status === "fulfilled" ? res.value : undefined
      )
    );
  }

  async function uploadMapImagesFromGrfFile(grf: GrfBrowser) {
    const uploadQueue = await loadMapImagesFromGrfFile(grf);
    const uploadSize = uploadQueue.length;
    setUploadProgress([0, uploadSize]);
    while (uploadQueue.length > 0) {
      const batch = uploadQueue.splice(0, 25);
      await Promise.all(
        batch.map((file) =>
          uploadMapImage(file).catch((e) => console.log(e, file))
        )
      );
      setUploadProgress([uploadSize - uploadQueue.length, uploadSize]);
    }
  }

  async function onFileSelectedForUpload(file: File) {
    setUploadError(undefined);
    setUploadProgress(undefined);
    try {
      if (file.name.endsWith(".grf")) {
        const grf = new GrfBrowser(file);
        await grf.load();
        await uploadMapImagesFromGrfFile(grf);
      } else if (file.name.endsWith(".lub")) {
        // TODO implement lub upload
      }
    } catch (e) {
      setUploadError(`${e}`);
    } finally {
      setUploadProgress(undefined);
    }
  }

  return (
    <>
      <Header>Map info</Header>
      <Typography paragraph>
        Database currently contain {itemCount} map info entries.
      </Typography>
      <FileUpload
        value={[]}
        sx={{ maxWidth: 380, margin: "0 auto" }}
        accept={[".grf", ".lub"]}
        disabled={isLoading}
        onChange={([file]) => onFileSelectedForUpload(file)}
        maxFiles={1}
        title={
          "Select your mapInfo.lub file to update the item info database. " +
          "Select your data.grf file to update the map images." +
          "This will replace the existing entries."
        }
      />
      <ErrorMessage sx={{ textAlign: "center", mt: 1 }} error={uploadError} />
      {uploadProgress && (
        <LinearProgress
          variant="determinate"
          value={(uploadProgress[0] / uploadProgress[1]) * 100}
        />
      )}
    </>
  );
}
