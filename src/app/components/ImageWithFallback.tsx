import { ComponentProps } from "react";
import { styled, Tooltip } from "@mui/material";
import { BrokenImage } from "@mui/icons-material";
import { useImage } from "../../lib/useImage";

export function ImageWithFallback({
  src,
  alt,
  ...props
}: Pick<
  ComponentProps<typeof Root>,
  "src" | "alt" | "style" | "sx" | "className"
>) {
  const { isBroken } = useImage(src);
  return src && !isBroken ? (
    <Root src={src} alt={alt} {...props} />
  ) : (
    <Tooltip title="Broken image">
      <Fallback {...props} />
    </Tooltip>
  );
}

const Root = styled("img")``;
const Fallback = styled(BrokenImage)``;
