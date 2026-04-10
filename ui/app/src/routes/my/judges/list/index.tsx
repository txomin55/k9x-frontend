import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, For, Show, Suspense } from "solid-js";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import FloatingToggleCircle from "@/components/common/floating-toggle-circle/FloatingToggleCircle";
import JudgeCard from "@/components/routes/my/judges/list/judge-card/JudgeCard";
import JudgeForm from "@/components/routes/my/judges/list/judge-form/JudgeForm";
import {
  createJudge,
  deleteJudge,
  useJudges,
} from "@/services/api/judge-crud/judgeCrud";
import type {
  CreateJudgeRequest,
  Judge,
} from "@/services/api/judge-crud/judgeCrudTypes";
import "./styles.css";

const buildJudgeDraft = (): CreateJudgeRequest => ({
  id: globalThis.crypto.randomUUID(),
  name: "--Default judge",
});

export const Route = createFileRoute("/my/judges/list/")({
  component: MyJudgesListPage,
});

function MyJudgesListPage() {
  const judgesQuery = useJudges({
    refetchOnMount: false,
    gcTime: 2 * 60 * 1000,
  });

  const [isDialogOpen, setDialogOpen] = createSignal(false);
  const [draftJudge, setDraftJudge] =
    createSignal<CreateJudgeRequest>(buildJudgeDraft());

  const openCreateDialog = () => {
    setDraftJudge(buildJudgeDraft());
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const openEditDialog = (judge: Judge) => {
    setDraftJudge(() => ({
      id: judge.id,
      name: judge.name,
    }));
    setDialogOpen(true);
  };

  const handleSave = () => {
    const payload = draftJudge();

    createJudge(payload);
    handleCloseDialog();
  };

  return (
    <div class="my-judges">
      <h1>--Judges</h1>
      <AtomDialog
        title="--New judge"
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

      <Suspense fallback={<span>--Loading judges</span>}>
        <Show
          when={judgesQuery.data?.length}
          fallback={<p>--No judges available yet.</p>}
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
