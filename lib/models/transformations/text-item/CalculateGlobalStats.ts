import ToTextItemTransformation from '../ToTextItemTransformation'
import ParseResult from '../../ParseResult'
import WordFormat from '../../markdown/WordFormat'
import TextItem from '../../TextItem'
import Page from '../../Page'

interface FontInfo {
  name: string
  [key: string]: any
}

type FontMap = Map<string, FontInfo>

interface GlobalStats {
  mostUsedHeight: number
  mostUsedFont: string
  mostUsedDistance: number
  maxHeight: number
  maxHeightFont?: string
  fontToFormats: Map<string, string | undefined>
}

interface OccurrenceMap {
  [key: string]: number
}

export default class CalculateGlobalStats extends ToTextItemTransformation {
  private fontMap: FontMap

  constructor(fontMap: FontMap) {
    super('$1')
    this.fontMap = fontMap
  }

  transform(parseResult: ParseResult): ParseResult {
    // Parse heights
    const heightToOccurrence: OccurrenceMap = {}
    const fontToOccurrence: OccurrenceMap = {}
    let maxHeight = 0
    let maxHeightFont: string | undefined

    parseResult.pages.forEach(page => {
      page.items.forEach(item => {
        const textItem = item as unknown as TextItem
        if (!textItem.height) return
        heightToOccurrence[textItem.height] = heightToOccurrence[textItem.height] ? heightToOccurrence[textItem.height] + 1 : 1
        fontToOccurrence[textItem.font as string] = fontToOccurrence[textItem.font as string] ? fontToOccurrence[textItem.font as string] + 1 : 1
        if (textItem.height > maxHeight) {
          maxHeight = textItem.height
          maxHeightFont = textItem.font
        }
      })
    })

    const mostUsedHeight = parseInt(getMostUsedKey(heightToOccurrence))
    const mostUsedFont = getMostUsedKey(fontToOccurrence)

    // Parse line distances
    const distanceToOccurrence: OccurrenceMap = {}
    parseResult.pages.forEach(page => {
      let lastItemOfMostUsedHeight: TextItem | null = null
      page.items.forEach(item => {
        const textItem = item as unknown as TextItem
        if (textItem.height === mostUsedHeight && textItem.text.trim().length > 0) {
          if (lastItemOfMostUsedHeight && textItem.y !== lastItemOfMostUsedHeight.y) {
            const distance = lastItemOfMostUsedHeight.y - textItem.y
            if (distance > 0) {
              distanceToOccurrence[distance] = distanceToOccurrence[distance] ? distanceToOccurrence[distance] + 1 : 1
            }
          }
          lastItemOfMostUsedHeight = textItem
        } else {
          lastItemOfMostUsedHeight = null
        }
      })
    })

    const mostUsedDistance = parseInt(getMostUsedKey(distanceToOccurrence))
    const fontIdToName: string[] = []
    const fontToFormats = new Map<string, string | undefined>()

    this.fontMap.forEach((value, key) => {
      fontIdToName.push(key + ' = ' + value.name)
      const fontName = value.name.toLowerCase()
      let format;

      if (key === mostUsedFont) {
        format = null
      } else if (fontName.includes('bold') && (fontName.includes('oblique') || fontName.includes('italic'))) {
        format = WordFormat.BOLD_OBLIQUE
      } else if (fontName.includes('bold')) {
        format = WordFormat.BOLD
      } else if (fontName.includes('oblique') || fontName.includes('italic')) {
        format = WordFormat.OBLIQUE
      } else if (fontName === maxHeightFont) {
        format = WordFormat.BOLD
      }

      if (format) {
        fontToFormats.set(key, format.name)
      }
    })

    fontIdToName.sort()

    // Make a copy of the originals so all following transformation don't modify them
    const newPages: Page[] = parseResult.pages.map(page => {
      return {
        ...page,
        items: page.items.map(textItem => ({ ...textItem })),
      }
    })

    return new ParseResult({
      ...parseResult,
      pages: newPages,
      globals: {
        mostUsedHeight,
        mostUsedFont,
        mostUsedDistance,
        maxHeight,
        maxHeightFont,
        fontToFormats,
      } as GlobalStats,
      messages: [
        'Items per height: ' + JSON.stringify(heightToOccurrence),
        'Items per font: ' + JSON.stringify(fontToOccurrence),
        'Items per distance: ' + JSON.stringify(distanceToOccurrence),
        'Fonts:' + JSON.stringify(fontIdToName),
      ],
    })
  }
}

function getMostUsedKey(keyToOccurrence: OccurrenceMap): string {
  let maxOccurence = 0
  let maxKey: string | undefined

  Object.keys(keyToOccurrence).forEach((element) => {
    if (!maxKey || keyToOccurrence[element] > maxOccurence) {
      maxOccurence = keyToOccurrence[element]
      maxKey = element
    }
  })

  return maxKey || ''
} 
