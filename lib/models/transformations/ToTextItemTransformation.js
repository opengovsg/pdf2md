// @flow

/*::
import ParseResult from '../ParseResult'
*/

const Transformation = require('./Transformation')
const TextItem = require('../TextItem')
const { REMOVED_ANNOTATION } = require('../Annotation')

// Abstract class for transformations producing TextItem(s) to be shown in the TextItemPageView
module.exports = class ToTextItemTransformation extends Transformation {
  constructor (name) {
    super(name, TextItem.name)
    if (this.constructor === ToTextItemTransformation) {
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
