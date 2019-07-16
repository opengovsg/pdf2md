// Annotation for a text item
class Annotation {
  constructor (options) {
    this.category = options.category
    this.color = options.color
  }
}

exports.default = Annotation

exports.ADDED_ANNOTATION = new Annotation({
  category: 'Added',
  color: 'green',
})

exports.REMOVED_ANNOTATION = new Annotation({
  category: 'Removed',
  color: 'red',
})

exports.UNCHANGED_ANNOTATION = new Annotation({
  category: 'Unchanged',
  color: 'brown',
})

exports.DETECTED_ANNOTATION = new Annotation({
  category: 'Detected',
  color: 'green',
})

exports.MODIFIED_ANNOTATION = new Annotation({
  category: 'Modified',
  color: 'green',
})
