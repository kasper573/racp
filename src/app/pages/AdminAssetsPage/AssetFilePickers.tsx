import { ComponentProps, Dispatch, SetStateAction } from "react";
import { Stack } from "@mui/material";
import { FilePicker } from "../../components/FilePicker";
import { defined } from "../../../lib/std/defined";
import {
  AssetSourceFiles,
  AssetSourceFile,
  sourceFileExtensions,
  sourceFileList,
} from "./useAssetUploader";

export function AssetFilePickers({
  files,
  setFiles,
  options = sourceFileList,
  ...props
}: {
  files?: AssetSourceFiles;
  setFiles: Dispatch<SetStateAction<AssetSourceFiles>>;
  options?: AssetSourceFile[];
} & ComponentProps<typeof Stack>) {
  return (
    <Stack direction="row" spacing={2} {...props}>
      {options.map((name) => {
        const ext = sourceFileExtensions[name];
        return (
          <FilePicker
            direction="column"
            name={name}
            key={name}
            value={defined([files?.[name]])}
            accept={ext}
            buttonText={`Select ${name}${ext}`}
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
}
