import Card from "@lib/components/molecules/card/Card";
import AtomCollapsible from "@lib/components/atoms/collapsible/AtomCollapsible";
import type { StageEventClassificationItemResponseDTO } from "@/services/fetch-stages/fetchStages.types";
import { For } from "solid-js";

type ObdxClassificationProps = {
  competitor: StageEventClassificationItemResponseDTO;
};

export default function ObdxClassificationCard(props: ObdxClassificationProps) {
  return (
    <Card
      topLeft={
        <div>
          {props.competitor.position}. {props.competitor.country || "-"} -{" "}
          {props.competitor.dog.name}
        </div>
      }
      topRight={<div>{props.competitor.totalScore ?? "-"}</div>}
      content={<ClassificationCardContent competitor={props.competitor} />}
    />
  );
}

type ClassificationCardContentProps = {
  competitor: StageEventClassificationItemResponseDTO;
};

function ClassificationCardContent(props: ClassificationCardContentProps) {
  return (
    <div>
      <p>
        --Team: {props.competitor.team || "-"} | --Owner:{" "}
        {props.competitor.owner || "-"}
      </p>
      <AtomCollapsible
        trigger={<span>--Exercises</span>}
        content={
          <div>
            <For each={props.competitor.exercises}>
              {(exercise) => (
                <div style={{ "margin-bottom": "0.5rem" }}>
                  <div>
                    <strong>{exercise.exercise.name}</strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      "flex-wrap": "wrap",
                      "column-gap": "1rem",
                      "row-gap": "0.25rem",
                    }}
                  >
                    <For each={exercise.scores}>
                      {(score) => (
                        <span>
                          {score.value} ({score.judge.name})
                        </span>
                      )}
                    </For>
                  </div>
                </div>
              )}
            </For>
          </div>
        }
      />
    </div>
  );
}
