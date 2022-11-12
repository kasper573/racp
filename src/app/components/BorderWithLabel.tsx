import { Box, InputLabel, styled } from "@mui/material";
import { ComponentProps, ReactNode } from "react";

export function BorderWithLabel({
  children,
  label,
  ...props
}: ComponentProps<typeof Border> & { label?: ReactNode }) {
  return (
    <Border {...props}>
      {label && <Label shrink>{label}</Label>}
      {children}
    </Border>
  );
}

const Border = styled(Box)`
  border: ${({ theme }) => `1px solid ${theme.palette.divider}`};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  padding: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

const Label = styled(InputLabel)`
  position: absolute;
  top: -8px;
  left: 8px;
  padding: 0 8px;
  background: ${({ theme }) => theme.palette.background.default};
  display: inline-block;
`;
