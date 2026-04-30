import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import postGoogleForm from "@/utils/google-forms/postGoogleForm";

const fetchMock = vi.fn();

describe("postGoogleForm", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts to formResponse with a url-encoded payload", async () => {
    vi.spyOn(Date, "now").mockReturnValue(42);

    await postGoogleForm("abc123", {
      userId: "user@example.com",
      justification: "Need access",
    });

    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://docs.google.com/forms/d/e/abc123/formResponse");
    expect(init).toMatchObject({
      method: "POST",
      mode: "no-cors",
    });

    expect(init.body).toBe(
      "userId=user%40example.com&justification=Need+access&submissionTimestamp=42",
    );
    expect(init.headers).toMatchObject({
      "Content-Type": "application/x-www-form-urlencoded",
    });
  });
});
