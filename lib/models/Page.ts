import PageItem from './PageItem'

export interface PageOptions {
  index: number
  items?: PageItem[]
}

// A page which holds PageItems displayable via PdfPageView
export default class Page {
  index: number
  items: PageItem[]

  constructor(options: PageOptions) {
    this.index = options.index
    this.items = options.items || []
  }
} 
