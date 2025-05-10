import { getDocumentProxy, getResolvedPDFJS } from 'unpdf'
import { findPageNumbers, findFirstPage, removePageNumber } from './page-number-functions'
import TextItem from '../models/TextItem'
import Page from '../models/Page'
import type { TextContent, TextItem as PDFTextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api'

const NO_OP = () => { }

export async function parse(
  pdfBuffer: string | URL | Uint8Array | ArrayBuffer | any,
  callbacks?: {
    metadataParsed?: (metadata: any) => void
    pageParsed?: (pages: any[]) => void
    fontParsed?: (font: any) => void
    documentParsed?: (document: any, pages: any[]) => void
  }
): Promise<any> {
  const { metadataParsed, pageParsed, fontParsed, documentParsed } = {
    metadataParsed: NO_OP,
    pageParsed: NO_OP,
    fontParsed: NO_OP,
    documentParsed: NO_OP,
    ...(callbacks || {})
  }

  const pdfDocument = await getDocumentProxy(new Uint8Array(pdfBuffer), {
    verbosity: 0
  })

  const metadata = await pdfDocument.getMetadata()
  metadataParsed(metadata)

  const pages = [...Array(pdfDocument.numPages).keys()].map(
    index => new Page({ index })
  )

  documentParsed(pdfDocument, pages)

  const fonts = {
    ids: new Set(),
    map: new Map()
  }

  let pageIndexNumMap: Record<number, number[]> = {}
  let firstPage: { pageIndex: number, pageNum: number } | undefined
  for (let j = 1; j <= pdfDocument.numPages; j++) {
    const page = await pdfDocument.getPage(j)
    const textContent = await page.getTextContent()

    if (Object.keys(pageIndexNumMap).length < 10) {
      pageIndexNumMap = findPageNumbers(pageIndexNumMap, page.pageNumber - 1, textContent.items as PDFTextItem[])
    } else {
      firstPage = findFirstPage(pageIndexNumMap)
      break
    }
  }

  let pageNum = firstPage ? firstPage.pageNum : 0
  for (let j = 1; j <= pdfDocument.numPages; j++) {
    const page = await pdfDocument.getPage(j)

    // Trigger the font retrieval for the page
    await page.getOperatorList()

    const scale = 1.0
    const viewport = page.getViewport({ scale })
    let textContent = await page.getTextContent()
    if (firstPage && page._pageIndex >= firstPage.pageIndex) {
      textContent = removePageNumber(textContent, pageNum)
      pageNum++
    }
    const pdfjs = await getResolvedPDFJS()
    const textItems = textContent.items.map((item: PDFTextItem) => {
      const tx = pdfjs.Util.transform(
        viewport.transform,
        (item as PDFTextItem).transform
      )
      const fontHeight = Math.sqrt((tx[2] * tx[2]) + (tx[3] * tx[3]))
      const dividedHeight = (item as PDFTextItem).height / fontHeight
      return new TextItem({
        x: Math.round(item.transform[4]),
        y: Math.round(item.transform[5]),
        width: Math.round(item.width),
        height: Math.round(dividedHeight <= 1 ? item.height : dividedHeight),
        text: item.str,
        font: item.fontName
      })
    })
    pages[page.pageNumber - 1].items = textItems
    pageParsed(pages)

    const fontIds = new Set(textItems.map((t: any) => t.font))
    for (const fontId of fontIds) {
      if (!fonts.ids.has(fontId) && fontId.startsWith('g_d')) {
        // Depending on which build of pdfjs-dist is used, the
        // WorkerTransport containing the font objects is either transport or _transport
        const transport = (pdfDocument as any)._transport
        const font = await new Promise(
          resolve => transport.commonObjs.get(fontId, resolve)
        )
        fonts.ids.add(fontId)
        fonts.map.set(fontId, font)
        fontParsed(fonts)
      }
    }
  }
  return {
    fonts,
    metadata,
    pages,
    pdfDocument
  }
} 
