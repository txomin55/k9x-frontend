import AtomTextArea from "@lib/components/atoms/text-area/AtomTextArea";
import { createSignal } from "solid-js";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import { useAuthUser } from "@/stores/auth/auth";
import postGoogleForm from "@/utils/google-forms/postGoogleForm";
import { useI18n } from "@/stores/i18n/i18n";
import { showToast } from "@/stores/toast/toast";

interface WrongLocationFormProps {
  stageId: string;
  onClose: () => void;
}

export default function WrongLocationForm(props: WrongLocationFormProps) {
  const user = useAuthUser();
  const i18n = useI18n();

  const [description, setDescription] = createSignal("");

  const sendWrongLocationForm = async () => {
    await postGoogleForm("1FAIpQLScikWNNKevmwQfpLMkFxkTtgHk3UKQFHXw8P_J-iWLvsTAw3w", {
      "entry.1931094736": user()?.email,
      "entry.897265685": description(),
      "entry.597886130": props.stageId,
    });
    props.onClose();
    showToast(i18n.t("GLOBAL.FORM.SENT"));
  };

  return (
    <div class="wrong-location-form">
      <AtomTextArea value={description()} onChange={setDescription} />
      <AtomButton onClick={sendWrongLocationForm}>
        {i18n.t("STAGES.STAGES_MAP.WRONG_LOCATION_FORM.SEND")}
      </AtomButton>
    </div>
  );
}
