import AtomTextArea from "@lib/components/atoms/text-area/AtomTextArea";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import { createSignal } from "solid-js";
import { useAuthUser } from "@/stores/auth/auth";
import postGoogleForm from "@/utils/google-forms/postGoogleForm";
import { useI18n } from "@/stores/i18n/i18n";
import { showToast } from "@/stores/toast/toast";

/**
 * Dedicated Google Form for reporting errors in extracted data. Kept separate from the generic contact form
 * so the replies carry the competition/trial/event the reader was looking at when they spotted the mistake.
 */
const FORM_ID = "1FAIpQLScSPvDGDUn9suXtoB4AOXomp8hnNrUHHMzcux0aYZL8cluD3Q";

export interface ExtractionReportFormProps {
  /** Name of what is being reported — shown in the dialog, never sent. */
  context: string;
  /** Id of the extraction the data came from. This is what the report carries: names are ambiguous, ids are not. */
  extractionId: string;
  onClose: () => void;
}

export default function ExtractionReportForm(props: ExtractionReportFormProps) {
  const user = useAuthUser();
  const i18n = useI18n();

  const [description, setDescription] = createSignal("");

  const sendReport = async () => {
    await postGoogleForm(FORM_ID, {
      "entry.946948767": user()?.email,
      "entry.467584706": props.extractionId,
      "entry.897265685": description(),
    });
    props.onClose();
    showToast(i18n.t("GLOBAL.FORM.SENT"));
  };

  return (
    <div class="extraction-report-form">
      <span class="text-caption-md">
        {i18n.t("COMMON.EXTRACTION_BANNER.FORM_HINT")}
      </span>
      <span class="extraction-report-form__context text-caption-lg">
        {props.context}
      </span>
      <AtomTextArea
        label={i18n.t("COMMON.EXTRACTION_BANNER.FORM_DESCRIPTION")}
        value={description()}
        onChange={setDescription}
        rows={5}
      />
      <AtomButton disabled={!description().trim()} onClick={sendReport}>
        {i18n.t("GLOBAL.NAVIGATION.SEND")}
      </AtomButton>
    </div>
  );
}
