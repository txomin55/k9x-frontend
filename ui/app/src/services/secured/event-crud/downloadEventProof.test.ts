import { beforeEach, describe, expect, it, vi } from "vitest";

const rawRequest = vi.hoisted(() => vi.fn());
const downloadBlob = vi.hoisted(() => vi.fn());

vi.mock("@/utils/http/client", () => ({ rawRequest }));
vi.mock("@/utils/download/downloadBlob", () => ({ downloadBlob }));

const { downloadEventProof } =
  await import("@/services/secured/event-crud/eventCrud");

describe("downloadEventProof", () => {
  beforeEach(() => {
    rawRequest.mockReset();
    downloadBlob.mockReset();
  });

  it("requests the proof as a blob and downloads it under the server file name", async () => {
    const blob = new Blob(["pdf"]);
    rawRequest.mockResolvedValue({ blob, fileName: "Spring_Cup-Rex.pdf" });

    await downloadEventProof("event-1", "dog-1");

    expect(rawRequest).toHaveBeenCalledWith({
      path: "/secured/events/event-1/competitors/dog-1/event-proof",
      responseType: "blob",
    });
    expect(downloadBlob).toHaveBeenCalledWith(blob, "Spring_Cup-Rex.pdf");
  });

  /** Dog identifications are free text and can carry slashes, which would otherwise forge a new path. */
  it("encodes the competitor identification into the path", async () => {
    rawRequest.mockResolvedValue({ blob: new Blob(["pdf"]) });

    await downloadEventProof("event-1", "ES/123 456");

    expect(rawRequest).toHaveBeenCalledWith({
      path: "/secured/events/event-1/competitors/ES%2F123%20456/event-proof",
      responseType: "blob",
    });
  });

  it("falls back to a generic name when the response carries no file name", async () => {
    const blob = new Blob(["pdf"]);
    rawRequest.mockResolvedValue({ blob });

    await downloadEventProof("event-1", "dog-1");

    expect(downloadBlob).toHaveBeenCalledWith(blob, "event-proof.pdf");
  });

  it("propagates the failure so the caller can surface it", async () => {
    rawRequest.mockRejectedValue(new Error("boom"));

    await expect(downloadEventProof("event-1", "dog-1")).rejects.toThrow(
      "boom",
    );
    expect(downloadBlob).not.toHaveBeenCalled();
  });
});
