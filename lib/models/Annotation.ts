export interface AnnotationOptions {
  category: string
  color: string
}

class Annotation {
  category: string
  color: string

  constructor(options: AnnotationOptions) {
    this.category = options.category
    this.color = options.color
  }
}

export default Annotation

export const ADDED_ANNOTATION = new Annotation({
  category: 'Added',
  color: 'green',
})

export const REMOVED_ANNOTATION = new Annotation({
  category: 'Removed',
  color: 'red',
})

export const UNCHANGED_ANNOTATION = new Annotation({
  category: 'Unchanged',
  color: 'brown',
})

export const DETECTED_ANNOTATION = new Annotation({
  category: 'Detected',
  color: 'green',
})

export const MODIFIED_ANNOTATION = new Annotation({
  category: 'Modified',
  color: 'green',
}) 
