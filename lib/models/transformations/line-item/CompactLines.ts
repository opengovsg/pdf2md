import ToLineItemTransformation from '../ToLineItemTransformation'
import ParseResult from '../../ParseResult'
import LineItem from '../../LineItem'
import TextItem from '../../TextItem'
import TextItemLineGrouper from '../../TextItemLineGrouper'
import LineConverter, { FontToFormatsMap } from '../../LineConverter'
import BlockType from '../../markdown/BlockType'
import { REMOVED_ANNOTATION, ADDED_ANNOTATION } from '../../Annotation'

interface FootnoteLink {
  footnoteLink: number
  page: number
}

interface Footnote {
  footnote: string
  page: number
}

interface GlobalStats {
  mostUsedDistance: number
  fontToFormats: FontToFormatsMap
  [key: string]: any
}

// gathers text items on the same y line to one line item
export default class CompactLines extends ToLineItemTransformation {
  constructor() {
    super('Compact To Lines')
  }

  transform(parseResult: ParseResult): ParseResult {
    const globals = parseResult.globals as GlobalStats
    const { mostUsedDistance, fontToFormats } = globals
    const foundFootnotes: Footnote[] = []
    const foundFootnoteLinks: FootnoteLink[] = []
    let linkCount = 0
    let formattedWords = 0

    const lineGrouper = new TextItemLineGrouper({
      mostUsedDistance: mostUsedDistance,
    })
    const lineCompactor = new LineConverter(fontToFormats)

    parseResult.pages.forEach(page => {
      if (page.items.length > 0) {
        const lineItems: LineItem[] = []
        const textItems = page.items as unknown as TextItem[]
        const textItemsGroupedByLine = lineGrouper.group(textItems)

        textItemsGroupedByLine.forEach(lineTextItems => {
          const lineItem = lineCompactor.compact(lineTextItems)

          if (lineTextItems.length > 1) {
            lineItem.annotation = ADDED_ANNOTATION
            lineTextItems.forEach(item => {
              item.annotation = REMOVED_ANNOTATION
              lineItems.push(new LineItem({
                ...item,
              }))
            })
          }

          if (lineItem.words.length === 0) {
            lineItem.annotation = REMOVED_ANNOTATION
          }

          lineItems.push(lineItem)

          if (lineItem.parsedElements?.formattedWords) {
            formattedWords += lineItem.parsedElements.formattedWords
          }

          if (lineItem.parsedElements?.containLinks) {
            linkCount++
          }

          if (lineItem.parsedElements && lineItem.parsedElements.footnoteLinks && lineItem.parsedElements.footnoteLinks.length > 0) {
            const footnoteLinks = lineItem.parsedElements.footnoteLinks.map(footnoteLink => ({
              footnoteLink: parseInt(footnoteLink.id),
              page: page.index + 1
            }))
            foundFootnoteLinks.push(...footnoteLinks)
          }

          if (lineItem.parsedElements && lineItem.parsedElements.footnotes && lineItem.parsedElements.footnotes.length > 0) {
            lineItem.type = (BlockType as any).FOOTNOTES
            const footnotes = lineItem.parsedElements.footnotes.map(footnote => ({
              footnote: footnote.id,
              page: page.index + 1
            }))
            foundFootnotes.push(...footnotes)
          }
        })

        page.items = lineItems
      }
    })

    return new ParseResult({
      ...parseResult,
      messages: [
        'Detected ' + formattedWords + ' formatted words',
        'Found ' + linkCount + ' links',
        'Detected ' + foundFootnoteLinks.length + ' footnotes links',
        'Detected ' + foundFootnotes.length + ' footnotes',
      ],
    })
  }
} 
