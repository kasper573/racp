import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Header } from "../../layout/Header";
import { trpc } from "../../state/client";
import { routes } from "../../router";
import { Page } from "../../layout/Page";
import { AssetUploader } from "./AssetUploader";
import { LargeStringList } from "./LargeStringList";

export default function AdminAssetsPage() {
  const { data: mapImageCount = 0 } = trpc.map.countImages.useQuery();
  const { data: mapInfoCount = 0 } = trpc.map.countInfo.useQuery();
  const { data: mapBoundsCount = 0 } = trpc.map.countBounds.useQuery();
  const { data: missingMapData } = trpc.map.missingData.useQuery();
  const { data: itemInfoCount = 0 } = trpc.item.countInfo.useQuery();
  const { data: itemImageCount = 0 } = trpc.item.countImages.useQuery();
  const { data: missingMonsterImages = [] } =
    trpc.monster.missingImages.useQuery();
  const { data: missingItemImages = [] } = trpc.item.missingImages.useQuery();

  return (
    <Page>
      <Header />
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

      <AssetUploader />

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
              link={(id) => routes.monster.view({ id })}
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
              link={(id) => routes.item.view({ id })}
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
              link={(id) => routes.map.view({ id })}
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
              link={(id) => routes.map.view({ id })}
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
    </Page>
  );
}
