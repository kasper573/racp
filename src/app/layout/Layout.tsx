import { ReactNode, Suspense } from "react";
import Container from "@mui/material/Container";
import { styled } from "@mui/material";
import { LoadingPage } from "../components/LoadingPage";
import { AppBar } from "./AppBar";
import { globalStyles } from "./globalStyles";

export function Layout({ children }: { children?: ReactNode }) {
  return (
    <Suspense fallback={<LoadingPage />}>
      <AppBar />
      {globalStyles}
      <FullscreenContainer maxWidth="xl">{children}</FullscreenContainer>
    </Suspense>
  );
}

const FullscreenContainer = styled(Container)`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(2)};
`;
