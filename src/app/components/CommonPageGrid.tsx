import { Box, styled } from "@mui/material";

export const CommonPageGrid = styled(Box, {
  shouldForwardProp: (prop) => prop !== "variant",
})<{ variant?: "dock" | "grow" }>`
  display: grid;
  grid-gap: 16px;
  @media (max-width: 1000px) {
    width: 100%;
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
  }
  @media (min-width: 1000px) {
    flex: ${({ variant = "dock" }) => (variant === "dock" ? 1 : undefined)};
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: auto;
  }
`;
