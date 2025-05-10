interface PDFMetadata {
  metadata?: {
    get(name: string): string | undefined
  }
  info?: {
    Title?: string
    Author?: string
    Creator?: string
    Producer?: string
  }
}

// Metadata of the PDF document
export default class Metadata {
  title?: string
  author?: string
  creator?: string
  producer?: string

  constructor(originalMetadata: PDFMetadata) {
    if (originalMetadata.metadata) {
      this.title = originalMetadata.metadata.get('dc:title')
      this.creator = originalMetadata.metadata.get('xap:creatortool')
      this.producer = originalMetadata.metadata.get('pdf:producer')
    } else if (originalMetadata.info) {
      this.title = originalMetadata.info.Title
      this.author = originalMetadata.info.Author
      this.creator = originalMetadata.info.Creator
      this.producer = originalMetadata.info.Producer
    }
  }
} 
