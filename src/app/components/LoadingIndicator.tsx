import { CircularProgress, LinearProgress, styled } from "@mui/material";
import { ComponentProps } from "react";

export const LoadingIndicator = ({
  variant = "circular",
  ...props
}: Omit<ComponentProps<typeof CircularProgress>, "variant"> & {
  variant?: "circular" | "linear";
}) => {
  const Indicator = variantComponents[variant];
  return (
    <Indicator
      {...props}
      aria-label="Loading"
      data-testid="loading-indicator"
    />
  );
};

const FullWidthLinearProgress = styled(LinearProgress)`
  width: 100%;
`;

const variantComponents = {
  circular: CircularProgress,
  linear: FullWidthLinearProgress,
};
