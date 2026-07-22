import { createSignal, Index, type JSX } from "solid-js";
import { Tabs } from "@kobalte/core/tabs";
import "./styles.css";

export interface TabsOptionProps {
  value: string;
  content: JSX.Element;
  disabled?: boolean;
}

export interface TabsContentProps {
  value: string;
  content: JSX.Element;
}

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onChange?: (value: string) => void;
  options: TabsOptionProps[];
  contents: TabsContentProps[];
}

const AtomTabOption = (props: TabsOptionProps) => (
  <Tabs.Trigger value={props.value} disabled={props.disabled}>
    {props.content}
  </Tabs.Trigger>
);

const AtomTabContent = (props: TabsContentProps) => (
  <Tabs.Content value={props.value}>{props.content}</Tabs.Content>
);

export default (props: TabsProps) => {
  const [selectedTab, setSelectedTab] = createSignal(props.defaultValue);
  const currentTab = () => props.value ?? selectedTab();
  const handleChange = (value: string) => {
    setSelectedTab(value);
    props.onChange?.(value);
  };
  return (
    <Tabs value={currentTab()} onChange={handleChange} class="atom-tabs">
      <Tabs.List>
        <Index each={props.options}>
          {(option) => (
            <AtomTabOption
              value={option().value}
              content={option().content}
              disabled={option().disabled}
            />
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
