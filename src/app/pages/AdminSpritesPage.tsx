import { LinearProgress, Typography } from "@mui/material";
import { flatten } from "lodash";
import { Header } from "../layout/Header";

import { FileUploader } from "../components/FileUploader";
import { GRF } from "../../lib/grf/types/GRF";
import { readFileStream } from "../../lib/grf/readFileStream";
import { usePromiseTracker } from "../hooks/usePromiseTracker";
import { SPR } from "../../lib/grf/types/SPR";
import { defined } from "../../lib/defined";
import { allResolved } from "../../lib/allResolved";
import { useUploadMonsterImagesMutation } from "../state/client";
import { toRpcFile } from "../../lib/rpc/RpcFile";
import { canvasToBlob, imageDataToCanvas } from "../../lib/imageUtils";

export default function AdminSpritesPage() {
  const [uploadMonsterImages] = useUploadMonsterImagesMutation();
  const tracker = usePromiseTracker();
  return (
    <>
      <Header>Sprites</Header>
      <FileUploader
        value={[]}
        sx={{ maxWidth: 380, margin: "0 auto" }}
        isLoading={tracker.isPending}
        accept={[".grf", ".spr"]}
        onChange={async (files) => {
          const grfFiles = files.filter((file) => file.name.endsWith(".grf"));
          const sprFiles = files.filter((file) => file.name.endsWith(".spr"));

          const grfObjects = await tracker.track(
            "Initializing GRF loaders",
            grfFiles.map((file) => () => new GRF(readFileStream, file).load())
          );

          const sprFilesFromGRFs = flatten(
            await allResolved(
              grfObjects.map((grf) =>
                tracker.track(
                  "Unpacking SPR files",
                  Array.from(grf.files.keys())
                    .filter(isSpriteFile)
                    .map((path) => () => grf.getFile(path))
                )
              )
            )
          );

          sprFiles.push(...defined(sprFilesFromGRFs));

          const sprObjects = await tracker.track(
            "Parsing SPR objects",
            sprFiles.map(
              (file) => () => new SPR(readFileStream, file, file.name).load()
            )
          );

          const sprites = await tracker.track(
            "Converting SPR objects to images",
            sprObjects.map((file) => () => spriteToFile(file).then(toRpcFile))
          );

          tracker.track(
            "Uploading images",
            sprites.map((file) => () => uploadMonsterImages([file]))
          );
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
          {tracker.tasks.map((task) => task.name).join(", ")}
        </Typography>
      )}
    </>
  );
}

async function spriteToFile({ frames: [frame], name }: SPR) {
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

const isSpriteFile = (path: string) =>
  /^data\\sprite\\npc\\.*\.spr$/.test(path) ||
  /^data\\sprite\\¸ó½ºÅÍ\\.*\.spr$/.test(path);
