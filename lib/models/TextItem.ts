import PageItem, { PageItemOptions } from './PageItem'

export interface TextItemOptions extends PageItemOptions {
  x: number
  y: number
  width: number
  height: number
  text: string
  font?: string
  lineFormat?: string
  unopenedFormat?: string[]
  unclosedFormat?: string[]
}

// A text item, i.e. a line or a word within a page
export default class TextItem extends PageItem {
  x: number
  y: number
  width: number
  height: number
  text: string
  font?: string
  lineFormat?: string
  unopenedFormat?: string[]
  unclosedFormat?: string[]

  constructor(options: TextItemOptions) {
    super(options)
    this.x = options.x
    this.y = options.y
    this.width = options.width
    this.height = options.height
    this.text = options.text
    this.font = options.font
    this.lineFormat = options.lineFormat
    this.unopenedFormat = options.unopenedFormat
    this.unclosedFormat = options.unclosedFormat
  }
} 
