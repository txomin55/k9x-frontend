import AtomTextArea from "@lib/components/atoms/text-area/AtomTextArea";
import { createSignal } from "solid-js";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import { useAuthUser } from "@/stores/auth/auth";
import postGoogleForm from "@/utils/google-forms/postGoogleForm";
import { useI18n } from "@/stores/i18n/i18n";
import { showToast } from "@/stores/toast/toast";

interface ContactFormProps {
  onClose: () => void;
}

export default function ContactForm(props: ContactFormProps) {
  const user = useAuthUser();
  const i18n = useI18n();

  const [description, setDescription] = createSignal("");

  const sendContactForm = async () => {
    await postGoogleForm(
      "1FAIpQLSfkOHPQckiK5puxO8_J4evau3rAuCQwnL3QSuH61lO9KJWE4Q",
      {
        "entry.1931094736": user()?.email,
        "entry.897265685": description(),
      },
    );
    props.onClose();
    showToast(i18n.t("GLOBAL.FORM.SENT"));
  };

  return (
    <div class="contact-form">
      <AtomTextArea value={description()} onChange={setDescription} />
      <AtomButton onClick={sendContactForm}>
        {i18n.t("GLOBAL.NAVIGATION.SEND")}
      </AtomButton>
    </div>
  );
}
