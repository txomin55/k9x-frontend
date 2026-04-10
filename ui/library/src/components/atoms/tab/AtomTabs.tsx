import { createSignal, Index } from "solid-js";
import { Tabs } from "@kobalte/core/tabs";
import {
  TabsContentProps,
  TabsOptionProps,
  TabsProps,
} from "@lib/components/atoms/tab/AtomTabs.types";
import "./styles.css";

const TabOption = (props: TabsOptionProps) => (
  <Tabs.Trigger value={props.value}>{props.content}</Tabs.Trigger>
);

const TabContent = (props: TabsContentProps) => (
  <Tabs.Content value={props.value}>{props.content}</Tabs.Content>
);

export default (props: TabsProps) => {
  const [selectedTab, setSelectedTab] = createSignal(props.defaultValue);
  return (
    <div class="atom-tabs">
      <Tabs value={selectedTab()} onChange={setSelectedTab}>
        <Tabs.List>
          <Index each={props.options}>
            {(option) => (
              <TabOption value={option().value} content={option().content} />
            )}
          </Index>
          <Tabs.Indicator />
        </Tabs.List>
        <Index each={props.contents}>
          {(option) => (
            <TabContent value={option().value} content={option().content} />
          )}
        </Index>
      </Tabs>
    </div>
  );
};
