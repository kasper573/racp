import { ComponentProps, ReactElement, ReactNode, useState } from "react";
import { Tab, Tabs } from "@mui/material";

export interface TabItem<Id extends string = string> {
  id?: Id;
  label: string;
  content: ReactElement;
}

export interface TabSwitchProps<Id extends string>
  extends Omit<ComponentProps<typeof Tabs>, "value"> {
  activeTabId?: Id;
  tabs: TabItem<Id>[];
  renderContent?: (content: ReactNode, label: string) => ReactNode;
}

export function TabSwitch<Id extends string>({
  tabs: inputTabs,
  activeTabId: inputId,
  renderContent = (content) => content,
  ...tabsProps
}: TabSwitchProps<Id>) {
  const tabs = inputTabs.map((tab, index) => ({
    ...tab,
    id: tab.id ?? index,
  }));
  const [localId, setLocalId] = useState(tabs[0]?.id);
  const activeId = inputId ?? localId;
  const activeTab = tabs.find(({ id }) => id === activeId);

  return (
    <>
      <Tabs
        value={activeId}
        onChange={(e, newId) => setLocalId(newId)}
        {...tabsProps}
      >
        {tabs.map(({ label, id }, index) => (
          <Tab key={index} label={label} value={id} />
        ))}
      </Tabs>
      {activeTab
        ? renderContent(activeTab.content, activeTab.label)
        : undefined}
    </>
  );
}
