import { Link } from "@tanstack/solid-router";
import { For, Match, Switch } from "solid-js";
import AtomCollapsible from "@lib/components/atoms/collapsible/AtomCollapsible";
import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import DisciplineIcon from "@/components/common/discipline-icon/DisciplineIcon";
import RankBadge from "@/components/common/rank-badge/RankBadge";
import { useExtractionLog } from "@/services/fetch-extractions/fetchExtractions";
import { useI18n } from "@/stores/i18n/i18n";
import { formatStageDateRange, formatUtcDateOnly } from "@/utils/date";
import "./styles.css";

export interface ExtractionLogProps {
  /** Called when a trial is opened, so the dialog holding the log can close. */
  onNavigate?: () => void;
}

/**
 * Transparency log of imported trials, one collapsible block per import day. Only the latest day starts open.
 * Read only on purpose: no enrollment or classification actions, a trial links to its detail and nothing else.
 */
export default function ExtractionLog(props: ExtractionLogProps) {
  const i18n = useI18n();
  const log = useExtractionLog();

  return (
    <div class="extraction-log">
      <Switch>
        <Match when={log.isPending}>
          <For each={Array.from({ length: 3 })}>
            {() => (
              <AtomSkeleton variant="rectangular" height="var(--unit-6)" />
            )}
          </For>
        </Match>
        <Match when={log.isError}>
          <p class="extraction-log__message">{i18n.t("HOME.IMPORTS_ERROR")}</p>
        </Match>
        <Match when={log.data?.length === 0}>
          <p class="extraction-log__message">{i18n.t("HOME.IMPORTS_EMPTY")}</p>
        </Match>
        <Match when={log.data}>
          <For each={log.data}>
            {(day, index) => (
              <AtomCollapsible
                defaultOpen={index() === 0}
                trigger={
                  <span class="extraction-log__day">
                    <span class="extraction-log__day-date">
                      {formatUtcDateOnly(day.date)}
                    </span>
                    <span class="extraction-log__day-count">
                      {i18n.t("HOME.IMPORTS_DAY_COUNT", {
                        count: day.stages.length,
                      })}
                    </span>
                  </span>
                }
                content={
                  <ul class="extraction-log__stages">
                    <For each={day.stages}>
                      {(stage) => (
                        <li>
                          <Link
                            class="extraction-log__stage"
                            params={{ id: stage.id }}
                            to="/stages/$id/info"
                            onClick={() => props.onNavigate?.()}
                          >
                            <span class="extraction-log__stage-header">
                              <CountryFlag
                                country={stage.country ?? ""}
                                alt={`${stage.name} flag`}
                              />
                              <span class="extraction-log__stage-name">
                                {stage.name}
                              </span>
                              <span class="extraction-log__stage-date">
                                {formatStageDateRange(
                                  stage.dateFrom,
                                  stage.dateTo,
                                )}
                              </span>
                            </span>
                            <span class="extraction-log__stage-competition">
                              {stage.competitionName}
                            </span>
                            <ul class="extraction-log__events">
                              <For each={stage.events}>
                                {(event) => (
                                  <li class="extraction-log__event">
                                    <RankBadge rank={event.rank} />
                                    <DisciplineIcon
                                      disciplineId={event.discipline.id}
                                    />
                                    <span class="extraction-log__event-name">
                                      {event.name}
                                    </span>
                                    <span class="text-caption-sm">
                                      ({event.competitors})
                                    </span>
                                  </li>
                                )}
                              </For>
                            </ul>
                            <span
                              aria-hidden="true"
                              class="extraction-log__stage-chevron"
                            >
                              ›
                            </span>
                          </Link>
                        </li>
                      )}
                    </For>
                  </ul>
                }
              />
            )}
          </For>
        </Match>
      </Switch>
    </div>
  );
}
