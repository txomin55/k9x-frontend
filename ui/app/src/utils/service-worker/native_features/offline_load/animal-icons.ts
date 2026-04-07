import { availableAnimalNames } from "@lib/components/molecules/animal-icon/animals.constants";
import { resolveAppPath } from "@/utils/paths/app-paths";
import { WARM_ANIMAL_ICONS } from "@/utils/service-worker/events/animal-icons";

const scheduleIdleTask = (callback) => {
  if ("requestIdleCallback" in globalThis) {
    const idleCallbackId = globalThis.requestIdleCallback(callback, {
      timeout: 5_000,
    });

    return () => {
      globalThis.cancelIdleCallback(idleCallbackId);
    };
  }

  const timeoutId = globalThis.setTimeout(callback, 2_000);

  return () => {
    globalThis.clearTimeout(timeoutId);
  };
};

const warmAnimalIcons = async () => {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const urls = Object.values(availableAnimalNames).map((animalName) =>
    resolveAppPath(`/animals/${animalName}.svg`),
  );

  registration.active?.postMessage({
    type: WARM_ANIMAL_ICONS,
    urls,
  });
};

export const warmAnimalIconsInBackground = () => {
  return scheduleIdleTask(() => {
    warmAnimalIcons().catch(() => {});
  });
};
