import * as zod from "zod";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  LinearProgress,
  Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Header } from "../layout/Header";

import { FileUploader } from "../components/FileUploader";
import { GRF } from "../../lib/grf/types/GRF";
import { readFileStream } from "../../lib/grf/readFileStream";
import { usePromiseTracker } from "../hooks/usePromiseTracker";
import { SPR } from "../../lib/grf/types/SPR";
import {
  useDecompileLuaTableFilesMutation,
  useGetMonstersMissingImagesQuery,
  useUploadMonsterImagesMutation,
} from "../state/client";
import { RpcFile, toRpcFile } from "../../lib/rpc/RpcFile";
import { canvasToBlob, imageDataToCanvas } from "../../lib/imageUtils";
import { MonsterGrid } from "../grids/MonsterGrid";
import { ErrorMessage } from "../components/ErrorMessage";
import { Monster } from "../../api/services/monster/types";
import { ReducedLuaTables } from "../../api/services/util/types";

export default function AdminSpritesPage() {
  const { data: idsOfMonstersMissingImages = [] } =
    useGetMonstersMissingImagesQuery();
  const [uploadMonsterImages] = useUploadMonsterImagesMutation();
  const [decompileLuaTables] = useDecompileLuaTableFilesMutation();
  const tracker = usePromiseTracker();
  return (
    <>
      <Header>Sprites</Header>
      <FileUploader
        value={[]}
        sx={{ maxWidth: 380, margin: "0 auto" }}
        isLoading={tracker.isPending}
        accept={[".grf"]}
        onChange={async (files) => {
          tracker.reset();

          const grfFile = files.find((file) => file.name.endsWith(".grf"));
          if (!grfFile) {
            return;
          }

          const [grfObject] = await tracker.track("Initializing GRF loader", [
            () => new GRF(readFileStream, grfFile).load(),
          ]);

          const [monsterSpriteInfo = []] = await tracker.track(
            "Running lua scripts to determine monster sprite names",
            [
              () =>
                determineMonsterSpriteInfo(grfObject, (files) =>
                  decompileLuaTables(files).unwrap()
                ),
            ]
          );

          console.log(monsterSpriteInfo);

          const monsterImages = await tracker.track(
            "Unpacking monster images from GRFs",
            monsterSpriteInfo.map(({ id, spritePath }) => async () => {
              const file = await grfObject.getFile(spritePath);
              const spr = await new SPR(readFileStream, file, `${id}`).load();
              return toRpcFile(await spriteToTextureFile(spr));
            })
          );

          tracker.track("Uploading monster images", [
            () => uploadMonsterImages(monsterImages),
          ]);
        }}
        maxFiles={1}
        title={
          "Select your data.grf file to update the sprite database. This will replace the existing entries."
        }
      />
      {tracker.isPending && (
        <LinearProgress
          variant="determinate"
          value={tracker.progress * 100}
          sx={{ width: "50%", margin: "0 auto", marginBottom: 2 }}
        />
      )}

      {tracker.tasks.length > 0 && (
        <Typography sx={{ margin: "0 auto", marginBottom: 2 }}>
          {tracker.tasks.map((task) => `${task.name}`).join(", ")}
        </Typography>
      )}

      {tracker.errors.length > 0 && (
        <Accordion sx={{ [`&&`]: { marginTop: 0 } }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>
              {tracker.errors.length} errors during upload:
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {tracker.errors.map((error, index) => (
              <ErrorMessage key={`error${index}`} error={error} />
            ))}
          </AccordionDetails>
        </Accordion>
      )}

      {idsOfMonstersMissingImages.length > 0 && (
        <Accordion sx={{ [`&&`]: { marginTop: 0 } }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>
              {idsOfMonstersMissingImages.length} missing monster images:
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MonsterGrid
              sx={{ height: "50vh" }}
              filter={{
                Id: {
                  value: idsOfMonstersMissingImages,
                  matcher: "oneOfN",
                },
              }}
            />
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
}

interface MonsterSpriteInfoEntry {
  id: Monster["Id"];
  spritePath: string;
}

async function determineMonsterSpriteInfo(
  grf: GRF,
  decompileLuaTables: (files: RpcFile[]) => Promise<ReducedLuaTables>
): Promise<MonsterSpriteInfoEntry[]> {
  const identityFile = await grf
    .getFile("data\\lua files\\datainfo\\npcidentity.lub")
    .then(toRpcFile);

  const nameFile = await grf
    .getFile("data\\lua files\\datainfo\\jobname.lub")
    .then(toRpcFile);

  const table = await decompileLuaTables([identityFile, nameFile]);

  const monsterIdToSpriteName = zod.record(zod.string()).parse(table);

  const allFilePaths = Array.from(grf.files.keys());

  const infoEntries = Object.entries(monsterIdToSpriteName).map(
    ([monsterId, spriteName]) => ({
      id: parseInt(monsterId, 10),
      spritePath: allFilePaths.find((path) =>
        path.endsWith(`\\${spriteName.toLowerCase()}.spr`)
      ),
    })
  );

  return infoEntries.filter(
    (entry): entry is MonsterSpriteInfoEntry => entry.spritePath !== undefined
  );
}

async function spriteToTextureFile({ frames: [frame], name }: SPR) {
  const blob = await canvasToBlob(
    imageDataToCanvas(
      new ImageData(
        new Uint8ClampedArray(frame.data),
        frame.width,
        frame.height
      )
    )
  );
  return new File([blob], name);
}
