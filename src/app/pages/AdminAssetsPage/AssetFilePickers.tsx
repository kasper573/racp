import { Dispatch, memo, SetStateAction } from "react";
import { Stack } from "@mui/material";
import { typedKeys } from "../../../lib/std/typedKeys";
import { FilePicker } from "../../components/FilePicker";
import { defined } from "../../../lib/std/defined";
import { UploaderFileName, uploaderFilesRequired } from "./useAssetUploader";

export type AssetFiles = Partial<Record<UploaderFileName, File>>;
export const AssetFilePickers = memo(function ({
  files,
  setFiles,
  isPending,
}: {
  files?: AssetFiles;
  setFiles: Dispatch<SetStateAction<AssetFiles>>;
  isPending: boolean;
}) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ margin: "0 auto", marginBottom: 2 }}
    >
      {typedKeys(uploaderFilesRequired).map((name) => {
        const ext = uploaderFilesRequired[name];
        return (
          <FilePicker
            name={name}
            key={name}
            value={defined([files?.[name]])}
            accept={ext}
            buttonText={`Select ${name}${ext}`}
            disabled={isPending}
            onChange={([file]) =>
              setFiles((current) =>
                file ? { ...current, [name]: file } : current
              )
            }
          />
        );
      })}
    </Stack>
  );
});
