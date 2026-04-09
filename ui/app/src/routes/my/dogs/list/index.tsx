import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, For, Show, Suspense } from "solid-js";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import FloatingToggleCircle from "@/components/floating-toggle-circle/FloatingToggleCircle";
import DogCard from "@/components/routes/my/dogs/list/dog-card/DogCard";
import DogForm from "@/components/routes/my/dogs/list/dog-form/DogForm";
import { createDog, deleteDog, useDogs } from "@/services/api/dog-crud/dogCrud";
import type { CreateDogRequest, Dog } from "@/services/api/dog-crud/dogCrudTypes";
import "./styles.css";

const buildDogDraft = (): CreateDogRequest => ({
  id:
    typeof globalThis !== "undefined" &&
    "crypto" in globalThis &&
    typeof globalThis.crypto.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
  name: "--Default dog",
  image: "",
  breed: "--Default breed",
});

export const Route = createFileRoute("/my/dogs/list/")({
  component: MyDogsListPage,
});

function MyDogsListPage() {
  const dogsQuery = useDogs({
    refetchOnMount: false,
    gcTime: 2 * 60 * 1000,
  });

  const [isDialogOpen, setDialogOpen] = createSignal(false);
  const [draftDog, setDraftDog] =
    createSignal<CreateDogRequest>(buildDogDraft());

  const openCreateDialog = () => {
    setDraftDog(buildDogDraft());
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const openEditDialog = (dog: Dog) => {
    setDraftDog(() => ({
      id: dog.id,
      name: dog.name,
      image: dog.image,
      breed: dog.breed,
      identifier: dog.identifier,
      owner: dog.owner,
      team: dog.team,
      country: dog.country,
    }));
    setDialogOpen(true);
  };

  const handleSave = () => {
    createDog(draftDog());
    handleCloseDialog();
  };

  return (
    <div class="my-dogs">
      <h1>--Dogs</h1>
      <AtomDialog
        title="--New dog"
        content={
          <DogForm
            draft={draftDog}
            onDraftChange={(updater) =>
              setDraftDog((current) => updater(current))
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

      <Suspense fallback={<span>--Loading dogs</span>}>
        <Show
          when={dogsQuery.data?.length}
          fallback={<p>--No dogs available yet.</p>}
        >
          <div class="dogs-list">
            <For each={dogsQuery.data}>
              {(dog) => (
                <DogCard
                  dog={dog}
                  onEdit={() => openEditDialog(dog)}
                  onDelete={() => deleteDog(dog.id)}
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
