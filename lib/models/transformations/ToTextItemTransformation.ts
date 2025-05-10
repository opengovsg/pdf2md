import Transformation from './Transformation'
import TextItem from '../TextItem'
import { REMOVED_ANNOTATION } from '../Annotation'
import ParseResult from '../ParseResult'

// Abstract class for transformations producing TextItem(s) to be shown in the TextItemPageView
export default abstract class ToTextItemTransformation extends Transformation {
  constructor(name: string) {
    super(name, TextItem.name)
    if (this.constructor === ToTextItemTransformation) {
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
