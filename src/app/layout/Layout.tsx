import * as React from "react";
import { ReactNode } from "react";
import Container from "@mui/material/Container";
import { styled } from "@mui/material";
import { AppBar } from "./AppBar";
import { globalStyles } from "./globalStyles";

export function Layout({ children }: { children?: ReactNode }) {
  return (
    <>
      <AppBar />
      {globalStyles}
      <FullscreenContainer maxWidth="xl">{children}</FullscreenContainer>
    </>
  );
}

const FullscreenContainer = styled(Container)`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(2)};
`;
