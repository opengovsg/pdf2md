import { parse } from './util/pdf'
import { makeTransformations, transform } from './util/transformations'
import type { PDFDocumentProxy, DocumentInitParameters, TypedArray, TextItem } from 'pdfjs-dist/types/src/display/api'

interface Page {
  index: number;
  items: TextItem[];
}
interface Font {
  ids: Set<string>;
  map: Map<string, any>;
}
interface Metadata {
  info: object;
  metadata: {
    parsedData: any;
    rawData: any;
    getRaw: () => any;
    get: (name: any) => any;
    getAll: () => any;
    has: (name: any) => any;
  };
}

export default async function pdf2md(
  pdfBuffer: string | URL | TypedArray | ArrayBuffer | DocumentInitParameters,
  callbacks?: {
    metadataParsed?: (metadata: Metadata) => void;
    pageParsed?: (pages: Page[]) => void;
    fontParsed?: (font: Font) => void;
    documentParsed?: (document: PDFDocumentProxy, pages: Page[]) => void;
  }
): Promise<string> {
  const result = await parse(pdfBuffer, callbacks)
  const { fonts, pages } = result
  const transformations = makeTransformations(fonts.map)
  const parseResult = transform(pages, transformations)
  const text = parseResult.pages
    .map((page: any) => page.items.join('\n') + '\n')
    .join('')
  return text
} 
