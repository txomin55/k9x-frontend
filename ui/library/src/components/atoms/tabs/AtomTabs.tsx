import { createSignal, Index, type JSX } from "solid-js";
import { Tabs } from "@kobalte/core/tabs";
import "./styles.css";

interface TabsOptionProps {
  value: string;
  content: JSX.Element;
}

interface TabsContentProps {
  value: string;
  content: JSX.Element;
}

interface TabsProps {
  defaultValue: string;
  options: TabsOptionProps[];
  contents: TabsContentProps[];
}

const AtomTabOption = (props: TabsOptionProps) => (
  <Tabs.Trigger value={props.value}>{props.content}</Tabs.Trigger>
);

const AtomTabContent = (props: TabsContentProps) => (
  <Tabs.Content value={props.value}>{props.content}</Tabs.Content>
);

export default (props: TabsProps) => {
  const [selectedTab, setSelectedTab] = createSignal(props.defaultValue);
  return (
    <Tabs value={selectedTab()} onChange={setSelectedTab} class="atom-tabs">
      <Tabs.List>
        <Index each={props.options}>
          {(option) => (
            <AtomTabOption value={option().value} content={option().content} />
          )}
        </Index>
      </Tabs.List>
      <div class="atom-tabs__content">
        <Index each={props.contents}>
          {(option) => (
            <AtomTabContent value={option().value} content={option().content} />
          )}
        </Index>
      </div>
    </Tabs>
  );
};
