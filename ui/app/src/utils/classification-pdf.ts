import type {
  StageEventClassificationItemResponseDTO,
  StageEventClassificationResponseDTO,
} from "@/services/fetch-stages/fetchStages.types";
import { formatDateTime } from "@/utils/date";

type Translate = (key: string, options?: Record<string, unknown>) => string;

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return String(value);
}

function sanitizeFileName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export async function exportClassificationPdf(
  classification: StageEventClassificationResponseDTO,
  competitors: StageEventClassificationItemResponseDTO[],
  t: Translate,
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;

  let cursorY = 14;
  doc.setFontSize(14);
  doc.text(classification.competitionName, centerX, cursorY, {
    align: "center",
  });

  cursorY += 7;
  doc.setFontSize(11);
  doc.text(classification.configuration.name, centerX, cursorY, {
    align: "center",
  });

  cursorY += 6;
  doc.setFontSize(12);
  doc.text(t("STAGES.CLASSIFICATION.PDF_TITLE"), centerX, cursorY, {
    align: "center",
  });

  cursorY += 8;
  doc.setFontSize(9);
  const metaLines: string[] = [
    `${t("STAGES.CLASSIFICATION.DISCIPLINE")}: ${classification.discipline.name}`,
  ];
  const judges = classification.obdx?.judges ?? [];
  if (judges.length) {
    metaLines.push(
      `${t("STAGES.CLASSIFICATION.JUDGES")}: ${judges
        .map((judge) => judge.name)
        .join(", ")}`,
    );
  }
  metaLines.push(
    `${t("STAGES.CLASSIFICATION.LAST_UPDATED")}: ${formatDateTime(
      classification.lastUpdated,
    )}`,
  );
  for (const line of metaLines) {
    doc.text(line, 14, cursorY);
    cursorY += 5;
  }

  const head = [
    [
      t("STAGES.CLASSIFICATION.POSITION"),
      t("STAGES.CLASSIFICATION.START_ORDER"),
      t("STAGES.CLASSIFICATION.HANDLER"),
      t("STAGES.CLASSIFICATION.DOG"),
      t("STAGES.CLASSIFICATION.CLUB"),
      t("STAGES.CLASSIFICATION.TOTAL"),
      t("STAGES.CLASSIFICATION.PERCENTAGE"),
    ],
  ];

  const body = competitors.map((competitor) => [
    competitor.notCompeting ? "-" : formatNumber(competitor.position),
    formatNumber(competitor.startOrder),
    competitor.handler ?? "",
    competitor.dog.name,
    competitor.team ?? "",
    formatNumber(competitor.totalScore),
    `${formatNumber(competitor.scoreRating)}%`,
  ]);

  autoTable(doc, {
    head,
    body,
    startY: cursorY + 2,
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { fillColor: [33, 33, 33] },
    margin: { left: 14, right: 14 },
  });

  const fileName = `${sanitizeFileName(
    `clasificacion-${classification.competitionName}-${classification.configuration.name}`,
  )}.pdf`;
  doc.save(fileName);
}
