import { Box, Card, styled } from "@mui/material";

export const CardList = styled(Box)`
  display: grid;
  gap: 24px;
  grid-auto-rows: auto;
  grid-template-columns: repeat(6, 1fr);
  ${({ theme }) => theme.breakpoints.down("lg")} {
    grid-template-columns: repeat(4, 1fr);
  }
  ${({ theme }) => theme.breakpoints.down("md")} {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const CardListItem = styled(Card)`
  aspect-ratio: 1 / 1;
  position: relative;
`;
