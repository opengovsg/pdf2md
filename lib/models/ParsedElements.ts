export interface FootnoteLink {
  // Add appropriate properties based on your application
  id: string
  [key: string]: any
}

export interface Footnote {
  // Add appropriate properties based on your application
  id: string
  [key: string]: any
}

export interface ParsedElementsOptions {
  footnoteLinks?: FootnoteLink[]
  footnotes?: Footnote[]
  containLinks?: boolean
  formattedWords?: number
}

export default class ParsedElements {
  footnoteLinks: FootnoteLink[]
  footnotes: Footnote[]
  containLinks?: boolean
  formattedWords?: number

  constructor(options: ParsedElementsOptions = {}) {
    this.footnoteLinks = options.footnoteLinks || []
    this.footnotes = options.footnotes || []
    this.containLinks = options.containLinks
    this.formattedWords = options.formattedWords
  }

  add(parsedElements: ParsedElements): void {
    this.footnoteLinks = this.footnoteLinks.concat(parsedElements.footnoteLinks)
    this.footnotes = this.footnotes.concat(parsedElements.footnotes)
    this.containLinks = this.containLinks || parsedElements.containLinks
    this.formattedWords = (this.formattedWords || 0) + (parsedElements.formattedWords || 0)
  }
} 
