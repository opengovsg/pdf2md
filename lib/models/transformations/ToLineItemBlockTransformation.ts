import Transformation from './Transformation'
import LineItemBlock from '../LineItemBlock'
import { REMOVED_ANNOTATION } from '../Annotation'
import ParseResult from '../ParseResult'

// Abstract class for transformations producing LineItemBlock(s) to be shown in the LineItemBlockPageView
export default abstract class ToLineItemBlockTransformation extends Transformation {
  constructor(name: string) {
    super(name, LineItemBlock.name)
    if (this.constructor === ToLineItemBlockTransformation) {
      throw new TypeError('Can not construct abstract class.')
    }
  }

  completeTransform(parseResult: ParseResult): ParseResult {
    // The usual cleanup
    parseResult.messages = []
    parseResult.pages.forEach(page => {
      page.items = page.items.filter(item => !item.annotation || item.annotation !== REMOVED_ANNOTATION)
      page.items.forEach(item => {
        item.annotation = undefined
      })
    })
    return parseResult
  }

  abstract transform(parseResult: ParseResult): ParseResult
} 
