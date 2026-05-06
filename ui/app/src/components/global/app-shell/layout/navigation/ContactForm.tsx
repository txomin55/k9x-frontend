import AtomTextArea from "@lib/components/atoms/text-area/AtomTextArea";
import { createSignal } from "solid-js";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import { useAuthUser } from "@/stores/auth/auth";
import postGoogleForm from "@/utils/google-forms/postGoogleForm";
import { useI18n } from "@/stores/i18n/i18n";

export default function ContactForm() {
  const user = useAuthUser();
  const i18n = useI18n();

  const [description, setDescription] = createSignal("");

  const sendContactForm = () =>
    postGoogleForm("1FAIpQLSfkOHPQckiK5puxO8_J4evau3rAuCQwnL3QSuH61lO9KJWE4Q", {
      "entry.1931094736": user()?.email,
      "entry.897265685": description(),
    });

  return (
    <div class="contact-form">
      <AtomTextArea value={description()} onChange={setDescription} />
      <AtomButton onClick={sendContactForm}>{i18n.t("GLOBAL.NAVIGATION.SEND")}</AtomButton>
    </div>
  );
}
