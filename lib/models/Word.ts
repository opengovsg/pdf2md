import WordType from './markdown/WordType'
import WordFormat from './markdown/WordFormat'

interface WordOptions {
  string: string
  type?: WordType
  format?: WordFormat
}

export default class Word {
  string: string
  type?: WordType
  format?: WordFormat

  constructor(options: WordOptions) {
    this.string = options.string
    this.type = options.type
    this.format = options.format
  }
}
