const CalculateGlobalStats = require('../models/transformations/text-item/CalculateGlobalStats')

const CompactLines = require('../models/transformations/line-item/CompactLines')
const RemoveRepetitiveElements = require('../models/transformations/line-item/RemoveRepetitiveElements')
const VerticalToHorizontal = require('../models/transformations/line-item/VerticalToHorizontal')
const DetectTOC = require('../models/transformations/line-item/DetectTOC')
const DetectListItems = require('../models/transformations/line-item/DetectListItems')
const DetectHeaders = require('../models/transformations/line-item/DetectHeaders')

const GatherBlocks = require('../models/transformations/line-item-block/GatherBlocks')
const DetectCodeQuoteBlocks = require('../models/transformations/line-item-block/DetectCodeQuoteBlocks')
const DetectListLevels = require('../models/transformations/line-item-block/DetectListLevels')
const ToTextBlocks = require('../models/transformations/ToTextBlocks')
const ToMarkdown = require('../models/transformations/ToMarkdown')

const ParseResult = require('../models/ParseResult')

exports.makeTransformations = fontMap => [
  new CalculateGlobalStats(fontMap),
  new CompactLines(),
  new RemoveRepetitiveElements(),
  new VerticalToHorizontal(),
  new DetectTOC(),
  new DetectHeaders(),
  new DetectListItems(),

  new GatherBlocks(),
  new DetectCodeQuoteBlocks(),
  new DetectListLevels(),

  new ToTextBlocks(),
  new ToMarkdown(),
]

exports.transform = (pages, transformations) => {
  var parseResult = new ParseResult({ pages })
  let lastTransformation
  transformations.forEach(transformation => {
    if (lastTransformation) {
      parseResult = lastTransformation.completeTransform(parseResult)
    }
    parseResult = transformation.transform(parseResult)
    lastTransformation = transformation
  })
  return parseResult
}
