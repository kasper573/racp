import { LinearProgress, Typography } from "@mui/material";
import { ImgHTMLAttributes, useEffect, useState } from "react";
import { flatten } from "lodash";
import { Header } from "../layout/Header";

import { FileUploader } from "../components/FileUploader";
import { GRF } from "../../lib/grf/types/GRF";
import { defined } from "../../lib/defined";
import { readFileStream } from "../../lib/grf/readFileStream";
import { usePromiseTracker } from "../hooks/usePromiseTracker";
import { RGBABitmap, SPR } from "../../lib/grf/types/SPR";
import { canvasToBlob, imageDataToCanvas } from "../../lib/imageUtils";

export default function AdminSpritesPage() {
  const [sprObjects, setSprObjects] = useState<SPR[]>([]);
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
          setSprObjects([]);

          const grfFiles = files.filter((file) => file.name.endsWith(".grf"));
          const sprFiles = files.filter((file) => file.name.endsWith(".spr"));

          const grfObjects = await tracker.trackAll(
            grfFiles.map((file) => new GRF(readFileStream, file).load()),
            "Initializing GRF loaders"
          );

          sprFiles.push(
            ...flatten(
              await tracker.trackAll(
                flatten(grfObjects.map(unpackSPRFiles)),
                "Unpacking SPR files"
              )
            )
          );

          const sprObjects = await tracker.trackAll(
            sprFiles.map((file) => new SPR(readFileStream, file).load()),
            "Parsing SPR objects"
          );

          setSprObjects(sprObjects);
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
        {sprObjects.map((spr, index) => (
          <SPRView key={index} spr={spr} />
        ))}
      </div>
    </>
  );
}

function frameToImage(frame: RGBABitmap) {
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

function SPRView({
  spr: {
    frames: [frame],
  },
  ...props
}: { spr: SPR } & Omit<ImgHTMLAttributes<HTMLImageElement>, "src">) {
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    frameToImage(frame).then((blob) => {
      const url = URL.createObjectURL(blob);
      setSrc(url);
      return () => URL.revokeObjectURL(url);
    });
  }, [frame]);

  return <img src={src} width={frame.width} height={frame.height} {...props} />;
}

async function unpackSPRFiles<Stream>(grf: GRF<Stream>) {
  const files = await Promise.all(
    Array.from(grf.files.keys())
      .filter((file) => file.endsWith(".spr"))
      .slice(0, 2000)
      .map(async (sprFilePath) => {
        const sprFile = await grf.getFile(sprFilePath);
        if (sprFile.data) {
          return new File([sprFile.data], sprFilePath, {
            type: "application/spr",
          });
        }
      })
  );
  return defined(files);
}
