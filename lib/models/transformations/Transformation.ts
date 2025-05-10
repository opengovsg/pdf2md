import ParseResult from '../ParseResult'

// A transformation from a PDF page to a PDF page
export default abstract class Transformation {
  name: string
  itemType: string

  constructor(name: string, itemType: string) {
    if (this.constructor === Transformation) {
      throw new TypeError('Can not construct abstract class.')
    }
    if (this.transform === Transformation.prototype.transform) {
      throw new TypeError("Please implement abstract method 'transform()'.")
    }
    this.name = name
    this.itemType = itemType
  }

  // Transform an incoming ParseResult into an outgoing ParseResult
  abstract transform(parseResult: ParseResult): ParseResult

  // Sometimes the transform() does only visualize a change. This methods then does the actual change.
  completeTransform(parseResult: ParseResult): ParseResult {
    parseResult.messages = []
    return parseResult
  }
} 
