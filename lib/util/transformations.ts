import CalculateGlobalStats from '../models/transformations/text-item/CalculateGlobalStats'
import CompactLines from '../models/transformations/line-item/CompactLines'
import RemoveRepetitiveElements from '../models/transformations/line-item/RemoveRepetitiveElements'
import VerticalToHorizontal from '../models/transformations/line-item/VerticalToHorizontal'
import DetectTOC from '../models/transformations/line-item/DetectTOC'
import DetectListItems from '../models/transformations/line-item/DetectListItems'
import DetectHeaders from '../models/transformations/line-item/DetectHeaders'
import GatherBlocks from '../models/transformations/line-item-block/GatherBlocks'
import DetectCodeQuoteBlocks from '../models/transformations/line-item-block/DetectCodeQuoteBlocks'
import DetectListLevels from '../models/transformations/line-item-block/DetectListLevels'
import ToTextBlocks from '../models/transformations/ToTextBlocks'
import ToMarkdown from '../models/transformations/ToMarkdown'
import ParseResult from '../models/ParseResult'

export function makeTransformations(fontMap: Map<string, any>): any[] {
  return [
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
    new ToMarkdown()
  ]
}

export function transform(pages: any[], transformations: any[]): any {
  let parseResult = new ParseResult({ pages })
  let lastTransformation: any
  transformations.forEach(transformation => {
    if (lastTransformation) {
      parseResult = lastTransformation.completeTransform(parseResult)
    }
    parseResult = transformation.transform(parseResult)
    lastTransformation = transformation
  })
  return parseResult
} 
