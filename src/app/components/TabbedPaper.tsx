import { Box, Paper } from "@mui/material";
import { ComponentProps } from "react";
import { TabItem, TabSwitch } from "./TabSwitch";

export interface TabbedPaperProps extends ComponentProps<typeof Box> {
  tabs: TabItem[];
  paperProps?: ComponentProps<typeof Paper>;
}

export function TabbedPaper({ tabs, paperProps, ...props }: TabbedPaperProps) {
  return (
    <Box {...props}>
      <TabSwitch
        tabs={tabs}
        sx={{ borderBottom: 1, borderColor: "divider" }}
        renderContent={(content) => (
          <Paper sx={{ p: 2, ...paperProps?.sx }} {...paperProps}>
            {content}
          </Paper>
        )}
      />
    </Box>
  );
}
