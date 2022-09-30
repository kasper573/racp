import { memo, useState } from "react";
import { Box, LinearProgress, Tooltip, Typography } from "@mui/material";
import { useBlockNavigation } from "../../../lib/hooks/useBlockNavigation";
import {
  AsyncProgressButton,
  ProgressButton,
} from "../../components/ProgressButton";
import { trpc } from "../../state/client";
import { GRF } from "../../../lib/grf/types/GRF";
import {
  determineMonsterSpriteNames,
  useAssetUploader,
} from "./useAssetUploader";
import { AssetErrorList } from "./AssetErrorList";
import { AssetFilePickers, AssetFiles } from "./AssetFilePickers";

export const AssetUploader = memo(function () {
  const [message, setMessage] = useState<string>();
  const [files, setFiles] = useState<AssetFiles>({});
  const uploader = useAssetUploader();
  const isReadyToUpload = !!(files.mapInfo && files.itemInfo && files.data);

  const { mutateAsync: decompileLuaTables } =
    trpc.util.decompileLuaTableFiles.useMutation();

  async function tryLua() {
    if (!files.data) {
      return;
    }
    console.log("Waiting for response from server");
    try {
      const grf = await GRF.load(files.data);
      const monsterSpriteNames = await determineMonsterSpriteNames(
        grf,
        decompileLuaTables
      );
      console.log("Response", monsterSpriteNames);
    } catch (e) {
      console.log("Error", e);
    }
  }

  async function uploadFiles() {
    setMessage(undefined);
    try {
      if (isReadyToUpload) {
        await uploader.upload(files.mapInfo!, files.itemInfo!, files.data!);
      }
    } finally {
      setFiles({});
      setMessage("Upload complete");
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

      <Box sx={{ margin: "0 auto", marginBottom: 2 }}>
        <Tooltip title={isReadyToUpload ? "" : "Please select all files"}>
          <span>
            <ProgressButton
              variant="contained"
              disabled={!isReadyToUpload}
              isLoading={uploader.isPending}
              onClick={uploadFiles}
            >
              Upload
            </ProgressButton>
          </span>
        </Tooltip>
        <AsyncProgressButton disabled={!files.data} onClick={tryLua}>
          Test lua decompiler
        </AsyncProgressButton>
      </Box>

      {message && (
        <Typography color="green" sx={{ textAlign: "center", marginBottom: 2 }}>
          {message}
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
