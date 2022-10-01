import { Box, styled } from "@mui/material";

export const CommonPageGrid = styled(Box)`
  display: grid;
  grid-gap: 16px;
  ${({ theme }) => theme.breakpoints.down("md")} {
    width: 100%;
    grid-template-columns: 1fr;
    grid-auto-rows: auto;

    // On small devices enforce a height to avoid the page grid crushing the height of the data grids.
    // Lazy ugly solution but it works for all current cases.
    .MuiDataGrid-root {
      height: 50vh;
    }
  }
  ${({ theme }) => theme.breakpoints.up("md")} {
    flex: 1;
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: auto;
  }
`;
