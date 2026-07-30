import { extractPdfText } from "@/lib/recipe/extractPdfText";

export const runtime = "nodejs";

const maximumPdfSize = 8 * 1024 * 1024;

function isPdfFile(file: File, bytes: Uint8Array) {
  const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf");
  const hasPdfType = file.type === "application/pdf";
  const hasPdfSignature =
    bytes.length >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";

  return (hasPdfExtension || hasPdfType) && hasPdfSignature;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf");

    if (!(file instanceof File)) {
      return Response.json(
        { error: "Choose a PDF file to import." },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return Response.json({ error: "That PDF is empty." }, { status: 400 });
    }

    if (file.size > maximumPdfSize) {
      return Response.json(
        { error: "Choose a PDF smaller than 8 MB." },
        { status: 413 },
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());

    if (!isPdfFile(file, bytes)) {
      return Response.json(
        { error: "The selected file does not appear to be a valid PDF." },
        { status: 400 },
      );
    }

    const text = await extractPdfText(bytes);

    if (text.trim().length < 20) {
      return Response.json(
        {
          error:
            "No readable text was found. Scanned or photographed PDFs need OCR, which is not supported yet.",
        },
        { status: 422 },
      );
    }

    return Response.json({ text });
  } catch {
    return Response.json(
      {
        error:
          "This PDF could not be read. It may be damaged or password-protected.",
      },
      { status: 422 },
    );
  }
}
