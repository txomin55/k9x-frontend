import AtomTextArea from "@lib/components/atoms/text-area/AtomTextArea";
import { createSignal } from "solid-js";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import { useAuthUser } from "../../../../stores/auth/auth";
import postGoogleForm from "@/utils/google-forms/postGoogleForm";

interface WrongLocationFormProps {
  stageId: string;
}

export default function WrongLocationForm(props: WrongLocationFormProps) {
  const user = useAuthUser();

  const [description, setDescription] = createSignal("");

  const sendWrongLocationForm = () =>
    postGoogleForm("1FAIpQLScikWNNKevmwQfpLMkFxkTtgHk3UKQFHXw8P_J-iWLvsTAw3w", {
      "entry.1931094736": user()?.email,
      "entry.897265685": description(),
      "entry.597886130": props.stageId,
    });

  return (
    <div class="wrong-location-form">
      <AtomTextArea value={description()} onChange={setDescription} />
      <AtomButton onClick={sendWrongLocationForm}>--Send</AtomButton>
    </div>
  );
}
