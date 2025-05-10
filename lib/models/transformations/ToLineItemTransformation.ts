import Transformation from './Transformation'
import LineItem from '../LineItem'
import { REMOVED_ANNOTATION } from '../Annotation'
import ParseResult from '../ParseResult'
import PageItem from '../PageItem'

// Abstract class for transformations producing LineItem(s) to be shown in the LineItemPageView
export default abstract class ToLineItemTransformation extends Transformation {
  constructor(name: string) {
    super(name, LineItem.name)
    if (this.constructor === ToLineItemTransformation) {
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
