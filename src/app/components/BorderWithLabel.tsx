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
  padding: 7px 13px;
  position: relative;
`;

const Label = styled(InputLabel)`
  position: absolute;
  top: -9px;
  left: 7px;
  padding: 0 8px;
  display: inline-block;
`;
