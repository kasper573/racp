import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { AssetFilePickers } from "./AssetFilePickers";
import {
  AssetSourceFiles,
  AssetTypeId,
  assetTypeList,
  assetTypesToSourceFiles,
} from "./useAssetUploader";

export function NewUploadDialog({
  open,
  onConfirm,
  onClose,
}: {
  open: boolean;
  onConfirm: (files: AssetSourceFiles, types: AssetTypeId[]) => void;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<"typeSelect" | "fileSelect">("typeSelect");
  const [files, setFiles] = useState<AssetSourceFiles>({});
  const [types, setTypes] = useState(assetTypeList);
  const requiredFiles = useMemo(() => assetTypesToSourceFiles(types), [types]);
  const hasRequiredFiles = useMemo(
    () => requiredFiles.every((k) => files[k]),
    [files, requiredFiles]
  );

  const { content, buttons } = {
    typeSelect: {
      content: <TypeSelector {...{ types, setTypes }} />,
      buttons: (
        <>
          <Button onClick={close}>Cancel</Button>
          <Button onClick={() => setStage("fileSelect")}>Next</Button>
        </>
      ),
    },
    fileSelect: {
      content: (
        <>
          <Typography paragraph>
            Please provide the following RO client data files:
          </Typography>
          <AssetFilePickers
            files={files}
            setFiles={setFiles}
            options={requiredFiles}
          />
        </>
      ),
      buttons: (
        <>
          <Button onClick={() => setStage("typeSelect")}>Back</Button>
          <Button disabled={!hasRequiredFiles} onClick={startUpload}>
            Start upload
          </Button>
        </>
      ),
    },
  }[stage];

  function startUpload() {
    onConfirm(files, types);
    close();
  }

  function close() {
    setStage("typeSelect");
    setFiles({});
    onClose();
  }

  return (
    <Dialog open={open} onClose={close}>
      <DialogTitle>Upload new assets</DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>{buttons}</DialogActions>
    </Dialog>
  );
}

function TypeSelector({
  types,
  setTypes,
}: {
  types: AssetTypeId[];
  setTypes: (checked: AssetTypeId[]) => void;
}) {
  function toggleType(typeId: AssetTypeId, toggleTo: boolean) {
    setTypes(
      toggleTo ? [...types, typeId] : types.filter((id) => id !== typeId)
    );
  }
  return (
    <>
      <Typography>Which assets do you want to upload?</Typography>
      {assetTypeList.map((typeId) => (
        <FormControlLabel
          key={typeId}
          control={
            <Checkbox
              checked={types.includes(typeId)}
              onChange={(e) => toggleType(typeId, e.target.checked)}
            />
          }
          label={typeId}
        />
      ))}
    </>
  );
}
