import { CircularProgress } from "@mui/material";
import { ComponentProps } from "react";

export const LoadingSpinner = (
  props: ComponentProps<typeof CircularProgress>
) => <CircularProgress {...props} data-testid="loading-spinner" />;
