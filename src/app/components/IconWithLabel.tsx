import { Box, Stack, styled, Tooltip } from "@mui/material";
import { ComponentProps, ReactNode } from "react";
import { ImageWithFallback } from "./ImageWithFallback";

export interface IconWithLabelProps extends ComponentProps<typeof Stack> {
  src?: string;
  alt: string;
  iconTooltip?: ReactNode;
}

export function IconWithLabel({
  src,
  alt,
  children,
  iconTooltip,
  ...props
}: IconWithLabelProps) {
  let icon = (
    <IconDocker>
      <Icon src={src} alt={alt} />
    </IconDocker>
  );
  if (iconTooltip !== undefined) {
    icon = (
      <Tooltip placement="top" title={iconTooltip}>
        {icon}
      </Tooltip>
    );
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
