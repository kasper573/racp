import { Paper } from "@mui/material";
import { ComponentProps } from "react";
import { TabItem, TabSwitch } from "./TabSwitch";

export interface TabbedPaperProps extends ComponentProps<typeof TabSwitch> {
  tabs: TabItem[];
  paperProps?: ComponentProps<typeof Paper>;
}

export function TabbedPaper({
  tabs,
  paperProps,
  sx,
  children,
  ...props
}: TabbedPaperProps) {
  return (
    <TabSwitch
      tabs={tabs}
      sx={{ borderBottom: 1, borderColor: "divider", ...sx }}
      renderContent={(content) => (
        <Paper
          sx={{ position: "relative", p: 2, ...paperProps?.sx }}
          {...paperProps}
        >
          {content}
          {children}
        </Paper>
      )}
      {...props}
    />
  );
}
