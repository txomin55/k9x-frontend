import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import AtomSelect, {
  type AtomSelectOption,
} from "@lib/components/atoms/select/AtomSelect";
import AtomCheckbox from "@lib/components/atoms/checkbox/AtomCheckbox";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import { useI18n } from "@/stores/i18n/i18n";
import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import { includesAll } from "@/utils/ranking";
import plusIcon from "@/assets/miscelaneous/plus.svg";
import "./styles.css";

/**
 * Shape the configurator needs to build its cascade. It matches the competitions payload, which already
 * arrives denormalised as competition -> stages -> events, so no extra request is needed.
 */
export interface RankingCompetitionOption {
  id: string;
  name: string;
  stages: {
    id: string;
    name: string;
    events: IdNameDTO[];
  }[];
}

export interface RankingConfiguratorChange {
  eventIds: string[];
  groupBy: string;
  includeBy: string;
  includedCount: number | null;
  includeReserves: boolean;
}

export interface RankingConfiguratorProps {
  /**
   * Competitions whose events can join the ranking. Today the page passes only the current one, but the
   * component is written against a list so it can later be fed N competitions untouched.
   */
  competitions: RankingCompetitionOption[];
  /** Events already part of the ranking. */
  events: IdNameDTO[];
  groupBy: string;
  includeBy: string;
  includedCount: number | null;
  includeReserves: boolean;
  groupByOptions: IdNameDTO[];
  includeByOptions: IdNameDTO[];
  disabled?: boolean;
  /**
   * Hides the competition select while there is only one competition to choose from. Meant for the
   * competition tab, where the competition is already the context. The standalone editor leaves it off so a
   * competition is always picked explicitly before its trials.
   */
  hideCompetitionWhenSingle?: boolean;
  onChange: (change: RankingConfiguratorChange) => void;
  /** Removing the last event deletes the ranking, so the page owns that decision. */
  onRemoveLastEvent: () => void;
}

const toOption = ({ id, name }: IdNameDTO): AtomSelectOption => ({
  label: name,
  value: id,
});

const selectedOption = (value: string, options: AtomSelectOption[]) =>
  options.find((option) => option.value === value) ?? null;

export default function RankingConfigurator(props: RankingConfiguratorProps) {
  const i18n = useI18n();
  const [competitionId, setCompetitionId] = createSignal(
    props.competitions[0]?.id ?? "",
  );
  const [stageId, setStageId] = createSignal("");
  const [eventId, setEventId] = createSignal("");
  // The field is kept as raw text so it can be emptied while typing instead of snapping back to a number.
  const [includedCountDraft, setIncludedCountDraft] = createSignal(
    props.includedCount === null ? "" : String(props.includedCount),
  );

  createEffect(() => {
    const incoming = props.includedCount;

    if (incoming === null) return;
    if (Number.parseInt(includedCountDraft(), 10) === incoming) return;

    setIncludedCountDraft(String(incoming));
  });

  const competitionOptions = createMemo<AtomSelectOption[]>(() =>
    props.competitions.map((competition) => ({
      label: competition.name,
      value: competition.id,
    })),
  );

  const selectedCompetition = createMemo(
    () =>
      props.competitions.find(
        (competition) => competition.id === competitionId(),
      ) ?? null,
  );

  const stageOptions = createMemo<AtomSelectOption[]>(
    () =>
      selectedCompetition()?.stages.map((stage) => ({
        label: stage.name,
        value: stage.id,
      })) ?? [],
  );

  const selectedStage = createMemo(
    () =>
      selectedCompetition()?.stages.find((stage) => stage.id === stageId()) ??
      null,
  );

  const eventOptions = createMemo<AtomSelectOption[]>(
    () => selectedStage()?.events.map(toOption) ?? [],
  );

  const selectedEvent = createMemo(
    () =>
      selectedStage()?.events.find((event) => event.id === eventId()) ?? null,
  );

  const isAlreadyAdded = createMemo(() =>
    props.events.some((event) => event.id === eventId()),
  );

  const canAddEvent = createMemo(
    () => !props.disabled && !!selectedEvent() && !isAlreadyAdded(),
  );

  // Changing a parent invalidates everything downstream, so the child selections are reset explicitly.
  const handleCompetitionChange = (option: AtomSelectOption | null) => {
    if (!option) return;

    setCompetitionId(option.value);
    setStageId("");
    setEventId("");
  };

  const handleStageChange = (option: AtomSelectOption | null) => {
    if (!option) return;

    setStageId(option.value);
    setEventId("");
  };

  const emit = (change: Partial<RankingConfiguratorChange>) => {
    props.onChange({
      eventIds: props.events.map((event) => event.id),
      groupBy: props.groupBy,
      includeBy: props.includeBy,
      includedCount: props.includedCount,
      includeReserves: props.includeReserves,
      ...change,
    });
  };

  const addSelectedEvent = () => {
    const event = selectedEvent();

    if (!event || isAlreadyAdded()) return;

    emit({ eventIds: [...props.events.map((entry) => entry.id), event.id] });
    setEventId("");
  };

  const removeEvent = (id: string) => {
    if (props.events.length <= 1) {
      props.onRemoveLastEvent();
      return;
    }

    emit({
      eventIds: props.events
        .map((event) => event.id)
        .filter((eventId) => eventId !== id),
    });
  };

  const handleGroupByChange = (option: AtomSelectOption | null) => {
    if (!option) return;

    emit({ groupBy: option.value });
  };

  const handleIncludeByChange = (option: AtomSelectOption | null) => {
    if (!option) return;

    // ALL carries no count, so it is cleared rather than left behind as a stale value.
    emit({
      includeBy: option.value,
      includedCount: includesAll(option.value)
        ? null
        : (props.includedCount ?? 1),
    });
  };

  const handleIncludedCountChange = (value: string) => {
    setIncludedCountDraft(value);

    const parsed = Number.parseInt(value, 10);

    emit({ includedCount: Number.isNaN(parsed) ? null : parsed });
  };

  const handleIncludedCountBlur = () => {
    const parsed = Number.parseInt(includedCountDraft(), 10);

    if (Number.isNaN(parsed)) {
      setIncludedCountDraft("");
      return;
    }

    const clamped = Math.max(1, parsed);

    setIncludedCountDraft(String(clamped));
    if (clamped !== props.includedCount) emit({ includedCount: clamped });
  };

  return (
    <div class="ranking-configurator">
      <div class="ranking-configurator__picker">
        {/* Only hidden when the caller says the competition is already implied and there is just one. */}
        <Show
          when={
            props.competitions.length > 1 || !props.hideCompetitionWhenSingle
          }
        >
          <AtomSelect
            label={i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.COMPETITION")}
            placeholder={i18n.t(
              "MY.COMPETITIONS.RANKINGS_SECTION.SELECT_COMPETITION",
            )}
            options={competitionOptions()}
            value={selectedOption(competitionId(), competitionOptions())}
            onChange={handleCompetitionChange}
            disabled={props.disabled}
          />
        </Show>
        <AtomSelect
          label={i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.STAGE")}
          placeholder={i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.SELECT_STAGE")}
          options={stageOptions()}
          value={selectedOption(stageId(), stageOptions())}
          onChange={handleStageChange}
          disabled={props.disabled || stageOptions().length === 0}
        />
        <AtomSelect
          label={i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.EVENT")}
          placeholder={i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.SELECT_EVENT")}
          options={eventOptions()}
          value={selectedOption(eventId(), eventOptions())}
          onChange={(option) => setEventId(option?.value ?? "")}
          disabled={props.disabled || !selectedStage()}
        />
        <button
          type="button"
          class="ranking-configurator__add"
          disabled={!canAddEvent()}
          onClick={addSelectedEvent}
        >
          <span class="ranking-configurator__add-icon">
            <AtomSvgIcon
              src={plusIcon}
              alt={i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.ADD_EVENT")}
              tinted
            />
          </span>
          {i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.ADD_EVENT")}
        </button>
      </div>

      <Show
        when={props.events.length > 0}
        fallback={
          <p class="ranking-configurator__empty">
            {i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.NO_EVENTS")}
          </p>
        }
      >
        <ul class="ranking-configurator__events">
          <For each={props.events}>
            {(event) => (
              <li class="ranking-configurator__event">
                <span class="ranking-configurator__event-label">
                  {event.name}
                </span>
                <button
                  type="button"
                  class="ranking-configurator__event-remove"
                  aria-label={`${i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.REMOVE_EVENT")} ${event.name}`}
                  disabled={props.disabled}
                  onClick={() => removeEvent(event.id)}
                >
                  x
                </button>
              </li>
            )}
          </For>
        </ul>
      </Show>

      <div class="ranking-configurator__criteria">
        <AtomSelect
          label={i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.GROUP_BY")}
          placeholder={i18n.t(
            "MY.COMPETITIONS.RANKINGS_SECTION.SELECT_GROUP_BY",
          )}
          options={props.groupByOptions.map(toOption)}
          value={selectedOption(
            props.groupBy,
            props.groupByOptions.map(toOption),
          )}
          onChange={handleGroupByChange}
          disabled={props.disabled || props.groupByOptions.length === 0}
        />
        <AtomSelect
          label={i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.INCLUDE_BY")}
          placeholder={i18n.t(
            "MY.COMPETITIONS.RANKINGS_SECTION.SELECT_INCLUDE_BY",
          )}
          options={props.includeByOptions.map(toOption)}
          value={selectedOption(
            props.includeBy,
            props.includeByOptions.map(toOption),
          )}
          onChange={handleIncludeByChange}
          disabled={props.disabled || props.includeByOptions.length === 0}
        />
        {/* ALL counts every result, so the amount only makes sense for the other criteria. */}
        <Show when={!includesAll(props.includeBy)}>
          <AtomInput
            label={i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.INCLUDED_COUNT")}
            type="number"
            min="1"
            value={includedCountDraft()}
            disabled={props.disabled}
            onChange={handleIncludedCountChange}
            onBlur={handleIncludedCountBlur}
          />
        </Show>
      </div>

      {/* A toggle, not a field: kept out of the field grid so it never shares a row with the inputs. */}
      <div class="ranking-configurator__toggle">
        <AtomCheckbox
          checked={props.includeReserves}
          disabled={props.disabled}
          label={i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.INCLUDE_RESERVES")}
          setChecked={(includeReserves) => emit({ includeReserves })}
        />
      </div>
    </div>
  );
}
