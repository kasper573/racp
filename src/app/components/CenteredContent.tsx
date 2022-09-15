import { Box, styled } from "@mui/material";

export const CenteredContent = styled(Box)`
  display: block;
  margin: 0 auto;
  width: 375px;
  position: relative;
  ${({ theme }) => theme.breakpoints.up("sm")} {
    top: 20%;
  }
`;
