import { Stack, styled } from "@mui/material";
import { ReactNode } from "react";
import { ImageWithFallback } from "./ImageWithFallback";

export interface IconWithLabelProps {
  src?: string;
  alt: string;
  children: ReactNode;
}

export function IconWithLabel({ src, alt, children }: IconWithLabelProps) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <IconContainer>
        <Icon src={src} alt={alt} />
      </IconContainer>
      <span>{children}</span>
    </Stack>
  );
}

const IconContainer = styled("div")`
  height: 20px;
  width: 20px;
  position: relative;
`;

const Icon = styled(ImageWithFallback)`
  width: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
