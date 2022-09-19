import { ComponentProps } from "react";
import { styled, Tooltip } from "@mui/material";
import { BrokenImage } from "@mui/icons-material";
import { useImage } from "../../lib/hooks/useImage";

export function ImageWithFallback({
  src,
  alt,
  ...props
}: Pick<
  ComponentProps<typeof Root>,
  "src" | "alt" | "style" | "sx" | "className"
>) {
  const image = useImage(src);
  if (image.isReady) {
    return <Root src={image.dataUrl} alt={alt} {...props} />;
  }
  return (
    <Tooltip title={image.isBroken ? "Broken image" : "Missing image"}>
      <Fallback {...props} />
    </Tooltip>
  );
}

const Root = styled("img")``;
const Fallback = styled(BrokenImage)``;
