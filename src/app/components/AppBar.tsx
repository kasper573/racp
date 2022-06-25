import * as React from "react";
import MuiAppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { AdminPanelSettings } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { Title } from "./Title";
import { MenuOn } from "./IconMenu";

export interface AppBarProps {
  pages: string[];
  menu: string[];
}

export function AppBar({ pages, menu }: AppBarProps) {
  return (
    <MuiAppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Title />
          <Box sx={{ display: "flex", flexGrow: 1 }}>
            {pages.map((page) => (
              <Button key={page} sx={{ color: "white" }}>
                {page}
              </Button>
            ))}
          </Box>

          <MenuOn
            tooltip="Admin"
            items={menu.map((item) => ({ children: item }))}
          >
            {(open) => (
              <Tooltip title="Admin">
                <IconButton onClick={open}>
                  <AdminPanelSettings />
                </IconButton>
              </Tooltip>
            )}
          </MenuOn>
        </Toolbar>
      </Container>
    </MuiAppBar>
  );
}
