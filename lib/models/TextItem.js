const PageItem = require('./PageItem')

// A text item, i.e. a line or a word within a page
module.exports = class TextItem extends PageItem {
  constructor (options) {
    super(options)
    this.x = options.x
    this.y = options.y
    this.width = options.width
    this.height = options.height
    this.text = options.text
    this.font = options.font

    this.lineFormat = options.lineFormat
    this.unopenedFormat = options.unopenedFormat
    this.unclosedFormat = options.unclosedFormat
  }
}
