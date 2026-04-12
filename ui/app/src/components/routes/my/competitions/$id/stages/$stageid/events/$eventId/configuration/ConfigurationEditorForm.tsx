import { createMemo } from "solid-js";
import type { EventResponse } from "@/services/api/competition-crud/competitionCrud.types";
import { useConfigurations } from "@/services/api/configurations/configurations";
import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import {
  Federation,
  FederationConfigurations,
} from "@/services/api/configurations/configurations.types";

type ConfigurationEditorFormProps = {
  draft: EventResponse;
  onChange: (
    updater: (current: EventResponse | null) => EventResponse | null,
  ) => void;
};

const getFederationOption = (
  federation: FederationConfigurations,
): AtomSelectOption => ({
  label: `--${federation.info.name}`,
  value: federation.info.id,
});

const getConfigurationOption = (configuration: {
  id: string;
  name: string;
}): AtomSelectOption => ({
  label: `--${configuration.name}`,
  value: configuration.id,
});

export default function ConfigurationEditorForm(
  props: ConfigurationEditorFormProps,
) {
  const configurations = useConfigurations({
    staleTime: Number.POSITIVE_INFINITY,
  });

  const disciplineConfigurations = createMemo(
    () =>
      configurations.data?.find(
        (entry) => entry.disciplineId === props.draft.discipline,
      ) ?? null,
  );
  const federationOptions = createMemo<AtomSelectOption[]>(
    () =>
      disciplineConfigurations()?.federations.map(getFederationOption) ?? [],
  );
  const selectedFederation = createMemo(
    () =>
      disciplineConfigurations()?.federations.find(
        (entry) => entry.info.id === props.draft.configuration.federation?.id,
      ) ?? null,
  );
  const configurationOptions = createMemo<AtomSelectOption[]>(() => {
    return (
      selectedFederation()?.configurations.map(getConfigurationOption) ?? []
    );
  });
  const selectedFederationOption = createMemo<AtomSelectOption | null>(() => {
    const federation = selectedFederation();

    return federation
      ? (federationOptions().find(
          (option) => option.value === federation.info.id,
        ) ?? null)
      : null;
  });
  const selectedConfigurationOption = createMemo<AtomSelectOption | null>(
    () =>
      configurationOptions().find(
        (option) => option.value === props.draft.configuration.id,
      ) ?? null,
  );

  const handleFederationChange = (option: AtomSelectOption | null) => {
    if (!option) {
      return;
    }

    const federation = disciplineConfigurations()?.federations.find(
      (entry) => entry.info.id === option.value,
    );

    props.onChange((current) =>
      current && federation
        ? current.configuration.federation?.id === federation.info.id &&
          current.configuration.id === "" &&
          current.configuration.name === ""
          ? current
          : {
              ...current,
              configuration: {
                federation: federation.info as Federation,
                id: "",
                name: "",
              },
            }
        : current,
    );
  };

  const handleConfigurationChange = (option: AtomSelectOption | null) => {
    if (!option) {
      return;
    }

    const federation = selectedFederation();
    const configuration = federation?.configurations.find(
      (entry) => entry.id === option.value,
    );

    props.onChange((current) =>
      current && federation && configuration
        ? current.configuration.federation?.id === federation.info.id &&
          current.configuration.id === configuration.id &&
          current.configuration.name === configuration.name
          ? current
          : {
              ...current,
              configuration: {
                federation: federation.info as Federation,
                id: configuration.id,
                name: configuration.name,
              },
            }
        : current,
    );
  };

  return (
    <div>
      <AtomSelect
        label="--Federation"
        options={federationOptions()}
        value={selectedFederationOption()}
        onChange={handleFederationChange}
        placeholder="--Select a federation"
        disabled={federationOptions().length === 0}
      />
      <AtomSelect
        label="--Configuration"
        options={configurationOptions()}
        value={selectedConfigurationOption()}
        onChange={handleConfigurationChange}
        placeholder="--Select a configuration"
        disabled={!selectedFederation() || configurationOptions().length === 0}
      />
    </div>
  );
}
