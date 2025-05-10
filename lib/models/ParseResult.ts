import Page from './Page'

export interface ParseResultOptions {
  pages: Page[]
  globals?: Record<string, any>
  messages?: string[]
}

// The result of a PDF parse respectively a Transformation
export default class ParseResult {
  pages: Page[]
  globals?: Record<string, any>
  messages?: string[]

  constructor(options: ParseResultOptions) {
    this.pages = options.pages
    this.globals = options.globals
    this.messages = options.messages
  }
} 
