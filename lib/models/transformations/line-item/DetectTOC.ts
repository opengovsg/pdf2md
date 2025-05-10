import ToLineItemTransformation from '../ToLineItemTransformation'
import ParseResult from '../../ParseResult'
import LineItem from '../../LineItem'
import Word from '../../Word'
import HeadlineFinder from '../../HeadlineFinder'
import { REMOVED_ANNOTATION, ADDED_ANNOTATION } from '../../Annotation'
import BlockType from '../../markdown/BlockType'
import { headlineByLevel } from '../../markdown/BlockType'
import { isDigit, isNumber, wordMatch, hasOnly } from '../../../util/string-functions'
import Page from '../../Page'

interface TocLinkOptions {
  pageNumber: number
  lineItem: LineItem
  level?: number
}

interface HeadlineItems {
  lineIndex: number
  headlineItems: LineItem[]
}

interface HeightRange {
  min: number
  max: number
}

class TocLink {
  pageNumber: number
  lineItem: LineItem
  level: number

  constructor(options: TocLinkOptions) {
    this.pageNumber = options.pageNumber
    this.lineItem = options.lineItem
    this.level = options.level || 0
  }
}

// Find out how the TOC page link actually translates to the page.index
function detectPageMappingNumber(pages: Page[], tocLinks: TocLink[]): number | null {
  for (const tocLink of tocLinks) {
    const page = findPageWithHeadline(pages, tocLink.lineItem.text())
    if (page) {
      return page.index - tocLink.pageNumber
    }
  }
  return null
}

function findPageWithHeadline(pages: Page[], headline: string): Page | null {
  for (const page of pages) {
    if (findHeadlineItems(page, headline)) {
      return page
    }
  }
  return null
}

function findHeadlineItems(page: Page, headline: string): HeadlineItems | null {
  const headlineFinder = new HeadlineFinder({ headline })
  let lineIndex = 0
  for (const line of page.items) {
    const lineItem = line as LineItem
    const headlineItems = headlineFinder.consume(lineItem)
    if (headlineItems) {
      return { lineIndex, headlineItems }
    }
    lineIndex++
  }
  return null
}

function addHeadlineItems(page: Page, tocLink: TocLink, foundItems: HeadlineItems, headlineTypeToHeightRange: Record<string, HeightRange>): void {
  foundItems.headlineItems.forEach(item => (item.annotation = REMOVED_ANNOTATION))
  const headlineType = headlineByLevel(tocLink.level + 2)
  const headlineHeight = foundItems.headlineItems.reduce((max, item) => Math.max(max, item.height), 0)
  page.items.splice(foundItems.lineIndex + 1, 0, new LineItem({
    ...foundItems.headlineItems[0],
    words: tocLink.lineItem.words,
    height: headlineHeight,
    type: headlineType as any,
    annotation: ADDED_ANNOTATION,
  }))
  let range = headlineTypeToHeightRange[headlineType.name]
  if (range) {
    range.min = Math.min(range.min, headlineHeight)
    range.max = Math.max(range.max, headlineHeight)
  } else {
    headlineTypeToHeightRange[headlineType.name] = {
      min: headlineHeight,
      max: headlineHeight,
    }
  }
}

function findPageAndLineFromHeadline(pages: Page[], tocLink: TocLink, heightRange: HeightRange, fromPage: number, toPage: number): [number, number] {
  let fromPageIndex = fromPage - 1
  if (fromPageIndex < 0) {
    fromPageIndex = 0
  }

  let toPageIndex = toPage - 1
  if (toPageIndex >= pages.length) {
    toPageIndex = pages.length - 1
  }

  if (fromPageIndex > toPageIndex) {
    return [-1, -1]
  }

  for (let pageIndex = fromPageIndex; pageIndex <= toPageIndex; pageIndex++) {
    const page = pages[pageIndex]
    for (let lineIndex = 0; lineIndex < page.items.length; lineIndex++) {
      const item = page.items[lineIndex] as LineItem
      if (item.height && item.height >= heightRange.min && item.height <= heightRange.max) {
        return [pageIndex, lineIndex]
      }
    }
  }
  return [-1, -1]
}

class LinkLeveler {
  constructor() { }

  levelPageItems(tocLinks: TocLink[]): void {
    const uniqueXs = this.calculateUniqueX(tocLinks)
    if (uniqueXs.length > 1) {
      this.levelByXDiff(tocLinks)
      return
    }

    const uniqueFonts = this.calculateUniqueFonts(tocLinks)
    if (uniqueFonts.length > 1) {
      this.levelByFont(tocLinks)
      return
    }

    this.levelToZero(tocLinks)
  }

  levelByXDiff(tocLinks: TocLink[]): void {
    const uniqueXs = this.calculateUniqueX(tocLinks)
    uniqueXs.sort((a, b) => a - b)
    uniqueXs.forEach((x, i) => {
      tocLinks.filter(tocLink => tocLink.lineItem.x === x).forEach(tocLink => (tocLink.level = i))
    })
  }

  levelByFont(tocLinks: TocLink[]): void {
    const uniqueFonts = this.calculateUniqueFonts(tocLinks)
    uniqueFonts.forEach((font, i) => {
      tocLinks.filter(tocLink => {
        const lineItem = tocLink.lineItem as unknown as { font?: string }
        return lineItem.font === font
      }).forEach(tocLink => (tocLink.level = i))
    })
  }

  levelToZero(tocLinks: TocLink[]): void {
    tocLinks.forEach(tocLink => (tocLink.level = 0))
  }

  calculateUniqueX(tocLinks: TocLink[]): number[] {
    const xs = new Set<number>()
    tocLinks.forEach(tocLink => xs.add(tocLink.lineItem.x))
    return Array.from(xs)
  }

  calculateUniqueFonts(tocLinks: TocLink[]): string[] {
    const fonts = new Set<string>()
    tocLinks.forEach(tocLink => {
      const lineItem = tocLink.lineItem as unknown as { font?: string }
      if (lineItem.font) {
        fonts.add(lineItem.font)
      }
    })
    return Array.from(fonts)
  }
}

// Detect table of contents pages plus linked headlines
export default class DetectTOC extends ToLineItemTransformation {
  constructor() {
    super('Detect TOC')
  }

  transform(parseResult: ParseResult): ParseResult {
    const tocPages: number[] = []
    const maxPagesToEvaluate = Math.min(20, parseResult.pages.length)
    const linkLeveler = new LinkLeveler()

    const tocLinks: TocLink[] = []
    let lastTocPage: Page | undefined
    let headlineItem: LineItem | undefined

    parseResult.pages.slice(0, maxPagesToEvaluate).forEach(page => {
      let lineItemsWithDigits = 0
      const unknownLines = new Set<LineItem>()
      const pageTocLinks: TocLink[] = []
      let lastWordsWithoutNumber: Word[] | undefined
      let lastLine: LineItem | undefined

      // find lines with words containing only "." ...
      const tocLines = page.items.filter(line => {
        const lineItem = line as LineItem
        return lineItem.words.some(word => hasOnly(word.string, '.'))
      })

      // ... and ending with a number per page
      tocLines.forEach(line => {
        const lineItem = line as LineItem
        let words = lineItem.words.filter(word => !hasOnly(word.string, '.'))
        const digits: string[] = []

        while (words.length > 0 && isNumber(words[words.length - 1].string)) {
          const lastWord = words.pop()!
          digits.unshift(lastWord.string)
        }

        if (digits.length === 0 && words.length > 0) {
          const lastWord = words[words.length - 1]
          while (isDigit(lastWord.string.charCodeAt(lastWord.string.length - 1))) {
            digits.unshift(lastWord.string.charAt(lastWord.string.length - 1))
            lastWord.string = lastWord.string.substring(0, lastWord.string.length - 1)
          }
        }
        const endsWithDigit = digits.length > 0
        if (endsWithDigit) {
          if (lastWordsWithoutNumber) { // 2-line item ?
            words.push(...lastWordsWithoutNumber)
            lastWordsWithoutNumber = undefined
          }
          pageTocLinks.push(new TocLink({
            pageNumber: parseInt(digits.join('')),
            lineItem: new LineItem({ ...lineItem, words }),
          }))
          lineItemsWithDigits++
        } else {
          if (!headlineItem) {
            headlineItem = lineItem
          } else {
            if (lastWordsWithoutNumber) {
              unknownLines.add(lastLine!)
            }
            lastWordsWithoutNumber = words
            lastLine = lineItem
          }
        }
      })

      // page has been processed
      if (lineItemsWithDigits * 100 / page.items.length > 75) {
        tocPages.push(page.index + 1)
        lastTocPage = page
        linkLeveler.levelPageItems(pageTocLinks)
        tocLinks.push(...pageTocLinks)

        const newBlocks: LineItem[] = []
        page.items.forEach((line) => {
          const lineItem = line as LineItem
          if (!unknownLines.has(lineItem)) {
            lineItem.annotation = REMOVED_ANNOTATION
          }
          newBlocks.push(lineItem)
          if (line === headlineItem) {
            newBlocks.push(new LineItem({
              ...lineItem,
              type: (BlockType as any).H2,
              annotation: ADDED_ANNOTATION,
            }))
          }
        })
        page.items = newBlocks as any
      } else {
        headlineItem = undefined
      }
    })

    // all pages have been processed
    const foundHeadlines = tocLinks.length
    const notFoundHeadlines: TocLink[] = []
    const foundBySize: TocLink[] = []
    const headlineTypeToHeightRange: Record<string, HeightRange> = {} // H1={min:23, max:25}

    if (tocPages.length > 0 && lastTocPage) {
      // Add TOC items
      tocLinks.forEach(tocLink => {
        lastTocPage!.items.push(new LineItem({
          words: [new Word({
            string: ' '.repeat(tocLink.level * 3) + '-',
          })].concat(tocLink.lineItem.words),
          type: (BlockType as any).TOC,
          annotation: ADDED_ANNOTATION,
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        }))
      })

      // Add linked headers
      const pageMapping = detectPageMappingNumber(parseResult.pages.filter(page => page.index > lastTocPage!.index), tocLinks)
      tocLinks.forEach(tocLink => {
        let linkedPage = parseResult.pages[tocLink.pageNumber + (pageMapping || 0)]
        let foundHealineItems
        if (linkedPage) {
          foundHealineItems = findHeadlineItems(linkedPage, tocLink.lineItem.text())
          if (!foundHealineItems) { // pages are off by 1 ?
            linkedPage = parseResult.pages[tocLink.pageNumber + (pageMapping || 0) + 1]
            if (linkedPage) {
              foundHealineItems = findHeadlineItems(linkedPage, tocLink.lineItem.text())
            }
          }
        }
        if (foundHealineItems) {
          addHeadlineItems(linkedPage, tocLink, foundHealineItems, headlineTypeToHeightRange)
        } else {
          notFoundHeadlines.push(tocLink)
        }
      })

      // Try to find linked headers by height
      let fromPage = lastTocPage.index + 2
      let lastNotFound: TocLink[] = []
      const rollupLastNotFound = (currentPageNumber: number) => {
        if (lastNotFound.length > 0) {
          lastNotFound.forEach(notFoundTocLink => {
            const headlineType = headlineByLevel(notFoundTocLink.level + 2)
            const heightRange = headlineTypeToHeightRange[headlineType.name]
            if (heightRange) {
              const [pageIndex, lineIndex] = findPageAndLineFromHeadline(parseResult.pages, notFoundTocLink, heightRange, fromPage, currentPageNumber)
              if (lineIndex > -1) {
                const page = parseResult.pages[pageIndex]
                const lineItem = page.items[lineIndex] as LineItem
                lineItem.annotation = REMOVED_ANNOTATION
                page.items.splice(lineIndex + 1, 0, new LineItem({
                  ...notFoundTocLink.lineItem,
                  type: headlineType as any,
                  annotation: ADDED_ANNOTATION,
                }))
                foundBySize.push(notFoundTocLink)
              }
            }
          })
          lastNotFound = []
        }
      }
      if (notFoundHeadlines.length > 0) {
        tocLinks.forEach(tocLink => {
          if (notFoundHeadlines.includes(tocLink)) {
            lastNotFound.push(tocLink)
          } else {
            rollupLastNotFound(tocLink.pageNumber)
            fromPage = tocLink.pageNumber
          }
        })
        if (lastNotFound.length > 0) {
          rollupLastNotFound(parseResult.pages.length)
        }
      }
    }

    const messages: string[] = []
    messages.push('Detected ' + tocPages.length + ' table of content pages')
    if (tocPages.length > 0) {
      messages.push('TOC headline heights: ' + JSON.stringify(headlineTypeToHeightRange))
      messages.push('Found TOC headlines: ' + (foundHeadlines - notFoundHeadlines.length + foundBySize.length) + '/' + foundHeadlines)
    }
    if (notFoundHeadlines.length > 0) {
      messages.push('Found TOC headlines (by size): ' + foundBySize.map(tocLink => tocLink.lineItem.text()))
      messages.push('Missing TOC headlines: ' + notFoundHeadlines.filter(fTocLink => !foundBySize.includes(fTocLink)).map(tocLink => tocLink.lineItem.text() + '=>' + tocLink.pageNumber))
    }

    return new ParseResult({
      ...parseResult,
      globals: {
        ...parseResult.globals,
        tocPages,
        headlineTypeToHeightRange,
      },
      messages,
    })
  }
} 
