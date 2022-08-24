import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  LinearProgress,
  Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Header } from "../layout/Header";

import { ErrorMessage } from "../components/ErrorMessage";
import {
  useCountMapBoundsQuery,
  useCountMapImagesQuery,
  useCountMapInfoQuery,
  useGetMissingMapDataQuery,
} from "../state/client";
import { FileUploader } from "../components/FileUploader";
import { LinkBase } from "../components/Link";
import { useMapFileUploader } from "../hooks/useMapFileUploader";
import { RGB } from "../../lib/cropSurroundingColors";

export default function AdminMapsPage() {
  const { data: mapImageCount = 0 } = useCountMapImagesQuery();
  const { data: mapInfoCount = 0 } = useCountMapInfoQuery();
  const { data: mapBoundsCount = 0 } = useCountMapBoundsQuery();
  const { data: missingMapData } = useGetMissingMapDataQuery();

  const uploader = useMapFileUploader({
    imageExtensions,
    cropColor,
  });

  return (
    <>
      <Header>Maps</Header>
      <Typography paragraph>
        Map database currently contain {mapInfoCount} info entries,{" "}
        {mapImageCount} images and {mapBoundsCount} bounds.
      </Typography>

      <FileUploader
        value={[]}
        sx={{ maxWidth: 380, margin: "0 auto" }}
        accept={[".grf", ".lub", ".gat", ...imageExtensions]}
        isLoading={uploader.isPending}
        onChange={uploader.upload}
        title={"Select or drop files here"}
      />

      <ErrorMessage
        sx={{ textAlign: "center", mt: 1 }}
        error={uploader.error}
      />

      {uploader.isPending && (
        <LinearProgress
          variant="determinate"
          value={uploader.progress * 100}
          sx={{ width: "50%", margin: "0 auto", marginBottom: 2 }}
        />
      )}

      {uploader.tasks.length > 0 && (
        <Typography sx={{ margin: "0 auto", marginBottom: 2 }}>
          {uploader.tasks.join(", ")}
        </Typography>
      )}

      {missingMapData && missingMapData.images.length > 0 && (
        <Accordion sx={{ [`&&`]: { marginTop: 0 } }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>
              {missingMapData.images.length} missing map images:
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography sx={{ maxHeight: 300, overflowY: "auto" }}>
              {missingMapData.images.join(", ")}
            </Typography>
          </AccordionDetails>
        </Accordion>
      )}

      {missingMapData && missingMapData.bounds.length > 0 && (
        <Accordion sx={{ [`&&`]: { marginTop: 0 } }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>
              {missingMapData.bounds.length} missing map bounds:
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography sx={{ maxHeight: 300, overflowY: "auto" }}>
              {missingMapData.bounds.join(", ")}
            </Typography>
          </AccordionDetails>
        </Accordion>
      )}

      <Typography variant="caption" sx={{ marginTop: 4, maxWidth: 600 }}>
        <strong>Instructions:</strong>
        <br />
        - Upload a mapInfo.lub file to update the map info database.
        <br />
        - Upload a data.grf file to update the database with all map images and
        bounds in the GRF file.
        <br /> - Upload an image file to manually update the map image database
        (using file name as map id).
        <br /> - Upload a .gat file to manually update the map bounds database
        (using file name as map id).
        <br /> - If any map data is missing, their map ids will be listed above
        (once you've uploaded map info).
        <br />
        <br />
        <strong>
          Why are manual image/.gat file uploads necessary when a GRF file
          upload is available?
        </strong>
        <br /> Sometimes GRF files won't contain all required data, or our
        browser based GRF reader might fail at extracting some entries. In this
        case you can produce the required files yourself and manually upload
        them above. It's highly recommended to use a{" "}
        <LinkBase
          href="https://www.google.com/search?q=grf+editor"
          target="_blank"
        >
          GRF Editor
        </LinkBase>{" "}
        to easily extract any data you need.
      </Typography>
    </>
  );
}

const imageExtensions = [".png", ".jpg", ".jpeg", ".bmp", ".tga"];
const cropColor: RGB = [255, 0, 255]; // magenta
