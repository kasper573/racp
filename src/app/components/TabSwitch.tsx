import { ComponentProps, ReactElement, ReactNode, useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";

export interface TabSwitchProps extends ComponentProps<typeof Box> {
  tabs: Array<{ label: string; content: ReactElement }>;
  tabsProps?: Omit<ComponentProps<typeof Tabs>, "value" | "onChange">;
  renderContent?: (content: ReactNode) => ReactNode;
}

export function TabSwitch({
  tabs,
  tabsProps,
  renderContent = (content) => content,
}: TabSwitchProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { content } = tabs[activeIndex];

  return (
    <>
      <Tabs
        value={activeIndex}
        onChange={(e, newIndex) => setActiveIndex(newIndex)}
        {...tabsProps}
      >
        {tabs.map(({ label }, index) => (
          <Tab key={index} label={label} />
        ))}
      </Tabs>
      {renderContent(content)}
    </>
  );
}
