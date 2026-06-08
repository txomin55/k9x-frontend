import {createAppStore} from "@/utils/store/createAppStore";

interface ToastState {
  message: string | null;
}

const TOAST_DURATION = 2000;

const { setState, useAppStore } = createAppStore<ToastState>({ message: null });

let hideTimeout: ReturnType<typeof setTimeout> | undefined;

const showToast = (message: string) => {
  setState(() => ({ message }));

  if (hideTimeout) clearTimeout(hideTimeout);
  hideTimeout = setTimeout(
    () => setState(() => ({ message: null })),
    TOAST_DURATION,
  );
};

const useToast = () => useAppStore((state) => state.message);

export { showToast, useToast };
