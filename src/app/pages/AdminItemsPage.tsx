import { Typography } from "@mui/material";
import { useState } from "react";
import { Header } from "../layout/Header";
import {
  useCountItemInfoQuery,
  useUploadItemInfoMutation,
} from "../state/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { FileUploader } from "../components/FileUploader";
import { toRpcFile } from "../../lib/rpc/RpcFile";

export default function AdminItemsPage() {
  const { data: itemCount = 0 } = useCountItemInfoQuery();
  const [update, { error: netError, isLoading }] = useUploadItemInfoMutation();
  const [uploadResult, setUploadResult] = useState<boolean>();
  const error =
    uploadResult === false
      ? { message: "The selected file could not be parsed as item info." }
      : netError;
  return (
    <>
      <Header>Items</Header>
      <Typography paragraph>
        Database currently contain {itemCount} item info entries.
      </Typography>
      <FileUploader
        value={[]}
        sx={{ maxWidth: 380, margin: "0 auto" }}
        isLoading={isLoading}
        accept=".lub"
        onChange={async (files) => {
          setUploadResult(undefined);
          const rpcFiles = await Promise.all(files.map(toRpcFile));
          const res = await update(rpcFiles);
          setUploadResult("data" in res && res.data);
        }}
        maxFiles={1}
        title={
          "Select your itemInfo.lub file to update the item info database. This will replace the existing entries."
        }
      />
      <ErrorMessage sx={{ textAlign: "center", mt: 1 }} error={error} />
    </>
  );
}
