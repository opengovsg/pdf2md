const PageItem = require('./PageItem')
const Word = require('./Word')

// A line within a page
module.exports = class LineItem extends PageItem {
  constructor (options) {
    super(options)
    this.x = options.x
    this.y = options.y
    this.width = options.width
    this.height = options.height
    this.words = options.words || []
    if (options.text && !options.words) {
      this.words = options.text.split(' ')
        .filter(string => string.trim().length > 0)
        .map(wordAsString => new Word({
          string: wordAsString,
        }))
    }
  }

  text () {
    return this.wordStrings().join(' ')
  }

  wordStrings () {
    return this.words.map(word => word.string)
  }
}
