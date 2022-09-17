import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Fragment, useState } from "react";
import { Header } from "../layout/Header";

import { ErrorMessage } from "../components/ErrorMessage";
import {
  useCountItemImagesQuery,
  useCountItemInfoQuery,
  useCountMapBoundsQuery,
  useCountMapImagesQuery,
  useCountMapInfoQuery,
  useGetItemsMissingImagesQuery,
  useGetMissingMapDataQuery,
  useGetMonstersMissingImagesQuery,
} from "../state/client";
import { FileUploader } from "../components/FileUploader";
import {
  UploaderFileName,
  uploaderFilesRequired,
  useAssetUploader,
} from "../hooks/useAssetUploader";
import { useBlockNavigation } from "../../lib/useBlockNavigation";
import { ProgressButton } from "../components/ProgressButton";
import { defined } from "../../lib/defined";
import { typedKeys } from "../../lib/typedKeys";
import { Link, LinkTo } from "../components/Link";
import { router } from "../router";

export default function AdminAssetsPage() {
  const [message, setMessage] = useState<string>();
  const [files, setFiles] = useState<Partial<Record<UploaderFileName, File>>>(
    {}
  );
  const { data: mapImageCount = 0 } = useCountMapImagesQuery();
  const { data: mapInfoCount = 0 } = useCountMapInfoQuery();
  const { data: mapBoundsCount = 0 } = useCountMapBoundsQuery();
  const { data: missingMapData } = useGetMissingMapDataQuery();
  const { data: itemInfoCount = 0 } = useCountItemInfoQuery();
  const { data: itemImageCount = 0 } = useCountItemImagesQuery();
  const { data: missingMonsterImages = [] } =
    useGetMonstersMissingImagesQuery();
  const { data: missingItemImages = [] } = useGetItemsMissingImagesQuery();

  const uploader = useAssetUploader();
  const isReadyToUpload = !!(files.mapInfo && files.itemInfo && files.data);

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
      <Header>Assets</Header>
      <Typography paragraph>
        This page is for uploading assets required to properly display items,
        monsters, maps, etc. <br />
        This is a necessary step because rAthena does not provide these as asset
        files only reside in the game client.
      </Typography>

      <Typography paragraph>
        - Map database currently contain {mapInfoCount} info entries,{" "}
        {mapImageCount} images and {mapBoundsCount} bounds.
        <br />- Item database currently contain {itemInfoCount} item info
        entries and {itemImageCount} images.
      </Typography>

      <Stack
        direction="row"
        spacing={2}
        sx={{ margin: "0 auto", marginBottom: 2 }}
      >
        {typedKeys(uploaderFilesRequired).map((name) => {
          const ext = uploaderFilesRequired[name];
          return (
            <FileUploader
              name={name}
              key={name}
              value={defined([files?.[name]])}
              accept={ext}
              buttonText={`Select ${name}${ext}`}
              disabled={uploader.isPending}
              onChange={([file]) =>
                setFiles((current) =>
                  file ? { ...current, [name]: file } : current
                )
              }
            />
          );
        })}
      </Stack>

      <Tooltip title={isReadyToUpload ? "" : "Please select all files"}>
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

      {uploader.errors.length > 0 && (
        <Accordion sx={{ [`&&`]: { marginTop: 0, marginBottom: 2 } }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>
              Errors during upload ({uploader.errors.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {uploader.errors.map((error, index) => (
              <ErrorMessage key={`error${index}`} error={error} />
            ))}
          </AccordionDetails>
        </Accordion>
      )}

      <Typography paragraph>Any missing data will be listed below.</Typography>

      {missingMonsterImages.length > 0 && (
        <Accordion sx={{ [`&&`]: { marginTop: 0 } }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>
              Missing monster images ({missingMonsterImages.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <LargeStringList
              values={missingMonsterImages}
              link={(id) => router.monster().view({ id })}
            />
          </AccordionDetails>
        </Accordion>
      )}

      {missingItemImages.length > 0 && (
        <Accordion sx={{ [`&&`]: { marginTop: 0 } }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>
              Missing item images ({missingItemImages.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <LargeStringList
              values={missingItemImages}
              link={(id) => router.item().view({ id })}
            />
          </AccordionDetails>
        </Accordion>
      )}

      {missingMapData && missingMapData.images.length > 0 && (
        <Accordion sx={{ [`&&`]: { marginTop: 0 } }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>
              Missing map images ({missingMapData.images.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <LargeStringList
              values={missingMapData.images}
              link={(id) => router.map().view({ id })}
            />
          </AccordionDetails>
        </Accordion>
      )}

      {missingMapData && missingMapData.bounds.length > 0 && (
        <Accordion sx={{ [`&&`]: { marginTop: 0 } }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>
              Missing map bounds ({missingMapData.bounds.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <LargeStringList
              values={missingMapData.bounds}
              link={(id) => router.map().view({ id })}
            />
          </AccordionDetails>
        </Accordion>
      )}

      <Typography variant="caption">
        <br />
        Missing data is possible since rAthena and your RO client could have
        mismatching data.
        <br />
        If it's missing here, it's likely missing in the game too (Not always.
        Some data is missing due to RACP not having a perfect GRF importer)
        <br />
        You can resolve this issue by updating your client files and then
        re-uploading them to RACP.
      </Typography>
    </>
  );
}

function LargeStringList<T>({
  values,
  max = 100,
  link,
}: {
  values: T[];
  link?: (value: T) => LinkTo;
  max?: number;
}) {
  return (
    <Typography sx={{ maxHeight: 300, overflowY: "auto" }}>
      {values.slice(0, max).map((value, index) => (
        <Fragment key={index}>
          {index > 0 && ", "}
          {link ? <Link to={link(value)}>{`${value}`}</Link> : `${value}`}
        </Fragment>
      ))}
      {values.length > 100 && ` (and ${values.length - max} more)`}
    </Typography>
  );
}
