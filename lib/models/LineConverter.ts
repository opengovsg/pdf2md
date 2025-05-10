import TextItem from './TextItem'
import Word from './Word'
import WordType from './markdown/WordType'
import WordFormat from './markdown/WordFormat'
import LineItem from './LineItem'
import StashingStream from './StashingStream'
import ParsedElements, { FootnoteLink, Footnote } from './ParsedElements'
import { isNumber, isListItemCharacter } from '../util/string-functions'
import { sortByX } from '../util/page-item-functions'

// Font to format mapping type
export type FontToFormatsMap = Map<string | undefined, string | undefined>

// Converts text items which have been grouped to a line (through TextItemLineGrouper) to a single LineItem doing inline transformations like
// 'whitespace removal', bold/emphasis annotation, link-detection, etc..
export default class LineConverter {
  private fontToFormats: FontToFormatsMap

  constructor(fontToFormats: FontToFormatsMap) {
    this.fontToFormats = fontToFormats
  }

  // returns a CombineResult
  compact(textItems: TextItem[]): LineItem {
    // we can't trust order of occurence, esp. footnoteLinks like to come last
    sortByX(textItems)

    const wordStream = new WordDetectionStream(this.fontToFormats)
    wordStream.consumeAll(textItems.map(item => new TextItem({ ...item })))
    const words = wordStream.complete() as Word[]

    let maxHeight = 0
    let widthSum = 0
    textItems.forEach(item => {
      maxHeight = Math.max(maxHeight, item.height)
      widthSum += item.width
    })

    // Convert primitive arrays to required object arrays
    const footnoteLinks: FootnoteLink[] = wordStream.footnoteLinks.map(id => ({ id: id.toString() }))
    const footnotes: Footnote[] = wordStream.footnotes.map(id => ({ id: id.toString() }))

    return new LineItem({
      x: textItems[0].x,
      y: textItems[0].y,
      height: maxHeight,
      width: widthSum,
      words: words,
      parsedElements: new ParsedElements({
        footnoteLinks: footnoteLinks,
        footnotes: footnotes,
        containLinks: wordStream.containLinks,
        formattedWords: wordStream.formattedWords,
      }),
    })
  }
}

class WordDetectionStream extends StashingStream<TextItem | Word> {
  private fontToFormats: FontToFormatsMap
  footnoteLinks: number[]
  footnotes: string[]
  formattedWords: number
  containLinks: boolean
  private stashedNumber: boolean
  private firstY?: number
  private currentItem?: TextItem

  constructor(fontToFormats: FontToFormatsMap) {
    super()
    this.fontToFormats = fontToFormats
    this.footnoteLinks = []
    this.footnotes = []
    this.formattedWords = 0
    this.containLinks = false
    this.stashedNumber = false
  }

  protected shouldStash(item: TextItem): boolean {
    if (!this.firstY) {
      this.firstY = item.y
    }
    this.currentItem = item
    return true
  }

  protected onPushOnStash(item: TextItem): void {
    if ('text' in item) {
      this.stashedNumber = isNumber(item.text.trim())
    }
  }

  protected doMatchesStash(lastItem: TextItem, item: TextItem): boolean {
    if (!('font' in lastItem) || !('font' in item)) {
      return false
    }
    const lastItemFormat = this.fontToFormats.get(lastItem.font)
    const itemFormat = this.fontToFormats.get(item.font)
    if (lastItemFormat !== itemFormat) {
      return false
    }
    const itemIsANumber = 'text' in item && isNumber(item.text.trim())
    return this.stashedNumber === itemIsANumber
  }

  protected doFlushStash(stash: (TextItem | Word)[], results: (TextItem | Word)[]): void {
    const textItems = stash.filter(item => 'text' in item) as TextItem[]

    if (this.stashedNumber) {
      const joinedNumber = textItems.map(item => item.text)
        .join('')
        .trim()
      if (textItems[0].y > (this.firstY || 0)) { // footnote link
        results.push(new Word({
          string: `${joinedNumber}`,
          type: WordType.FOOTNOTE_LINK,
        }))
        this.footnoteLinks.push(parseInt(joinedNumber))
      } else if (this.currentItem && this.currentItem.y < textItems[0].y) { // footnote
        results.push(new Word({
          string: `${joinedNumber}`,
          type: WordType.FOOTNOTE,
        }))
        this.footnotes.push(joinedNumber)
      } else {
        this.copyStashItemsAsText(textItems, results)
      }
    } else {
      this.copyStashItemsAsText(textItems, results)
    }
  }

  private copyStashItemsAsText(stash: TextItem[], results: (TextItem | Word)[]): void {
    const format = this.fontToFormats.get(stash[0].font)
    const words = this.itemsToWords(stash, format)
    results.push(...words)
  }

  private itemsToWords(items: TextItem[], formatName?: string): Word[] {
    const combinedText = combineText(items)
    const words = combinedText.split(' ')
    const format = formatName ? WordFormat.enumValueOf(formatName) : undefined
    return words.filter(w => w.trim().length > 0).map(word => {
      let type;
      let wordText = word
      if (word.startsWith('http:')) {
        this.containLinks = true
        type = WordType.LINK
      } else if (word.startsWith('www.')) {
        this.containLinks = true
        wordText = `http://${word}`
        type = WordType.LINK
      }

      if (format) {
        this.formattedWords++
      }
      return new Word({ string: wordText, type, format })
    })
  }
}

function combineText(textItems: TextItem[]): string {
  let text = ''
  let lastItem: TextItem | undefined
  textItems.forEach(textItem => {
    let textToAdd = textItem.text
    if (!text.endsWith(' ') && !textToAdd.startsWith(' ')) {
      if (lastItem) {
        const xDistance = textItem.x - lastItem.x - lastItem.width
        if (xDistance > 5) {
          text += ' '
        }
      } else {
        if (isListItemCharacter(textItem.text)) {
          textToAdd += ' '
        }
      }
    }
    text += textToAdd
    lastItem = textItem
  })
  return text
} 
