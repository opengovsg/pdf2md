const { Enum } = require('enumify')

// An Markdown word element
class WordType extends Enum {

}

module.exports = WordType

WordType.initEnum({
  LINK: {
    toText (string) {
      return `[${string}](${string})`
    },
  },
  FOOTNOTE_LINK: {
    attachWithoutWhitespace: true,
    plainTextFormat: true,
    toText (string) {
      return `^${string}`
    // return `<sup>[${string}](#${string})</sup>`
    },
  },
  FOOTNOTE: {
    toText (string) {
      return `(^${string})`
    },
  },
})
