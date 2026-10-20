
import { PDFParse } from "pdf-parse";

/**
 * Extract text from a text-based PDF.
 *
 * Scanned/image-only PDFs may return no text and require OCR.
 * Returns extracted text capped at maxChars.
 */
export async function extractPdfTextBestEffort(
  bytes: Buffer,
  maxChars = 12000,
): Promise<string> {
  let parser: PDFParse | undefined;

  try {
    parser = new PDFParse({
      data: new Uint8Array(bytes),
    });

    const result = await parser.getText();

    return (result.text || "")
      .replace(/\u0000/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
      .slice(0, maxChars);
  } catch (error) {
    console.error("PDF text extraction failed:", error);
    return "";
  } finally {
    if (parser) {
      await parser.destroy().catch((error) => {
        console.error("PDF parser cleanup failed:", error);
      });
    }
  }
}
