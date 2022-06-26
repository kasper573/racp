import { Box, CircularProgress, styled } from "@mui/material";

export function LoadingPage() {
  return (
    <Center>
      <CircularProgress size={80} />
    </Center>
  );
}

const Center = styled(Box)`
  position: relative;
  display: inline-block;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
