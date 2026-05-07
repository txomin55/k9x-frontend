import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, For, Show, Suspense } from "solid-js";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import FloatingToggleCircle from "@/components/common/floating-toggle-circle/FloatingToggleCircle";
import JudgeCard from "@/components/routes/my/judges/list/judge-card/JudgeCard";
import JudgeForm from "@/components/routes/my/judges/list/judge-form/JudgeForm";
import {
  createJudge,
  deleteJudge,
  updateJudge,
  useJudges,
} from "@/services/secured/judge-crud/judgeCrud";
import type {
  IdNameDTO,
} from "@/services/secured/judge-crud/judgeCrud.types";
import "./styles.css";
import { useI18n } from "@/stores/i18n/i18n";

export const Route = createFileRoute("/my/judges/list/")({
  component: MyJudgesListPage,
});

function MyJudgesListPage() {
  const i18n = useI18n();
  const buildJudgeDraft = (): IdNameDTO => ({
    id: globalThis.crypto.randomUUID(),
    name: i18n.t("MY.JUDGES.LIST.DEFAULT_JUDGE"),
  });
  const judgesQuery = useJudges({
    refetchOnMount: false,
    gcTime: 2 * 60 * 1000,
  });

  const [isDialogOpen, setDialogOpen] = createSignal(false);
  const [editingJudgeId, setEditingJudgeId] = createSignal<string | null>(null);
  const [draftJudge, setDraftJudge] =
    createSignal<IdNameDTO>(buildJudgeDraft());

  const openCreateDialog = () => {
    setEditingJudgeId(null);
    setDraftJudge(buildJudgeDraft());
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingJudgeId(null);
  };

  const openEditDialog = (judge: IdNameDTO) => {
    setEditingJudgeId(judge.id);
    setDraftJudge(() => ({
      id: judge.id,
      name: judge.name,
    }));
    setDialogOpen(true);
  };

  const handleSave = () => {
    const payload = draftJudge();
    const currentEditingJudgeId = editingJudgeId();

    if (currentEditingJudgeId) {
      updateJudge(currentEditingJudgeId, {
        name: payload.name,
      });
    } else {
      createJudge(payload);
    }

    handleCloseDialog();
  };

  return (
    <div class="my-judges">
      <h1>{i18n.t("MY.JUDGES.LIST.JUDGES")}</h1>
      <AtomDialog
        title={
          editingJudgeId()
            ? i18n.t("MY.JUDGES.LIST.EDIT_JUDGE")
            : i18n.t("MY.JUDGES.LIST.NEW_JUDGE")
        }
        content={
          <JudgeForm
            draft={draftJudge}
            onDraftChange={(updater) =>
              setDraftJudge((current) => updater(current))
            }
            onCancel={handleCloseDialog}
            onSave={handleSave}
          />
        }
        open={isDialogOpen()}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            handleCloseDialog();
          }
        }}
        trigger={<span aria-hidden />}
      />

      <Suspense fallback={<span>{i18n.t("MY.JUDGES.LIST.LOADING_JUDGES")}</span>}>
        <Show
          when={judgesQuery.data?.length}
          fallback={<p>{i18n.t("MY.JUDGES.LIST.NO_JUDGES_AVAILABLE_YET")}</p>}
        >
          <div class="judges-list">
            <For each={judgesQuery.data}>
              {(judge) => (
                <JudgeCard
                  judge={judge}
                  onEdit={() => openEditDialog(judge)}
                  onDelete={() => deleteJudge(judge.id)}
                />
              )}
            </For>
          </div>
        </Show>
      </Suspense>

      <FloatingToggleCircle onClick={openCreateDialog} nonToggledText="+" />
    </div>
  );
}
