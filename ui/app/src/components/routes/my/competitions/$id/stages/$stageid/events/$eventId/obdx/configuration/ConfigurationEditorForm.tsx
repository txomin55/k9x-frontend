import { createMemo } from "solid-js";
import { useConfigurations } from "@/services/secured/configurations/configurations";
import AtomSelect from "library/src/components/atoms/select/AtomSelect";
import type { AtomSelectOption } from "library/src/components/atoms/select/AtomSelect.types";
import {
  FederationConfigurationResponseDTO,
  FederationConfigurationsResponseDTO
} from "@/services/secured/configurations/configurations.types";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import { EventEditorDraft } from "@/services/secured/event-crud/eventCrud.types";
import { useI18n } from "@/stores/i18n/i18n";

type ConfigurationEditorFormProps = {
  draft: EventEditorDraft;
  onChange: (
    updater: (current: EventEditorDraft | null) => EventEditorDraft | null,
  ) => void;
};

const getFederationOption = (
  federation: FederationConfigurationsResponseDTO,
): AtomSelectOption => ({
  label: federation.info.name,
  value: federation.info.id,
  preLabel: (
    <CountryFlag
      country={federation.info.country}
      alt={`${federation.info.country} flag`}
    />
  ),
});

const getConfigurationOption = (configuration: {
  id: string;
  name: string;
}): AtomSelectOption => ({
  label: configuration.name,
  value: configuration.id,
});

export default function ConfigurationEditorForm(
  props: ConfigurationEditorFormProps,
) {
  const i18n = useI18n();
  const configurations = useConfigurations(props.draft.discipline.id, {
    gcTime: 2 * 60 * 1000,
  });

  const disciplineConfigurations = createMemo(
    () => configurations.data?.obdx ?? { federations: [] },
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
        ? current.configuration.federation?.id === federation.info.id
          ? current
          : {
              ...current,
              configuration: {
                federation:
                  federation.info as FederationConfigurationResponseDTO,
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
                federation:
                  federation.info as FederationConfigurationResponseDTO,
                id: configuration.id,
                name: configuration.name,
              },
            }
        : current,
    );
  };

  return (
    <>
      <AtomSelect
        label={i18n.t("MY.COMPETITIONS.EVENT_CONFIGURATION.FEDERATION")}
        options={federationOptions()}
        value={selectedFederationOption()}
        onChange={handleFederationChange}
        placeholder={i18n.t(
          "MY.COMPETITIONS.EVENT_CONFIGURATION.SELECT_FEDERATION",
        )}
        disabled={federationOptions().length === 0}
      />
      <AtomSelect
        label={i18n.t("MY.COMPETITIONS.EVENT_CONFIGURATION.CONFIGURATION")}
        options={configurationOptions()}
        value={selectedConfigurationOption()}
        onChange={handleConfigurationChange}
        placeholder={i18n.t(
          "MY.COMPETITIONS.EVENT_CONFIGURATION.SELECT_CONFIGURATION",
        )}
        disabled={!selectedFederation() || configurationOptions().length === 0}
      />
    </>
  );
}
