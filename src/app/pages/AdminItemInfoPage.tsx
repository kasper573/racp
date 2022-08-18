import { Typography } from "@mui/material";
import { useState } from "react";
import { Header } from "../layout/Header";
import {
  useCountItemInfoQuery,
  useUpdateItemInfoMutation,
} from "../state/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { FileUploader } from "../components/FileUploader";

export default function AdminItemInfoPage() {
  const { data: itemCount = 0 } = useCountItemInfoQuery();
  const [update, { error: netError, isLoading }] = useUpdateItemInfoMutation();
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
        onChange={async ([file]) => {
          setUploadResult(undefined);
          if (file) {
            const data = await file.text();
            const res = await update(data);
            setUploadResult("data" in res && res.data);
          }
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
