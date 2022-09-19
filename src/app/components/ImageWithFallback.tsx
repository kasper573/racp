import { ComponentProps } from "react";
import { styled, Tooltip } from "@mui/material";
import { BrokenImage, HideImage } from "@mui/icons-material";
import { useImage } from "../../lib/hooks/useImage";

export function ImageWithFallback({
  src,
  alt,
  ...props
}: Pick<
  ComponentProps<typeof Image>,
  "src" | "alt" | "style" | "sx" | "className"
>) {
  const image = useImage(src);
  if (image.isReady) {
    return <Image src={src} alt={alt} {...props} />;
  }
  if (image.isBroken) {
    return (
      <Tooltip title="Broken image">
        <BrokenFallback {...props} />
      </Tooltip>
    );
  }
  return (
    <Tooltip title="Missing image">
      <MissingFallback {...props} />
    </Tooltip>
  );
}

const Image = styled("img")``;
const BrokenFallback = styled(BrokenImage)``;
const MissingFallback = styled(HideImage)``;
