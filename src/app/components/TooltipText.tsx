import { styled, Tooltip, Typography } from "@mui/material";
import { InfoRounded } from "@mui/icons-material";
import { ComponentProps } from "react";

export interface TooltipTextProps extends ComponentProps<typeof Typography> {
  tooltip: string;
}

export function TooltipText({ children, tooltip, ...props }: TooltipTextProps) {
  return (
    <Tooltip title={tooltip}>
      <Typography
        component="span"
        style={{ display: "inline-flex" }}
        {...props}
      >
        {children} <SmallInfo />
      </Typography>
    </Tooltip>
  );
}

const SmallInfo = styled(InfoRounded)`
  width: 16px;
  height: 16px;
`;
