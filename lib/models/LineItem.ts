import PageItem, { PageItemOptions } from './PageItem'
import Word from './Word'

export interface LineItemOptions extends PageItemOptions {
  x?: number
  y?: number
  width?: number
  height?: number
  words?: Word[]
  text?: string
}

// A line within a page
export default class LineItem extends PageItem {
  x: number
  y: number
  width: number
  height: number
  words: Word[]

  constructor(options: LineItemOptions) {
    super(options)
    this.x = options.x ?? 0
    this.y = options.y ?? 0
    this.width = options.width ?? 0
    this.height = options.height ?? 0
    this.words = options.words || []
    if (options.text && !options.words) {
      this.words = options.text.split(' ')
        .filter(string => string.trim().length > 0)
        .map(wordAsString => new Word({
          string: wordAsString,
        }))
    }
  }

  text(): string {
    return this.wordStrings().join(' ')
  }

  wordStrings(): string[] {
    return this.words.map(word => word.string)
  }
} 
