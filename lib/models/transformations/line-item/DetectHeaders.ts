import ToLineItemTransformation from '../ToLineItemTransformation'
import ParseResult from '../../ParseResult'
import Page from '../../Page'
import LineItem from '../../LineItem'
import PageItem from '../../PageItem'
import TextItem from '../../TextItem'
import { DETECTED_ANNOTATION } from '../../Annotation'
import BlockType from '../../markdown/BlockType'
import { headlineByLevel } from '../../markdown/BlockType'
import { isListItem } from '../../../util/string-functions'

interface HeightRange {
  min: number
  max: number
}

interface Globals {
  tocPages: Page[]
  headlineTypeToHeightRange: Record<string, HeightRange>
  mostUsedHeight: number
  mostUsedDistance: number
  mostUsedFont: string
  maxHeight: number
}

function findPagesWithMaxHeight(pages: Page[], maxHeight: number): Set<Page> {
  const maxHeaderPagesSet = new Set<Page>()
  pages.forEach(page => {
    page.items.forEach(item => {
      const lineItem = item as LineItem
      if (!lineItem.type && lineItem.height === maxHeight) {
        maxHeaderPagesSet.add(page)
      }
    })
  })
  return maxHeaderPagesSet
}

// Detect headlines based on heights
export default class DetectHeaders extends ToLineItemTransformation {
  constructor() {
    super('Detect Headers')
  }

  transform(parseResult: ParseResult): ParseResult {
    const globals = parseResult.globals as Globals
    const { tocPages, headlineTypeToHeightRange, mostUsedHeight, mostUsedDistance, mostUsedFont, maxHeight } = globals
    const hasToc = tocPages.length > 0
    let detectedHeaders = 0

    // Handle title pages
    const pagesWithMaxHeight = findPagesWithMaxHeight(parseResult.pages, maxHeight)
    const min2ndLevelHeaderHeigthOnMaxPage = mostUsedHeight + ((maxHeight - mostUsedHeight) / 4)
    pagesWithMaxHeight.forEach(titlePage => {
      titlePage.items.forEach(item => {
        const lineItem = item as LineItem
        const height = lineItem.height
        if (!lineItem.type && height > min2ndLevelHeaderHeigthOnMaxPage) {
          if (height === maxHeight) {
            lineItem.type = (BlockType as any).H1
          } else {
            lineItem.type = (BlockType as any).H2
          }
          lineItem.annotation = DETECTED_ANNOTATION
          detectedHeaders++
        }
      })
    })

    if (hasToc) { // Use existing headline heights to find additional headlines
      const headlineTypes = Object.keys(headlineTypeToHeightRange)
      headlineTypes.forEach(headlineType => {
        const range = headlineTypeToHeightRange[headlineType]
        if (range.max > mostUsedHeight) { // use only very clear headlines, only use max
          parseResult.pages.forEach(page => {
            page.items.forEach(item => {
              const lineItem = item as LineItem
              if (!lineItem.type && lineItem.height === range.max) {
                lineItem.annotation = DETECTED_ANNOTATION
                lineItem.type = BlockType.enumValueOf(headlineType)
                detectedHeaders++
              }
            })
          })
        }
      })
    } else { // Categorize headlines by the text heights
      const heights: number[] = []
      let lastHeight: number | undefined
      parseResult.pages.forEach(page => {
        page.items.forEach(item => {
          const lineItem = item as LineItem
          if (!lineItem.type && lineItem.height > mostUsedHeight && !isListItem(lineItem.text())) {
            if (!heights.includes(lineItem.height) && (!lastHeight || lastHeight > lineItem.height)) {
              heights.push(lineItem.height)
            }
          }
        })
      })
      heights.sort((a, b) => b - a)

      heights.forEach((height, i) => {
        const headlineLevel = i + 2
        if (headlineLevel <= 6) {
          const headlineType = headlineByLevel(2 + i)
          parseResult.pages.forEach(page => {
            page.items.forEach(item => {
              const lineItem = item as LineItem
              if (!lineItem.type && lineItem.height === height && !isListItem(lineItem.text())) {
                detectedHeaders++
                lineItem.annotation = DETECTED_ANNOTATION
                lineItem.type = headlineType
              }
            })
          })
        }
      })
    }

    // find headlines which have paragraph height
    let smallesHeadlineLevel = 1
    parseResult.pages.forEach(page => {
      page.items.forEach(item => {
        const lineItem = item as LineItem
        if (lineItem.type && (lineItem.type as unknown as BlockType).headline) {
          smallesHeadlineLevel = Math.max(smallesHeadlineLevel, (lineItem.type as unknown as BlockType).headlineLevel || 1)
        }
      })
    })
    if (smallesHeadlineLevel < 6) {
      const nextHeadlineType = headlineByLevel(smallesHeadlineLevel + 1)
      parseResult.pages.forEach(page => {
        let lastItem: LineItem | undefined
        page.items.forEach(item => {
          const lineItem = item as LineItem
          const textItem = item as unknown as TextItem
          if (!lineItem.type &&
            lineItem.height === mostUsedHeight &&
            textItem.font !== mostUsedFont &&
            (!lastItem || lastItem.y < lineItem.y || (lastItem.type && (lastItem.type as unknown as BlockType).headline) || (lastItem.y - lineItem.y > mostUsedDistance * 2)) &&
            lineItem.text() === lineItem.text().toUpperCase()
          ) {
            detectedHeaders++
            lineItem.annotation = DETECTED_ANNOTATION
            lineItem.type = nextHeadlineType
          }
          lastItem = lineItem
        })
      })
    }

    return new ParseResult({
      ...parseResult,
      messages: [
        'Detected ' + detectedHeaders + ' headlines.',
      ],
    })
  }
} 
