const { removeLeadingWhitespaces, removeTrailingWhitespaces, isNumber } = require('./string-functions')

/**
 * Returns an index number for start/end of search
 *
 * @param {number} numerator - arbitrary number to search
 * @param {number} denominator - arbitrary number to search
 * @param {number} length - length of textContent.items array
 *
 * @returns {number} A range of where to loop and search
 */
const searchRange = (numerator, denominator, length) => {
  return Math.floor(numerator / denominator * length)
}

/**
 * Mutates and returns an object that contains key pair value of pageIndex : pageNum
 *
 * @param {array} range
 * @param {object} pageIndexNumMap object
 * @param {number} pageIndex - index of the page
 *
 * @returns {object} pageIndexNumMap object
 */
const searchArea = (range, pageIndexNumMap, pageIndex) => {
  for (const { str } of range) {
    const trimLeadingWhitespaces = removeLeadingWhitespaces(str)
    const trimWhitespaces = removeTrailingWhitespaces(trimLeadingWhitespaces)
    if (isNumber(trimWhitespaces)) {
      if (!pageIndexNumMap[pageIndex]) {
        pageIndexNumMap[pageIndex] = []
      }
      pageIndexNumMap[pageIndex].push(Number(trimWhitespaces))
    }
  }
  return pageIndexNumMap
}

/**
 * Searches both top and bottom area and returns an object
 *
 * @param {object} pageIndexNumMap object
 * @param {number} pageIndex - index of the page
 * @param {array} items - textContent.items
 *
 * @returns {object} pageIndexNumMap object
 */
exports.findPageNumbers = (pageIndexNumMap, pageIndex, items) => {
  const topArea = searchRange(1, 6, items.length)
  const bottomArea = searchRange(5, 6, items.length)

  const topAreaResult = searchArea(items.slice(0, topArea), pageIndexNumMap, pageIndex)
  return searchArea(items.slice(bottomArea), topAreaResult, pageIndex)
}

/**
 * Checks when the page number first begins and returns it
 *
 * @param {object} pageIndexNumMap object
 *
 * @returns {object} For example { pageIndex: 10, pageNum: 3 }
 */
exports.findFirstPage = (pageIndexNumMap) => {
  let counter = 0
  const keys = Object.keys(pageIndexNumMap)

  for (let x = 0; x < keys.length; x++) {
    const firstPage = pageIndexNumMap[keys[x]]
    const secondPage = pageIndexNumMap[keys[x + 1]]
    const prevCounter = counter
    if (typeof firstPage == 'undefined' || typeof secondPage == 'undefined'){
      break
    }
    for (let y = 0; y < firstPage.length && counter < 2; y++) {
      for (let z = 0; z < secondPage.length && counter < 2; z++) {
        const pageDifference = keys[x + 1] - keys[x]
        if (firstPage[y] + 1 === secondPage[z]) {
          counter++
        } else if (pageDifference > 1 && firstPage[y] + pageDifference === secondPage[z]) {
          counter++
        }
      }
    }

    let pageDetails = (x > 0) ? Object.entries(pageIndexNumMap)[x - 1] : Object.entries(pageIndexNumMap)[x]
    if (prevCounter === counter) {
      counter = 0
      pageDetails = Object.entries(pageIndexNumMap)[x]
    } else if (counter >= 2) {
      return { pageIndex: Number(pageDetails[0]), pageNum: pageDetails[1][0] }
    }
  }
}

/**
 * Return textContent with items that have pageNum removed
 *
 * @param {object} textContent object
 * @param {number} pageNum
 *
 * @returns {object} filteredContent - textContent without items that have pageNum
 */
exports.removePageNumber = (textContent, pageNum) => {
  const filteredContent = { items: [...textContent.items] }
  const topArea = searchRange(1, 6, filteredContent.items.length)
  const bottomArea = searchRange(5, 6, filteredContent.items.length)

  filteredContent.items = filteredContent.items.filter((item, index) => {
    const isAtTop = index > 0 && index < topArea
    const isAtBottom = index > bottomArea && index < filteredContent.items.length

    return (isAtTop || isAtBottom) ? Number(item.str) !== Number(pageNum) : item
  })
  return filteredContent
}
