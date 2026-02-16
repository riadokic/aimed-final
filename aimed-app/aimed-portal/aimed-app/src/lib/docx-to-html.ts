import mammoth from "mammoth";

/**
 * Convert a base64-encoded .docx file to HTML.
 * Preserves {{placeholder}} markers for Discovery Engine analysis.
 */
export async function convertDocxToHtml(base64: string): Promise<string> {
  const buffer = Buffer.from(base64, "base64");
  const result = await mammoth.convertToHtml({ buffer });
  return result.value;
}
