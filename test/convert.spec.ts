import { describe, expect, it } from "vitest";

import fs from "fs";
import pdf2md from "../lib/pdf2md";
import path from "path";

describe("integration test: convert pdf to markdown", () => {
  it("should convert the pdf to markdown", async () => {
    const filePath = path.resolve(__dirname, "../examples/ExamplePdf.pdf");

    const pdfBuffer = new Uint8Array(fs.readFileSync(filePath));
    const text = await pdf2md(pdfBuffer);

    expect(text.includes(" ")).toBe(true);
  });
});
