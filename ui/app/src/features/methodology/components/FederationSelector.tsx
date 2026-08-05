import { createMemo } from "solid-js";
import AtomSelect, {
  type AtomSelectOption,
} from "@lib/components/atoms/select/AtomSelect";
import type { Federation, Grade } from "../types";

type Props = {
  federations: Federation[];
  federationId: string;
  grades: Grade[];
  gradeId: string;
  federationLabel: string;
  gradeLabel: string;
  gradeName: (grade: Grade) => string;
  onSelectFederation: (id: string) => void;
  onSelectGrade: (id: string) => void;
};

const selectedOption = (options: AtomSelectOption[], value: string) =>
  options.find((option) => option.value === value) ?? null;

export default function FederationSelector(props: Props) {
  const federationOptions = createMemo<AtomSelectOption[]>(() =>
    props.federations.map((federation) => ({
      label: `${federation.id} · ${federation.name}`,
      value: federation.id,
    })),
  );

  const gradeOptions = createMemo<AtomSelectOption[]>(() =>
    props.grades.map((grade) => ({
      label: props.gradeName(grade),
      value: grade.id,
    })),
  );

  return (
    <div class="methodology-page__controls">
      <div class="methodology-page__control">
        <AtomSelect
          label={props.federationLabel}
          onChange={(option) => {
            if (option) props.onSelectFederation(option.value);
          }}
          options={federationOptions()}
          value={selectedOption(federationOptions(), props.federationId)}
        />
      </div>
      <div class="methodology-page__control">
        <AtomSelect
          label={props.gradeLabel}
          onChange={(option) => {
            if (option) props.onSelectGrade(option.value);
          }}
          options={gradeOptions()}
          value={selectedOption(gradeOptions(), props.gradeId)}
        />
      </div>
    </div>
  );
}
