import AtomTextArea from "@lib/components/atoms/text-area/AtomTextArea";
import { createSignal } from "solid-js";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import { useAuthUser } from "@/stores/auth/auth";
import postGoogleForm from "@/utils/google-forms/postGoogleForm";
import AtomInput from "@lib/components/atoms/input/AtomInput";

export default function OrganizerForm() {
  const user = useAuthUser();

  const [description, setDescription] = createSignal("");
  const [organizerName, setOrganizerName] = createSignal("");

  const sendOrganizerForm = () =>
    postGoogleForm("1FAIpQLScUMXJO8wACFCg4qpcAP5IsfWG5BjeJ5MvhomrgVs-Fh9czUA", {
      "entry.1603237692": organizerName(),
      "entry.1931094736": user()?.email,
      "entry.897265685": description(),
    });

  return (
    <div class="organizer-form">
      <AtomInput value={organizerName()} onChange={setOrganizerName} />
      <AtomTextArea value={description()} onChange={setDescription} />
      <AtomButton onClick={sendOrganizerForm}>--Send</AtomButton>
    </div>
  );
}
