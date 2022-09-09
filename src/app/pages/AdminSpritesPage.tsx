import { LinearProgress, Typography } from "@mui/material";
import { useState } from "react";
import Bottleneck from "bottleneck";
import { Header } from "../layout/Header";

import { FileUploader } from "../components/FileUploader";
import { GRF } from "../../lib/grf/types/GRF";
import { readFileStream } from "../../lib/grf/readFileStream";
import { usePromiseTracker } from "../hooks/usePromiseTracker";
import { SPR } from "../../lib/grf/types/SPR";
import { canvasToBlob, imageDataToCanvas } from "../../lib/imageUtils";
import { BlobImage } from "../components/BlobImage";

export default function AdminSpritesPage() {
  const [sprites, setSprites] = useState<Blob[]>([]);
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
          setSprites([]);

          const grfFiles = files.filter((file) => file.name.endsWith(".grf"));
          const sprFiles = files.filter((file) => file.name.endsWith(".spr"));

          const grfObjects = await tracker.trackAll(
            grfFiles.map((file) => new GRF(readFileStream, file).load()),
            "Initializing GRF loaders"
          );

          sprites.push(
            ...(await tracker.trackOne(
              loadSpritesFromGRFs(grfObjects),
              "Loading sprites"
            ))
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
          {tracker.tasks.join(", ")}
        </Typography>
      )}

      <div>
        {sprites.map((sprite, index) => (
          <BlobImage key={index} src={sprite} />
        ))}
      </div>
    </>
  );
}

async function loadSpritesFromGRFs(grfs: GRF[]) {
  const sprites: Blob[] = [];
  const limiter = new Bottleneck({ maxConcurrent: 200 });
  grfs.forEach((grf) =>
    Array.from(grf.files.keys())
      .filter((path) => path.endsWith(".spr"))
      .forEach((path) =>
        limiter.schedule(async () => {
          console.log("Loading", path);
          const grfFile = await grf.getFile(path);
          if (grfFile.data !== undefined) {
            const sprFile = new File([grfFile.data], grfFile.name);
            sprites.push(await loadSprite(sprFile));
          }
        })
      )
  );
  await new Promise<void>((resolve) => limiter.on("empty", () => resolve()));
  console.log("limiter done");
  return sprites;
}

async function loadSprite(sprFile: File) {
  const {
    frames: [frame],
  } = await new SPR(readFileStream, sprFile).load();
  return canvasToBlob(
    imageDataToCanvas(
      new ImageData(
        new Uint8ClampedArray(frame.data),
        frame.width,
        frame.height
      )
    )
  );
}
