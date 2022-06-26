import * as React from "react";
import { ReactNode } from "react";
import Container from "@mui/material/Container";
import { styled } from "@mui/material";
import { AppBar } from "./AppBar";

export function Layout({ children }: { children?: ReactNode }) {
  return (
    <>
      <AppBar />
      <FullscreenContainer maxWidth="xl">{children}</FullscreenContainer>
    </>
  );
}

const FullscreenContainer = styled(Container)`
  height: 100vh;
  position: relative;
  padding: ${({ theme }) => theme.spacing(2)};
`;
