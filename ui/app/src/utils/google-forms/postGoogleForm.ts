type GoogleFormValue = string | number | boolean | null | undefined;

export type GoogleFormPayload = Record<string, GoogleFormValue>;

const serializeGoogleFormPayload = (formPayload: GoogleFormPayload) => {
  const body = new URLSearchParams();

  Object.entries(formPayload).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    body.set(key, String(value));
  });

  body.set("submissionTimestamp", String(Date.now()));

  return body.toString();
};

const buildGoogleFormUrl = (id: string) =>
  `https://docs.google.com/forms/d/e/${id}/formResponse`;
export default function postGoogleForm(
  formIdentifier: string,
  formPayload: GoogleFormPayload,
) {
  return fetch(buildGoogleFormUrl(formIdentifier), {
    body: serializeGoogleFormPayload(formPayload),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    mode: "no-cors",
    method: "POST",
  });
}
