const { parse } = require('./util/pdf')
const { makeTransformations, transform } = require('./util/transformations')

/**
 * Reads a
 * @param {string|TypedArray|DocumentInitParameters|PDFDataRangeTransport} pdfBuffer
 * Passed to `pdfjs.getDocument()` to read a PDF document for conversion
 *
 * @param {Object} [callbacks]
 * Optional. A collection of callbacks to invoke when
 * elements within the PDF document are parsed
 * @param {Function} [callbacks.metadataParsed]
 * @param {Function} [callbacks.pageParsed]
 * @param {Function} [callbacks.fontParsed]
 * @param {Function} [callbacks.documentParsed]
 *
 * @returns {Promise<string>} The Markdown text
 */
module.exports = async function (pdfBuffer, callbacks) {
  const result = await parse(pdfBuffer, callbacks)
  const { fonts, pages } = result
  const transformations = makeTransformations(fonts.map)
  const parseResult = transform(pages, transformations)
  const text = parseResult.pages
    .map(page => page.items.join('\n') + '\n')
    .join('')
  return text
}
