import { inflateSync } from "node:zlib";

function decodePdfLiteral(value: string) {
  return value.replace(/\\([nrtbf()\\])/g, (_, char: string) => ({ n: "\n", r: "\r", t: "\t", b: "\b", f: "\f", "(": "(", ")": ")", "\\": "\\" }[char] || char)).replace(/\\([0-7]{1,3})/g, (_, octal: string) => String.fromCharCode(parseInt(octal, 8)));
}
function extractTextOperators(source: string) {
  const output: string[] = [];
  const regex = /\(((?:\\.|[^\\)])*)\)\s*Tj|\[((?:.|\n|\r)*?)\]\s*TJ/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(source)) !== null) {
    if (match[1] !== undefined) output.push(decodePdfLiteral(match[1]));
    else if (match[2]) {
      const parts = match[2].match(/\(((?:\\.|[^\\)])*)\)|<([0-9A-Fa-f\s]+)>/g) || [];
      for (const part of parts) {
        if (part.startsWith("(")) output.push(decodePdfLiteral(part.slice(1, -1)));
        else {
          const hex = part.slice(1, -1).replace(/\s/g, "");
          if (hex.length % 4 === 0 && hex.length >= 4) {
            const chars: string[] = [];
            for (let i = 0; i < hex.length; i += 4) chars.push(String.fromCharCode(parseInt(hex.slice(i, i + 4), 16)));
            output.push(chars.join(""));
          } else if (hex.length % 2 === 0) {
            const bytes = Buffer.from(hex, "hex");
            output.push(bytes.toString("latin1"));
          }
        }
      }
    }
  }
  return output.join(" ").replace(/\s+/g, " ").trim();
}

/** Best-effort extraction for text-based PDFs. Scanned/image-only PDFs require OCR and may return no text. */
export function extractPdfTextBestEffort(bytes: Buffer, maxChars = 12000) {
  const raw = bytes.toString("latin1");
  const sources = [raw];
  const streamRegex = /<<(.*?)>>\s*stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match: RegExpExecArray | null;
  while ((match = streamRegex.exec(raw)) !== null && sources.length < 80) {
    if (!/FlateDecode/.test(match[1])) continue;
    try {
      const compressed = Buffer.from(match[2], "latin1");
      sources.push(inflateSync(compressed).toString("latin1"));
    } catch {
      // Some PDF streams use filters or framing this lightweight extractor cannot decode.
    }
  }
  const text = sources.map(extractTextOperators).filter(Boolean).join(" ").replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]/g, " ").replace(/\s+/g, " ").trim();
  return text.slice(0, maxChars);
}
