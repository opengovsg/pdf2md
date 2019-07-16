// A page which holds PageItems displayable via PdfPageView
module.exports = class Page {
  constructor (options) {
    this.index = options.index
    this.items = options.items || [] // PageItem
  }
}
