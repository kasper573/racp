import { ComponentProps, useEffect, useState } from "react";
import { styled, Tooltip } from "@mui/material";
import { BrokenImage, HideImage } from "@mui/icons-material";

export function ImageWithFallback({
  src,
  alt,
  ...props
}: Pick<
  ComponentProps<typeof Image>,
  "src" | "alt" | "style" | "sx" | "className" | "width" | "height"
>) {
  const [state, setState] = useState<"pending" | "loaded" | "error">("pending");

  useEffect(() => setState("pending"), [src]);

  if (!src) {
    return (
      <Tooltip title="Missing image">
        <MissingFallback {...props} />
      </Tooltip>
    );
  }
  if (state === "error") {
    return (
      <Tooltip title="Broken image">
        <BrokenFallback {...props} />
      </Tooltip>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      onLoad={() => setState("loaded")}
      onError={() => setState("error")}
      {...props}
    />
  );
}

const Image = styled("img")``;
const BrokenFallback = styled(BrokenImage)``;
const MissingFallback = styled(HideImage)``;
