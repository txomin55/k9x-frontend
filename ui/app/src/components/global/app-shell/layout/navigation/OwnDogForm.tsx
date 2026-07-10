import AtomTextArea from "@lib/components/atoms/text-area/AtomTextArea";
import { createSignal } from "solid-js";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import { useAuthUser } from "@/stores/auth/auth";
import postGoogleForm from "@/utils/google-forms/postGoogleForm";
import { useI18n } from "@/stores/i18n/i18n";
import { showToast } from "@/stores/toast/toast";

interface OwnDogFormProps {
  dogId: string;
  onClose: () => void;
}

export default function OwnDogForm(props: OwnDogFormProps) {
  const user = useAuthUser();
  const i18n = useI18n();

  const [description, setDescription] = createSignal("");

  const sendOwnDogForm = async () => {
    await postGoogleForm(
      "1FAIpQLSf2uWYp0eoiLTi-5556lPzqWi42DCGiQjWY4hbelrYrggclmg",
      {
        "entry.946948767": user()?.email,
        "entry.897265685": description(),
        "entry.467584706": props.dogId, //dog id
        "entry.69339544": "", //image
      },
    );
    props.onClose();
    showToast(i18n.t("GLOBAL.FORM.SENT"));
  };

  return (
    <div class="contact-form">
      <AtomTextArea value={description()} onChange={setDescription} />
      <AtomButton onClick={sendOwnDogForm}>
        {i18n.t("GLOBAL.NAVIGATION.SEND")}
      </AtomButton>
    </div>
  );
}
