import { Box, Stack, styled, Tooltip } from "@mui/material";
import { ComponentProps } from "react";
import { ImageWithFallback } from "./ImageWithFallback";

export interface IconWithLabelProps extends ComponentProps<typeof Stack> {
  src?: string;
  alt: string;
  showLabelAsTooltip?: boolean;
}

export function IconWithLabel({
  src,
  alt,
  children,
  showLabelAsTooltip = false,
  ...props
}: IconWithLabelProps) {
  let icon = (
    <IconDocker>
      <Icon src={src} alt={alt} />
    </IconDocker>
  );
  if (showLabelAsTooltip) {
    icon = (
      <Tooltip placement="top" title={children}>
        {icon}
      </Tooltip>
    );
    children = "";
  }
  return (
    <Root {...props}>
      {icon}
      <Label>{children}</Label>
    </Root>
  );
}

const Root = styled(Box)`
  display: inline-flex;
  position: relative;
`;

const iconSize = "1.25em";

const Icon = styled(ImageWithFallback)`
  font-size: ${iconSize};
  width: ${iconSize};
`;

const IconDocker = styled("div")`
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
`;

const Label = styled(Box)`
  padding-left: calc(${iconSize} + 12px);
  text-overflow: ellipsis;
  overflow: hidden;
`;
