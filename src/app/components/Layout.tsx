import * as React from "react";
import { ReactNode } from "react";
import Container from "@mui/material/Container";
import { AppBar } from "./AppBar";

const pages = ["Products", "Pricing", "Blog"];
const menu = ["Profile", "Account", "Dashboard", "Logout"];

export function Layout({ children }: { children?: ReactNode }) {
  return (
    <>
      <AppBar pages={pages} menu={menu} />
      <Container maxWidth="xl">{children}</Container>
    </>
  );
}
