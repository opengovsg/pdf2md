import PageItem, { PageItemOptions } from './PageItem'
import LineItem from './LineItem'

export interface LineItemBlockOptions extends PageItemOptions {
  items?: LineItem[]
}

// A block of LineItem[] within a Page
export default class LineItemBlock extends PageItem {
  items: LineItem[]

  constructor(options: LineItemBlockOptions) {
    super(options)
    this.items = []
    if (options.items) {
      options.items.forEach(item => this.addItem(item))
    }
  }

  addItem(item: LineItem): void {
    if (this.type && item.type && this.type !== item.type) {
      throw new Error(`Adding item of type ${item.type} to block of type ${this.type}`)
    }
    if (!this.type) {
      this.type = item.type
    }
    if (item.parsedElements) {
      if (this.parsedElements) {
        this.parsedElements.add(item.parsedElements)
      } else {
        this.parsedElements = item.parsedElements
      }
    }
    const copiedItem = new LineItem({ ...item })
    copiedItem.type = undefined
    this.items.push(copiedItem)
  }
} 
