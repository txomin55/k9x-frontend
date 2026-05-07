import { createFileRoute } from "@tanstack/solid-router";
import { createMemo, createSignal, For, Show, Suspense } from "solid-js";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import FloatingToggleCircle from "@/components/common/floating-toggle-circle/FloatingToggleCircle";
import DogCard from "@/components/routes/my/dogs/list/dog-card/DogCard";
import DogForm from "@/components/routes/my/dogs/list/dog-form/DogForm";
import {
  createDog,
  deleteDog,
  updateDog,
  useDogs,
} from "@/services/secured/dog-crud/dogCrud";
import type {
  CreateDogRequest,
  Dog,
} from "@/services/secured/dog-crud/dogCrud.types";
import "./styles.css";
import { useAuthUser } from "@/stores/auth/auth";
import { useI18n } from "@/stores/i18n/i18n";

export const Route = createFileRoute("/my/dogs/list/")({
  component: MyDogsListPage,
});

function MyDogsListPage() {
  const user = useAuthUser();
  const i18n = useI18n();
  const buildDogDraft = (isOrganizer: boolean): CreateDogRequest => ({
    id:
      typeof globalThis !== "undefined" &&
      "crypto" in globalThis &&
      typeof globalThis.crypto.randomUUID === "function"
        ? globalThis.crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
    name: i18n.t("MY.DOGS.LIST.DEFAULT_DOG"),
    image: "",
    breed: i18n.t("MY.DOGS.LIST.DEFAULT_BREED"),
    owned: !isOrganizer,
    creator: user()?.email ?? "no-creator",
  });
  const dogsQuery = useDogs({
    refetchOnMount: false,
    gcTime: 2 * 60 * 1000,
  });

  const myDogs = createMemo(() => {
    if (!dogsQuery.data) {
      return [];
    }

    return dogsQuery.data.filter(
      (dog) => dog.owned || user()?.email === dog.creator,
    );
  });

  const [isDialogOpen, setDialogOpen] = createSignal(false);
  const [editingDogId, setEditingDogId] = createSignal<string | null>(null);
  const [draftDog, setDraftDog] = createSignal<CreateDogRequest>(
    buildDogDraft(!!user()?.organizer),
  );

  const openCreateDialog = () => {
    setEditingDogId(null);
    setDraftDog(buildDogDraft(!!user()?.organizer));
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingDogId(null);
  };

  const openEditDialog = (dog: Dog) => {
    setEditingDogId(dog.id);
    setDraftDog(() => ({
      id: dog.id,
      name: dog.name,
      image: dog.image,
      breed: dog.breed,
      identifier: dog.identifier,
      owner: dog.owner,
      team: dog.team,
      country: dog.country,
      owned: dog.owned,
      creator: dog.creator,
    }));
    setDialogOpen(true);
  };

  const handleSave = () => {
    const payload = draftDog();
    const currentEditingDogId = editingDogId();

    if (currentEditingDogId) {
      updateDog(currentEditingDogId, {
        name: payload.name,
        image: payload.image,
        breed: payload.breed,
        identifier: payload.identifier,
        owner: payload.owner,
        team: payload.team,
        country: payload.country,
        owned: payload.owned,
      });
    } else {
      createDog(payload);
    }

    handleCloseDialog();
  };

  return (
    <div class="my-dogs">
      <h1>{i18n.t("MY.DOGS.LIST.DOGS")}</h1>
      <AtomDialog
        title={
          editingDogId()
            ? i18n.t("MY.DOGS.LIST.EDIT_DOG")
            : i18n.t("MY.DOGS.LIST.NEW_DOG")
        }
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

      <Suspense fallback={<span>{i18n.t("MY.DOGS.LIST.LOADING_DOGS")}</span>}>
        <Show
          when={myDogs().length}
          fallback={<p>{i18n.t("MY.DOGS.LIST.NO_DOGS_AVAILABLE_YET")}</p>}
        >
          <div class="dogs-list">
            <For each={myDogs()}>
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
