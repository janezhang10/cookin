import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

function pageItemsToText(items: Array<unknown>) {
  const lines: string[] = [];
  let currentLine = "";
  let previousY: number | null = null;

  function finishLine() {
    const line = currentLine.trim();

    if (line) {
      lines.push(line);
    }

    currentLine = "";
  }

  for (const item of items) {
    if (
      typeof item !== "object" ||
      item === null ||
      !("str" in item) ||
      typeof item.str !== "string"
    ) {
      continue;
    }

    const transform =
      "transform" in item && Array.isArray(item.transform)
        ? item.transform
        : null;
    const y: number | null =
      transform && typeof transform[5] === "number" ? transform[5] : previousY;

    if (
      currentLine &&
      previousY !== null &&
      y !== null &&
      Math.abs(y - previousY) > 2
    ) {
      finishLine();
    }

    if (
      currentLine &&
      item.str &&
      !/\s$/.test(currentLine) &&
      !/^\s|^[,.;:!?)]/.test(item.str)
    ) {
      currentLine += " ";
    }

    currentLine += item.str;

    if ("hasEOL" in item && item.hasEOL === true) {
      finishLine();
    }

    previousY = y;
  }

  finishLine();
  return lines.join("\n");
}

export async function extractPdfText(data: Uint8Array) {
  const loadingTask = getDocument({
    data,
    useSystemFonts: true,
  });
  const document = await loadingTask.promise;
  const pages: string[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = pageItemsToText(content.items);

      if (text) {
        pages.push(text);
      }

      page.cleanup();
    }
  } finally {
    await loadingTask.destroy();
  }

  return pages.join("\n\n");
}
