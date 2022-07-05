import { Box, Paper, Tab, Tabs } from "@mui/material";
import { ComponentProps, ReactElement, useState } from "react";

export interface TabSwitchProps extends ComponentProps<typeof Box> {
  tabs: Array<{ label: string; content: ReactElement }>;
}

export function TabSwitch({ tabs, ...props }: TabSwitchProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { content } = tabs[activeIndex];

  return (
    <Box {...props}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeIndex}
          onChange={(e, newIndex) => setActiveIndex(newIndex)}
          aria-label="basic tabs example"
        >
          {tabs.map(({ label }, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>
      </Box>
      <Paper sx={{ p: 2 }}>{content}</Paper>
    </Box>
  );
}
