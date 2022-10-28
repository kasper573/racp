import { Box, Stack, styled } from "@mui/material";
import { ComponentProps } from "react";
import { ImageWithFallback } from "./ImageWithFallback";

export interface IconWithLabelProps extends ComponentProps<typeof Stack> {
  src?: string;
  alt: string;
}

export function IconWithLabel({
  src,
  alt,
  children,
  ...props
}: IconWithLabelProps) {
  return (
    <Root {...props}>
      <Icon src={src} alt={alt} />
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
