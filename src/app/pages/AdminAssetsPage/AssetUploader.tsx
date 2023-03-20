import { memo, useState } from "react";
import { LinearProgress, Typography } from "@mui/material";
import { useBlockNavigation } from "../../../lib/hooks/useBlockNavigation";
import { ProgressButton } from "../../components/ProgressButton";
import {
  AssetSourceFiles,
  AssetTypeId,
  useAssetUploader,
} from "./useAssetUploader";
import { AssetErrorList } from "./AssetErrorList";
import { NewUploadDialog } from "./NewUploadDialog";

export const AssetUploader = memo(function () {
  const [isNewUploadDialogVisible, setNewUploadDialogVisible] = useState(false);
  const [showCompletedMessage, setShowCompletedMessage] =
    useState<boolean>(false);
  const uploader = useAssetUploader();

  async function uploadFiles(files: AssetSourceFiles, types: AssetTypeId[]) {
    setShowCompletedMessage(false);
    try {
      await uploader.upload(files, types);
    } finally {
      setShowCompletedMessage(true);
    }
  }

  useBlockNavigation(
    uploader.isPending,
    "Data is still being uploaded. If you leave this page, data may be lost."
  );

  return (
    <>
      <NewUploadDialog
        open={isNewUploadDialogVisible}
        onConfirm={uploadFiles}
        onClose={() => setNewUploadDialogVisible(false)}
      />

      <ProgressButton
        sx={{ mb: 2 }}
        variant="contained"
        isLoading={uploader.isPending}
        onClick={() => setNewUploadDialogVisible(true)}
      >
        Upload new assets
      </ProgressButton>

      {showCompletedMessage && (
        <Typography
          color={uploader.errors.length ? "orange" : "green"}
          sx={{ mb: 2 }}
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
          sx={{ width: "100%", mb: 2 }}
        />
      )}

      {uploader.isPending && (
        <Typography
          sx={{
            mb: 2,
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
