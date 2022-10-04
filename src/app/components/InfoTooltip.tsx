import { styled, Tooltip, Typography } from "@mui/material";
import { InfoRounded } from "@mui/icons-material";
import { ComponentProps } from "react";

export interface TooltipTextProps extends ComponentProps<typeof Typography> {
  title: string;
}

export function InfoTooltip({ children, title, ...props }: TooltipTextProps) {
  return (
    <Tooltip title={title}>
      <Typography
        component="span"
        style={{ display: "inline-flex" }}
        color="text.disabled"
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
