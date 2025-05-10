import Annotation from './Annotation'
import ParsedElements from './ParsedElements'

export interface PageItemOptions {
  type?: string | any
  annotation?: Annotation
  parsedElements?: ParsedElements
}

// An abstract PageItem class, can be TextItem, LineItem or LineItemBlock
export default abstract class PageItem {
  type?: string | any
  annotation?: Annotation
  parsedElements?: ParsedElements

  constructor(options: PageItemOptions) {
    if (this.constructor === PageItem) {
      throw new TypeError('Can not construct abstract class.')
    }
    this.type = options.type
    this.annotation = options.annotation
    this.parsedElements = options.parsedElements
  }
} 
