import { memo, useState } from "react";
import { Box, LinearProgress, Tooltip, Typography } from "@mui/material";
import { useBlockNavigation } from "../../../lib/hooks/useBlockNavigation";
import { ProgressButton } from "../../components/ProgressButton";
import { useAssetUploader } from "./useAssetUploader";
import { AssetErrorList } from "./AssetErrorList";
import { AssetFilePickers, AssetFiles } from "./AssetFilePickers";

export const AssetUploader = memo(function () {
  const [showCompletedMessage, setShowCompletedMessage] =
    useState<boolean>(false);
  const [files, setFiles] = useState<AssetFiles>({});
  const uploader = useAssetUploader();
  const isReadyToUpload = !!(files.mapInfo || files.itemInfo || files.data);

  async function uploadFiles() {
    setShowCompletedMessage(false);
    try {
      if (isReadyToUpload) {
        await uploader.upload(files.mapInfo, files.itemInfo, files.data);
      }
    } finally {
      setFiles({});
      setShowCompletedMessage(true);
    }
  }

  useBlockNavigation(
    uploader.isPending,
    "Data is still being uploaded. If you leave this page, data may be lost."
  );

  return (
    <>
      <AssetFilePickers
        files={files}
        setFiles={setFiles}
        isPending={uploader.isPending}
      />

      <Tooltip
        placement="top"
        title={isReadyToUpload ? "" : "Please select all files"}
      >
        <Box sx={{ margin: "0 auto", marginBottom: 2 }}>
          <ProgressButton
            variant="contained"
            disabled={!isReadyToUpload}
            isLoading={uploader.isPending}
            onClick={uploadFiles}
          >
            Upload
          </ProgressButton>
        </Box>
      </Tooltip>

      {showCompletedMessage && (
        <Typography
          color={uploader.errors.length ? "orange" : "green"}
          sx={{ textAlign: "center", marginBottom: 2 }}
        >
          {uploader.errors.length
            ? "Upload completed with errors"
            : "Upload completed"}
        </Typography>
      )}

      {uploader.isPending && (
        <LinearProgress
          variant="determinate"
          value={uploader.progress * 100}
          sx={{ width: "50%", margin: "0 auto", marginBottom: 2 }}
        />
      )}

      {uploader.isPending && (
        <Typography
          sx={{
            margin: "0 auto",
            marginBottom: 2,
            whiteSpace: "pre-wrap",
            textAlign: "center",
          }}
        >
          {uploader.currentActivities.join("\n")}
        </Typography>
      )}

      {!!uploader.errors?.length && <AssetErrorList errors={uploader.errors} />}
    </>
  );
});
