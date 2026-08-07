import { beforeEach, describe, expect, it, vi } from "vitest";

const rawRequest = vi.hoisted(() => vi.fn());
const downloadBlob = vi.hoisted(() => vi.fn());

vi.mock("@/utils/http/client", () => ({ rawRequest }));
vi.mock("@/utils/download/downloadBlob", () => ({ downloadBlob }));

const { exportEventById } = await import(
  "@/services/secured/event-crud/eventCrud"
);

describe("exportEventById", () => {
  beforeEach(() => {
    rawRequest.mockReset();
    downloadBlob.mockReset();
  });

  it("requests the workbook as a blob and downloads it under the server file name", async () => {
    const blob = new Blob(["xlsx"]);
    rawRequest.mockResolvedValue({ blob, fileName: "Spring_Cup.xlsx" });

    await exportEventById("event-1");

    expect(rawRequest).toHaveBeenCalledWith({
      path: "/secured/events/event-1/export",
      responseType: "blob",
    });
    expect(downloadBlob).toHaveBeenCalledWith(blob, "Spring_Cup.xlsx");
  });

  it("falls back to a generic name when the response carries no file name", async () => {
    const blob = new Blob(["xlsx"]);
    rawRequest.mockResolvedValue({ blob });

    await exportEventById("event-1");

    expect(downloadBlob).toHaveBeenCalledWith(blob, "event.xlsx");
  });

  it("propagates the failure so the caller can surface it", async () => {
    rawRequest.mockRejectedValue(new Error("boom"));

    await expect(exportEventById("event-1")).rejects.toThrow("boom");
    expect(downloadBlob).not.toHaveBeenCalled();
  });
});
