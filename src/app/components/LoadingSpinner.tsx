import { CircularProgress, LinearProgress, styled } from "@mui/material";
import { ComponentProps } from "react";

export const LoadingSpinner = ({
  variant = "circular",
  ...props
}: Omit<ComponentProps<typeof CircularProgress>, "variant"> & {
  variant?: "circular" | "linear";
}) => {
  const Loader = loaders[variant];
  return <Loader {...props} data-testid="loading-spinner" />;
};

const FullWidthLinearProgress = styled(LinearProgress)`
  width: 100%;
`;

const loaders = {
  circular: CircularProgress,
  linear: FullWidthLinearProgress,
};
