import { LinearProgress, Typography } from "@mui/material";
import { useState } from "react";
import { flatten } from "lodash";
import { Header } from "../layout/Header";

import { FileUploader } from "../components/FileUploader";
import { GRF } from "../../lib/grf/types/GRF";
import { readFileStream } from "../../lib/grf/readFileStream";
import { usePromiseTracker } from "../hooks/usePromiseTracker";
import { SPR } from "../../lib/grf/types/SPR";
import { canvasToBlob, imageDataToCanvas } from "../../lib/imageUtils";
import { BlobImage } from "../components/BlobImage";
import { defined } from "../../lib/defined";

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

          const grfObjects = await tracker.track(
            "Initializing GRF loaders",
            grfFiles.map((file) => () => new GRF(readFileStream, file).load())
          );

          const sprFilesFromGRFs = flatten(
            await Promise.all(
              grfObjects.map((grf) => {
                const sprFilePaths = Array.from(grf.files.keys()).filter(
                  (name) => name.endsWith(".spr")
                  //(name) => /^data\\sprite\\npc\\.*\.spr$/.test(name)
                );
                return tracker.track(
                  "Unpacking SPR files",
                  sprFilePaths.map(
                    (path) => () =>
                      grf
                        .getFile(path)
                        .then((file) =>
                          file.data !== undefined
                            ? new File([file.data], file.name)
                            : undefined
                        )
                  )
                );
              })
            )
          );

          sprFiles.push(...defined(sprFilesFromGRFs));

          const sprObjects = await tracker.track(
            "Parsing SPR objects",
            sprFiles.map((file) => () => new SPR(readFileStream, file).load())
          );

          const sprites = await tracker.track(
            "Converting SPR objects to images",
            sprObjects.map((file) => () => sprToImage(file))
          );

          setSprites(sprites);
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

      <div>
        {sprites.map((sprite, index) => (
          <BlobImage key={index} src={sprite} />
        ))}
      </div>
    </>
  );
}

async function sprToImage({ frames: [frame] }: SPR) {
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
