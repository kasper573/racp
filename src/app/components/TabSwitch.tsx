import { ComponentProps, ReactElement, ReactNode, useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";

export interface TabItem {
  id?: string;
  label: string;
  content: ReactElement;
}

export interface TabSwitchProps
  extends Omit<ComponentProps<typeof Tabs>, "value"> {
  activeTabId?: TabItem["id"];
  tabs: TabItem[];
  renderContent?: (content: ReactNode) => ReactNode;
}

export function TabSwitch({
  tabs: inputTabs,
  activeTabId: inputId,
  renderContent = (content) => content,
  sx,
  style,
  className,
  ...tabsProps
}: TabSwitchProps) {
  const tabs = inputTabs.map((tab, index) => ({ ...tab, id: tab.id ?? index }));
  const [localId, setLocalId] = useState(tabs[0]?.id);
  const activeId = inputId ?? localId;
  const activeTab = tabs.find(({ id }) => id === activeId);

  return (
    <Box {...{ sx, style, className }}>
      <Tabs
        value={activeId}
        onChange={(e, newId) => setLocalId(newId)}
        {...tabsProps}
      >
        {tabs.map(({ label, id }, index) => (
          <Tab key={index} label={label} value={id} />
        ))}
      </Tabs>
      {activeTab ? renderContent(activeTab.content) : undefined}
    </Box>
  );
}
