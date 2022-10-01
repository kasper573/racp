import {
  ComponentProps,
  ReactElement,
  ReactNode,
  RefObject,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Tab, Tabs } from "@mui/material";

export interface TabItem {
  id?: string;
  label: string;
  content: ReactElement;
}

export interface TabSwitchProps
  extends Omit<ComponentProps<typeof Tabs>, "value"> {
  activeTabId?: TabItem["id"];
  tabs: TabItem[];
  renderContent?: (content: ReactNode, label: string) => ReactNode;
}

export function TabSwitch({
  tabs: inputTabs,
  activeTabId: inputId,
  renderContent = (content) => content,
  ...tabsProps
}: TabSwitchProps) {
  const tabs = inputTabs.map((tab, index) => ({
    ...tab,
    id: tab.id ?? index,
  }));
  const [localId, setLocalId] = useState(tabs[0]?.id);
  const activeId = inputId ?? localId;
  const activeTab = tabs.find(({ id }) => id === activeId);
  const ref = useRef<HTMLButtonElement>(null);

  // "scroll to" required to persist scroll position in some scenarios,
  // due to some tabs being controlled by url changes, which resets scroll to top.
  useScrollToOnChange(ref, activeId);

  return (
    <>
      <Tabs
        ref={ref}
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

function useScrollToOnChange(
  ref: RefObject<HTMLElement>,
  changeTrigger: unknown
) {
  useLayoutEffect(() => {
    if (ref.current) {
      const { top } = ref.current.getBoundingClientRect();
      window.scrollTo({ top });
      setTimeout(() => window.scrollTo({ top }), 0);
    }
  }, [ref, changeTrigger]);
}
