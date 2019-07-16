// @flow

/*::
import ParseResult from '../../ParseResult'
*/

const Transformation = require('./Transformation')
const LineItemBlock = require('../LineItemBlock')
const { REMOVED_ANNOTATION } = require('../Annotation')

// Abstract class for transformations producing LineItemBlock(s) to be shown in the LineItemBlockPageView
module.exports = class ToLineItemBlockTransformation extends Transformation {
  constructor (name) {
    super(name, LineItemBlock.name)
    if (this.constructor === ToLineItemBlockTransformation) {
      throw new TypeError('Can not construct abstract class.')
    }
  }

  completeTransform (parseResult /*: ParseResult */) /*: ParseResult */{
    // The usual cleanup
    parseResult.messages = []
    parseResult.pages.forEach(page => {
      page.items = page.items.filter(item => !item.annotation || item.annotation !== REMOVED_ANNOTATION)
      page.items.forEach(item => (item.annotation = null))
    })
    return parseResult
  }
}
