// @flow

/*::
import ParseResult from '../ParseResult'
*/

const Transformation = require('./Transformation')
const LineItem = require('../LineItem')
const { REMOVED_ANNOTATION } = require('../Annotation')

// Abstract class for transformations producing LineItem(s) to be shown in the LineItemPageView
module.exports = class ToLineItemTransformation extends Transformation {
  constructor (name) {
    super(name, LineItem.name)
    if (this.constructor === ToLineItemTransformation) {
      throw new TypeError('Can not construct abstract class.')
    }
  }

  completeTransform (parseResult /*: ParseResult */) /*: ParseResult */ {
    // The usual cleanup
    parseResult.messages = []
    parseResult.pages.forEach(page => {
      page.items = page.items.filter(item => !item.annotation || item.annotation !== REMOVED_ANNOTATION)
      page.items.forEach(item => (item.annotation = null))
    })
    return parseResult
  }
}
